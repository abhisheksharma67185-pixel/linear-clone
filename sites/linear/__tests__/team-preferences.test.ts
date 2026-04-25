/**
 * Unit tests for the per-team preferences store backing the team-row
 * dropdown menu in the workspace sidebar.
 *
 * Pins three concerns the spec requires:
 *   - Subscribe submenu: schema is { teamId, events[] } with valid
 *     event types only, and toggles persist across save/load.
 *   - Favorites: per-team boolean toggle persists.
 *   - Hidden teams: setTeamHidden(true) marks a team to vanish from
 *     the sidebar (the spec's "Hide team from sidebar" item).
 *
 * vitest runs in `node` env, so we stub a minimal `window` with
 * localStorage + the change-event surface the store dispatches on.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  ALL_SUBSCRIBE_EVENTS,
  DEFAULT_TEAM_PREFERENCES,
  getSubscribeEvents,
  isFavoriteTeam,
  isSubscribed,
  isTeamHidden,
  loadTeamPreferences,
  saveTeamPreferences,
  setTeamHidden,
  SUBSCRIBE_EVENT_LABELS,
  toggleFavoriteTeam,
  toggleSubscribeEvent,
  type TeamPreferences,
  type TeamSubscribeEvent,
} from "../lib/team-preferences"

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

// ─── Schema ────────────────────────────────────────────────────────────

describe("subscribe event schema", () => {
  it("ALL_SUBSCRIBE_EVENTS contains the three documented events", () => {
    expect(new Set(ALL_SUBSCRIBE_EVENTS)).toEqual(
      new Set(["issue_added", "issue_completed", "issue_triaged"])
    )
  })

  it("every event has a human-readable label", () => {
    for (const event of ALL_SUBSCRIBE_EVENTS) {
      expect(SUBSCRIBE_EVENT_LABELS[event]).toMatch(/\w+/)
    }
  })
})

// ─── Subscribe behavior ────────────────────────────────────────────────

describe("toggleSubscribeEvent", () => {
  it("adds an event when not present", () => {
    const next = toggleSubscribeEvent(
      DEFAULT_TEAM_PREFERENCES,
      "team-1",
      "issue_added"
    )
    expect(getSubscribeEvents(next, "team-1")).toEqual(["issue_added"])
  })

  it("removes an event when already present", () => {
    let prefs: TeamPreferences = DEFAULT_TEAM_PREFERENCES
    prefs = toggleSubscribeEvent(prefs, "team-1", "issue_added")
    prefs = toggleSubscribeEvent(prefs, "team-1", "issue_added")
    expect(getSubscribeEvents(prefs, "team-1")).toEqual([])
  })

  it("scopes events to the targeted team only", () => {
    let prefs: TeamPreferences = DEFAULT_TEAM_PREFERENCES
    prefs = toggleSubscribeEvent(prefs, "team-1", "issue_added")
    prefs = toggleSubscribeEvent(prefs, "team-2", "issue_completed")
    expect(getSubscribeEvents(prefs, "team-1")).toEqual(["issue_added"])
    expect(getSubscribeEvents(prefs, "team-2")).toEqual(["issue_completed"])
  })

  it("isSubscribed reflects the current state", () => {
    let prefs: TeamPreferences = DEFAULT_TEAM_PREFERENCES
    expect(isSubscribed(prefs, "team-1", "issue_added")).toBe(false)
    prefs = toggleSubscribeEvent(prefs, "team-1", "issue_added")
    expect(isSubscribed(prefs, "team-1", "issue_added")).toBe(true)
  })

  it("subscribe state persists per team across save/load", () => {
    let prefs = loadTeamPreferences()
    prefs = toggleSubscribeEvent(prefs, "team-A", "issue_added")
    prefs = toggleSubscribeEvent(prefs, "team-A", "issue_triaged")
    saveTeamPreferences(prefs)

    const reloaded = loadTeamPreferences()
    expect(getSubscribeEvents(reloaded, "team-A").sort()).toEqual([
      "issue_added",
      "issue_triaged",
    ])
  })
})

// ─── Favorites behavior ────────────────────────────────────────────────

describe("toggleFavoriteTeam", () => {
  it("adds the team to favorites when absent", () => {
    const next = toggleFavoriteTeam(DEFAULT_TEAM_PREFERENCES, "team-1")
    expect(isFavoriteTeam(next, "team-1")).toBe(true)
  })

  it("removes the team from favorites when present", () => {
    let prefs: TeamPreferences = DEFAULT_TEAM_PREFERENCES
    prefs = toggleFavoriteTeam(prefs, "team-1")
    prefs = toggleFavoriteTeam(prefs, "team-1")
    expect(isFavoriteTeam(prefs, "team-1")).toBe(false)
  })

  it("favorites persist across save/load", () => {
    let prefs = loadTeamPreferences()
    prefs = toggleFavoriteTeam(prefs, "fav-team")
    saveTeamPreferences(prefs)
    expect(isFavoriteTeam(loadTeamPreferences(), "fav-team")).toBe(true)
  })
})

// ─── Hide team behavior ───────────────────────────────────────────────

describe("setTeamHidden", () => {
  it("marks a team as hidden", () => {
    const next = setTeamHidden(DEFAULT_TEAM_PREFERENCES, "team-1", true)
    expect(isTeamHidden(next, "team-1")).toBe(true)
  })

  it("unhides a team that was hidden", () => {
    let prefs: TeamPreferences = DEFAULT_TEAM_PREFERENCES
    prefs = setTeamHidden(prefs, "team-1", true)
    prefs = setTeamHidden(prefs, "team-1", false)
    expect(isTeamHidden(prefs, "team-1")).toBe(false)
  })

  it("is a no-op when the requested state matches the current state", () => {
    const prefs = DEFAULT_TEAM_PREFERENCES
    expect(setTeamHidden(prefs, "team-1", false)).toBe(prefs)
    const hidden = setTeamHidden(prefs, "team-1", true)
    expect(setTeamHidden(hidden, "team-1", true)).toBe(hidden)
  })

  it("hidden state persists across save/load", () => {
    let prefs = loadTeamPreferences()
    prefs = setTeamHidden(prefs, "hidden-team", true)
    saveTeamPreferences(prefs)
    expect(isTeamHidden(loadTeamPreferences(), "hidden-team")).toBe(true)
  })
})

// ─── Persistence robustness ───────────────────────────────────────────

describe("loadTeamPreferences resilience", () => {
  it("returns defaults when localStorage is empty", () => {
    const loaded = loadTeamPreferences()
    expect(loaded.subscribeEvents).toEqual({})
    expect(loaded.favoriteTeamIds).toEqual([])
    expect(loaded.hiddenTeamIds).toEqual([])
  })

  it("falls back to defaults on corrupted JSON", () => {
    ;(window as unknown as { localStorage: LocalStorageStub }).localStorage.setItem(
      "team:preferences:v1",
      "{not json"
    )
    const loaded = loadTeamPreferences()
    expect(loaded).toEqual({
      subscribeEvents: {},
      favoriteTeamIds: [],
      hiddenTeamIds: [],
    })
  })

  it("filters out unknown event values from persisted payload", () => {
    ;(window as unknown as { localStorage: LocalStorageStub }).localStorage.setItem(
      "team:preferences:v1",
      JSON.stringify({
        subscribeEvents: {
          "team-1": ["issue_added", "garbage_event", "issue_completed"],
        },
        favoriteTeamIds: ["team-1", 42, ""],
        hiddenTeamIds: null,
      })
    )
    const loaded = loadTeamPreferences()
    expect(loaded.subscribeEvents["team-1"].sort()).toEqual([
      "issue_added",
      "issue_completed",
    ])
    expect(loaded.favoriteTeamIds).toEqual(["team-1"])
    expect(loaded.hiddenTeamIds).toEqual([])
  })

  it("subscribeEvents type-narrows correctly", () => {
    let prefs = loadTeamPreferences()
    prefs = toggleSubscribeEvent(prefs, "team-X", "issue_completed")
    saveTeamPreferences(prefs)
    const reloaded = loadTeamPreferences()
    const events: TeamSubscribeEvent[] = reloaded.subscribeEvents["team-X"]
    expect(events).toContain("issue_completed")
  })
})
