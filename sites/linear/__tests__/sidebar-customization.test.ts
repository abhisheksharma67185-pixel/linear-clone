/**
 * Unit tests for the sidebar customization store.
 *
 * Pins the four invariants the spec requires:
 *   (a) Every default item carries one of the three valid visibility
 *       values, and the visibility predicate handles all three +
 *       the badge signal correctly.
 *   (b) Reordering persists across save/load (the "reordering
 *       persists after closing/reopening the modal" test from the
 *       spec is verified here at the store level).
 *   (c) "Don't show" makes `shouldRenderSidebarItem` return false,
 *       which the sidebar uses to collapse the row immediately.
 *   (d) `resetSidebarCustomization` restores every item to its
 *       default visibility AND order.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  DEFAULT_BADGE_STYLE,
  DEFAULT_SIDEBAR_LAYOUT,
  loadSidebarCustomization,
  reorderItems,
  resetSidebarCustomization,
  saveSidebarCustomization,
  setBadgeStyle,
  setItemVisibility,
  shouldRenderSidebarItem,
  type SidebarCustomization,
  type SidebarVisibility,
} from "../lib/sidebar-customization"

// ─── localStorage stub ───────────────────────────────────────────────────
// vitest runs in `node` env so `window` is undefined. The store guards
// against that, but we want to exercise the persistence path. Stub a
// minimal `window` with a working localStorage and a no-op event API.

interface LocalStorageStub {
  store: Record<string, string>
  getItem(k: string): string | null
  setItem(k: string, v: string): void
  removeItem(k: string): void
}

function makeWindowStub() {
  const ls: LocalStorageStub = {
    store: {},
    getItem(k: string) {
      return Object.prototype.hasOwnProperty.call(this.store, k)
        ? this.store[k]
        : null
    },
    setItem(k: string, v: string) {
      this.store[k] = v
    },
    removeItem(k: string) {
      delete this.store[k]
    },
  }
  return {
    localStorage: ls,
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
    CustomEvent: class CustomEventStub {
      type: string
      constructor(type: string) {
        this.type = type
      }
    },
  }
}

beforeEach(() => {
  vi.stubGlobal("window", makeWindowStub())
  vi.stubGlobal(
    "CustomEvent",
    (vi.mocked(globalThis.CustomEvent) as unknown as typeof CustomEvent) ??
      class {
        type: string
        constructor(type: string) {
          this.type = type
        }
      }
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─── Schema correctness ─────────────────────────────────────────────────

describe("DEFAULT_SIDEBAR_LAYOUT schema", () => {
  it("every default item has a valid visibility value", () => {
    const valid: SidebarVisibility[] = ["always", "badged", "never"]
    for (const item of DEFAULT_SIDEBAR_LAYOUT) {
      expect(valid).toContain(item.visibility)
    }
  })

  it("every default item has a section in {personal, workspace}", () => {
    for (const item of DEFAULT_SIDEBAR_LAYOUT) {
      expect(["personal", "workspace"]).toContain(item.section)
    }
  })

  it("item keys are unique", () => {
    const keys = DEFAULT_SIDEBAR_LAYOUT.map((i) => i.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

// ─── Visibility predicate ───────────────────────────────────────────────

describe("shouldRenderSidebarItem", () => {
  it("'always' always renders, regardless of badge state", () => {
    expect(shouldRenderSidebarItem("always", false)).toBe(true)
    expect(shouldRenderSidebarItem("always", true)).toBe(true)
  })

  it("'never' never renders, regardless of badge state", () => {
    expect(shouldRenderSidebarItem("never", false)).toBe(false)
    expect(shouldRenderSidebarItem("never", true)).toBe(false)
  })

  it("'badged' renders only when the row has a badge", () => {
    expect(shouldRenderSidebarItem("badged", false)).toBe(false)
    expect(shouldRenderSidebarItem("badged", true)).toBe(true)
  })
})

// ─── Pure mutation helpers ──────────────────────────────────────────────

describe("setItemVisibility", () => {
  it("returns a new config with the targeted item's visibility changed", () => {
    const initial: SidebarCustomization = {
      items: [...DEFAULT_SIDEBAR_LAYOUT],
      badgeStyle: DEFAULT_BADGE_STYLE,
    }
    const next = setItemVisibility(initial, "inbox", "never")
    expect(next).not.toBe(initial)
    expect(next.items.find((i) => i.key === "inbox")?.visibility).toBe("never")
    // Other items are unchanged.
    expect(next.items.find((i) => i.key === "projects")?.visibility).toBe(
      initial.items.find((i) => i.key === "projects")?.visibility
    )
  })
})

describe("setBadgeStyle", () => {
  it("returns a new config with the badge style updated", () => {
    const initial: SidebarCustomization = {
      items: [...DEFAULT_SIDEBAR_LAYOUT],
      badgeStyle: "count",
    }
    const next = setBadgeStyle(initial, "dot")
    expect(next.badgeStyle).toBe("dot")
    // Items unchanged.
    expect(next.items).toBe(initial.items)
  })
})

describe("reorderItems", () => {
  it("moves an item to a new index within the same array", () => {
    const initial: SidebarCustomization = {
      items: [...DEFAULT_SIDEBAR_LAYOUT],
      badgeStyle: DEFAULT_BADGE_STYLE,
    }
    const fromKey = initial.items[0].key
    const next = reorderItems(initial, fromKey, 2)
    expect(next.items[2].key).toBe(fromKey)
  })

  it("moves an item across sections when targetSection is provided", () => {
    const initial: SidebarCustomization = {
      items: [...DEFAULT_SIDEBAR_LAYOUT],
      badgeStyle: DEFAULT_BADGE_STYLE,
    }
    // Move an inbox row (personal) into workspace.
    const next = reorderItems(initial, "inbox", 0, "workspace")
    const moved = next.items.find((i) => i.key === "inbox")
    expect(moved?.section).toBe("workspace")
  })

  it("is a no-op when fromKey doesn't exist", () => {
    const initial: SidebarCustomization = {
      items: [...DEFAULT_SIDEBAR_LAYOUT],
      badgeStyle: DEFAULT_BADGE_STYLE,
    }
    const next = reorderItems(initial, "missing", 0)
    expect(next).toBe(initial)
  })
})

// ─── Persistence ────────────────────────────────────────────────────────

describe("save / load round-trip", () => {
  it("persisted reorders survive a fresh load (regression test for spec 8(b))", () => {
    const initial = loadSidebarCustomization()
    const reordered = reorderItems(initial, initial.items[0].key, 4)
    saveSidebarCustomization(reordered)

    const loaded = loadSidebarCustomization()
    expect(loaded.items.map((i) => i.key)).toEqual(
      reordered.items.map((i) => i.key)
    )
  })

  it("persisted visibility changes survive a fresh load", () => {
    const initial = loadSidebarCustomization()
    const next = setItemVisibility(initial, "projects", "never")
    saveSidebarCustomization(next)

    const loaded = loadSidebarCustomization()
    expect(loaded.items.find((i) => i.key === "projects")?.visibility).toBe(
      "never"
    )
  })

  it("badgeStyle round-trips", () => {
    saveSidebarCustomization({
      ...loadSidebarCustomization(),
      badgeStyle: "dot",
    })
    expect(loadSidebarCustomization().badgeStyle).toBe("dot")
  })

  it("invalid persisted payload falls back to defaults", () => {
    // Manually plant a corrupt value.
    ;(
      window as unknown as { localStorage: LocalStorageStub }
    ).localStorage.setItem("sidebar:customization:v1", "{not json")
    const loaded = loadSidebarCustomization()
    expect(loaded.items.length).toBe(DEFAULT_SIDEBAR_LAYOUT.length)
    expect(loaded.badgeStyle).toBe(DEFAULT_BADGE_STYLE)
  })

  it("missing items in storage are appended from defaults (forward-compat)", () => {
    // Persist only the first two items; the loader should re-append
    // the rest from DEFAULT_SIDEBAR_LAYOUT so the user never loses
    // access to a newly-shipped item.
    const partial = {
      items: DEFAULT_SIDEBAR_LAYOUT.slice(0, 2).map((i) => ({ ...i })),
      badgeStyle: DEFAULT_BADGE_STYLE,
    }
    saveSidebarCustomization(partial as SidebarCustomization)
    const loaded = loadSidebarCustomization()
    expect(loaded.items.map((i) => i.key)).toEqual(
      DEFAULT_SIDEBAR_LAYOUT.map((i) => i.key)
    )
  })
})

// ─── Reset ──────────────────────────────────────────────────────────────

describe("resetSidebarCustomization", () => {
  it("restores every item to its default visibility and order", () => {
    const tampered = setItemVisibility(
      loadSidebarCustomization(),
      "inbox",
      "never"
    )
    saveSidebarCustomization(tampered)
    expect(
      loadSidebarCustomization().items.find((i) => i.key === "inbox")
        ?.visibility
    ).toBe("never")

    resetSidebarCustomization()

    const reset = loadSidebarCustomization()
    expect(reset.items.map((i) => i.key)).toEqual(
      DEFAULT_SIDEBAR_LAYOUT.map((i) => i.key)
    )
    expect(reset.items.map((i) => i.visibility)).toEqual(
      DEFAULT_SIDEBAR_LAYOUT.map((i) => i.visibility)
    )
    expect(reset.badgeStyle).toBe(DEFAULT_BADGE_STYLE)
  })
})
