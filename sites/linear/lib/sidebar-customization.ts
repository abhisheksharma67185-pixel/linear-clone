/**
 * Shared customization store for the workspace sidebar.
 *
 * Two consumers read from here:
 *   1. `AppSidebar` — applies `visibility` and `order` to its
 *      rendered nav items, hiding rows whose `visibility === 'never'`
 *      and toggling badged-only rows based on whether the row has a
 *      pending count (Inbox unread, etc.).
 *   2. `CustomizeSidebarDialog` — drives the modal UI: visibility
 *      dropdowns, drag-and-drop reordering, "Reset to default".
 *
 * The store is intentionally framework-light: pure functions for
 * load / save / reset / mutate, plus a tiny React hook
 * `useSidebarCustomization()` that subscribes to a CustomEvent we
 * dispatch on writes. Living outside React state means the modal
 * and the sidebar stay in sync even though they don't share a
 * provider — both subscribe to the same store.
 *
 * Persistence: `localStorage["sidebar:customization:v1"]`. Bumping
 * the suffix invalidates old payloads if the schema changes.
 */
import { useEffect, useState } from "react"

const STORAGE_KEY = "sidebar:customization:v1"
const STORAGE_EVENT = "sidebar:customization:change"

export type SidebarVisibility = "always" | "badged" | "never"
export type SidebarSection = "personal" | "workspace"

export interface SidebarItem {
  /** Stable identifier used by the sidebar to find its render entry. */
  key: string
  /** Display label shown in the customization modal AND the sidebar. */
  label: string
  /** Which section the item belongs to in both surfaces. */
  section: SidebarSection
  /**
   * Visibility rule:
   *   - `"always"` — render unconditionally.
   *   - `"badged"` — render only when the row has a non-zero badge
   *     count (e.g. Inbox unread, Drafts in progress).
   *   - `"never"` — never render.
   */
  visibility: SidebarVisibility
}

/**
 * The exhaustive default sidebar layout. Order in this array IS the
 * order in the rendered sidebar before any user reordering. Every
 * item carries all three visibility options (the bug we're fixing
 * was that several items shipped with a subset).
 */
export const DEFAULT_SIDEBAR_LAYOUT: readonly SidebarItem[] = [
  { key: "inbox", label: "Inbox", section: "personal", visibility: "always" },
  {
    key: "my-issues",
    label: "My Issues",
    section: "personal",
    visibility: "always",
  },
  {
    key: "drafts",
    label: "Drafts",
    section: "personal",
    visibility: "badged",
  },
  {
    key: "projects",
    label: "Projects",
    section: "workspace",
    visibility: "always",
  },
  {
    key: "views",
    label: "Views",
    section: "workspace",
    visibility: "always",
  },
  {
    key: "members",
    label: "Members",
    section: "workspace",
    visibility: "never",
  },
  {
    key: "initiatives",
    label: "Initiatives",
    section: "workspace",
    visibility: "never",
  },
  {
    key: "teams",
    label: "Teams",
    section: "workspace",
    visibility: "never",
  },
] as const

export type BadgeStyle = "count" | "dot"
export const DEFAULT_BADGE_STYLE: BadgeStyle = "count"

export interface SidebarCustomization {
  items: SidebarItem[]
  badgeStyle: BadgeStyle
}

export const DEFAULT_CUSTOMIZATION: SidebarCustomization = {
  items: [...DEFAULT_SIDEBAR_LAYOUT],
  badgeStyle: DEFAULT_BADGE_STYLE,
}

/** Valid visibility values used for runtime narrowing. */
const VALID_VISIBILITIES: ReadonlySet<string> = new Set([
  "always",
  "badged",
  "never",
])

/** Valid section values. */
const VALID_SECTIONS: ReadonlySet<string> = new Set(["personal", "workspace"])

// ─── Persistence ──────────────────────────────────────────────────────────

/**
 * Read the customization from localStorage. Validates each field —
 * an unknown visibility/section/key is replaced by the default for
 * that item. Items defined in DEFAULT_SIDEBAR_LAYOUT but missing
 * from the stored payload are appended at the end so a future
 * release that adds a new sidebar item still shows it for users
 * with persisted customization.
 */
export function loadSidebarCustomization(): SidebarCustomization {
  if (typeof window === "undefined") return cloneDefaults()
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return cloneDefaults()
  }
  if (!raw) return cloneDefaults()
  try {
    const parsed = JSON.parse(raw) as Partial<SidebarCustomization>
    const items = normalizeItems(parsed.items)
    const badgeStyle: BadgeStyle =
      parsed.badgeStyle === "dot" || parsed.badgeStyle === "count"
        ? parsed.badgeStyle
        : DEFAULT_BADGE_STYLE
    return { items, badgeStyle }
  } catch {
    return cloneDefaults()
  }
}

export function saveSidebarCustomization(value: SidebarCustomization): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Best-effort — Safari private mode etc.
  }
  // Notify in-memory subscribers (the React hook below) so the
  // sidebar repaints without needing a full reload.
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT))
}

export function resetSidebarCustomization(): SidebarCustomization {
  const defaults = cloneDefaults()
  saveSidebarCustomization(defaults)
  return defaults
}

// ─── Mutations (pure) ─────────────────────────────────────────────────────

export function setItemVisibility(
  current: SidebarCustomization,
  key: string,
  visibility: SidebarVisibility
): SidebarCustomization {
  return {
    ...current,
    items: current.items.map((item) =>
      item.key === key ? { ...item, visibility } : item
    ),
  }
}

export function setBadgeStyle(
  current: SidebarCustomization,
  badgeStyle: BadgeStyle
): SidebarCustomization {
  return { ...current, badgeStyle }
}

/**
 * Move an item to a target index. If `targetSection` is provided and
 * differs from the item's current section, the item moves across
 * sections — Linear allows cross-section drags within the customize
 * modal so we mirror that.
 */
export function reorderItems(
  current: SidebarCustomization,
  fromKey: string,
  toIndex: number,
  targetSection?: SidebarSection
): SidebarCustomization {
  const items = [...current.items]
  const fromIndex = items.findIndex((i) => i.key === fromKey)
  if (fromIndex < 0) return current
  const [moved] = items.splice(fromIndex, 1)
  const updated = targetSection ? { ...moved, section: targetSection } : moved
  // Clamp targetIndex into the new array bounds.
  const insertIndex = Math.max(0, Math.min(toIndex, items.length))
  items.splice(insertIndex, 0, updated)
  return { ...current, items }
}

// ─── React glue ───────────────────────────────────────────────────────────

/**
 * Hook used by both the customization modal and the sidebar to read
 * the current customization. Subscribes to:
 *   - The browser's `storage` event (other tabs writing to
 *     localStorage).
 *   - Our own custom in-tab event dispatched by `saveSidebarCustomization`.
 */
export function useSidebarCustomization(): SidebarCustomization {
  // SSR-safe initial: defaults render on the server, then the
  // effect syncs to localStorage on first client mount.
  const [value, setValue] = useState<SidebarCustomization>(() =>
    cloneDefaults()
  )
  useEffect(() => {
    const sync = () => setValue(loadSidebarCustomization())
    sync()
    window.addEventListener(STORAGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(STORAGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])
  return value
}

// ─── Predicates the sidebar uses to decide what to render ────────────────

/**
 * Decide whether a given sidebar item should render. `hasBadge` is
 * the per-item count signal (Inbox unread, Drafts in progress, etc.)
 * — pass `true` if the row currently has a non-zero badge value.
 *
 * This is the single function the sidebar consults; tests pin its
 * truth table so the rules can't drift.
 */
export function shouldRenderSidebarItem(
  visibility: SidebarVisibility,
  hasBadge: boolean
): boolean {
  switch (visibility) {
    case "always":
      return true
    case "never":
      return false
    case "badged":
      return hasBadge
  }
}

// ─── Internals ────────────────────────────────────────────────────────────

function cloneDefaults(): SidebarCustomization {
  return {
    items: DEFAULT_SIDEBAR_LAYOUT.map((i) => ({ ...i })),
    badgeStyle: DEFAULT_BADGE_STYLE,
  }
}

function normalizeItems(raw: unknown): SidebarItem[] {
  const fromStorage = Array.isArray(raw) ? raw : []
  const defaultsByKey = new Map(
    DEFAULT_SIDEBAR_LAYOUT.map((i) => [i.key, i] as const)
  )
  const seen = new Set<string>()
  const result: SidebarItem[] = []

  for (const candidate of fromStorage) {
    if (!candidate || typeof candidate !== "object") continue
    const c = candidate as Partial<SidebarItem>
    if (typeof c.key !== "string") continue
    const def = defaultsByKey.get(c.key)
    if (!def) continue // Item was removed in a newer schema.
    if (seen.has(c.key)) continue
    seen.add(c.key)
    const visibility =
      typeof c.visibility === "string" && VALID_VISIBILITIES.has(c.visibility)
        ? (c.visibility as SidebarVisibility)
        : def.visibility
    const section =
      typeof c.section === "string" && VALID_SECTIONS.has(c.section)
        ? (c.section as SidebarSection)
        : def.section
    result.push({
      key: c.key,
      label: def.label,
      section,
      visibility,
    })
  }

  // Append any default items that weren't in storage (e.g. a new
  // item shipped after the user customized) at the end of their
  // section so the user never loses access to a new feature.
  for (const def of DEFAULT_SIDEBAR_LAYOUT) {
    if (!seen.has(def.key)) result.push({ ...def })
  }
  return result
}

/** Test-only: clear persisted state. */
export function _resetForTests(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
}
