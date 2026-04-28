/**
 * Per-team UI preferences for the workspace sidebar's team-options
 * menu (the "..." dropdown next to each team name).
 *
 * Three concerns live here, all keyed by `teamId`:
 *
 *   1. **Subscribe events** — which event types the user wants to be
 *      notified about for this team. Schema:
 *        `{ teamId, events: ('issue_added' | 'issue_completed' | 'issue_triaged')[] }`
 *      Stored as a flat record `{ [teamId]: events[] }` for cheap
 *      reads. Persisted so subscribe choices survive a refresh.
 *
 *   2. **Favorites** — a per-team boolean toggled by the menu's
 *      "Add to favorites" / "Remove from favorites" item. Drives a
 *      star indicator next to the team name (future work).
 *
 *   3. **Hidden teams** — teams the user has hidden from the sidebar
 *      via the menu's "Hide team from sidebar" item. Equivalent to
 *      setting `visibility: "never"` for that team's row only — not
 *      a global sidebar-customisation change.
 *
 * All three are pure-function helpers + a React hook that subscribes
 * to a custom-event so the menu and sidebar stay in sync without a
 * provider.
 */
import { useEffect, useState } from "react"

const STORAGE_KEY = "team:preferences:v1"
const STORAGE_EVENT = "team:preferences:change"

export type TeamSubscribeEvent =
  | "issue_added"
  | "issue_completed"
  | "issue_triaged"

export const ALL_SUBSCRIBE_EVENTS: readonly TeamSubscribeEvent[] = [
  "issue_added",
  "issue_completed",
  "issue_triaged",
] as const

export const SUBSCRIBE_EVENT_LABELS: Record<TeamSubscribeEvent, string> = {
  issue_added: "Issue added",
  issue_completed: "Issue completed",
  issue_triaged: "Issue triaged",
}

export interface TeamPreferences {
  /** `subscribeEvents[teamId]` → array of subscribed events for that team. */
  subscribeEvents: Record<string, TeamSubscribeEvent[]>
  /** Set of team IDs the user has favorited. */
  favoriteTeamIds: string[]
  /** Set of team IDs hidden from the sidebar via the team menu. */
  hiddenTeamIds: string[]
}

export const DEFAULT_TEAM_PREFERENCES: TeamPreferences = {
  subscribeEvents: {},
  favoriteTeamIds: [],
  hiddenTeamIds: [],
}

const VALID_EVENTS: ReadonlySet<string> = new Set(ALL_SUBSCRIBE_EVENTS)

// ─── Persistence ──────────────────────────────────────────────────────────

export function loadTeamPreferences(): TeamPreferences {
  if (typeof window === "undefined") return cloneDefaults()
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return cloneDefaults()
  }
  if (!raw) return cloneDefaults()
  try {
    const parsed = JSON.parse(raw) as Partial<TeamPreferences>
    return {
      subscribeEvents: normalizeSubscribeEvents(parsed.subscribeEvents),
      favoriteTeamIds: normalizeStringArray(parsed.favoriteTeamIds),
      hiddenTeamIds: normalizeStringArray(parsed.hiddenTeamIds),
    }
  } catch {
    return cloneDefaults()
  }
}

export function saveTeamPreferences(value: TeamPreferences): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Best-effort.
  }
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT))
}

// ─── Pure mutation helpers ────────────────────────────────────────────────

export function getSubscribeEvents(
  prefs: TeamPreferences,
  teamId: string
): TeamSubscribeEvent[] {
  return prefs.subscribeEvents[teamId] ?? []
}

export function isSubscribed(
  prefs: TeamPreferences,
  teamId: string,
  event: TeamSubscribeEvent
): boolean {
  return getSubscribeEvents(prefs, teamId).includes(event)
}

export function toggleSubscribeEvent(
  prefs: TeamPreferences,
  teamId: string,
  event: TeamSubscribeEvent
): TeamPreferences {
  const current = getSubscribeEvents(prefs, teamId)
  const next = current.includes(event)
    ? current.filter((e) => e !== event)
    : [...current, event]
  return {
    ...prefs,
    subscribeEvents: {
      ...prefs.subscribeEvents,
      [teamId]: next,
    },
  }
}

export function isFavoriteTeam(
  prefs: TeamPreferences,
  teamId: string
): boolean {
  return prefs.favoriteTeamIds.includes(teamId)
}

export function toggleFavoriteTeam(
  prefs: TeamPreferences,
  teamId: string
): TeamPreferences {
  const next = isFavoriteTeam(prefs, teamId)
    ? prefs.favoriteTeamIds.filter((id) => id !== teamId)
    : [...prefs.favoriteTeamIds, teamId]
  return { ...prefs, favoriteTeamIds: next }
}

export function isTeamHidden(prefs: TeamPreferences, teamId: string): boolean {
  return prefs.hiddenTeamIds.includes(teamId)
}

export function setTeamHidden(
  prefs: TeamPreferences,
  teamId: string,
  hidden: boolean
): TeamPreferences {
  const present = isTeamHidden(prefs, teamId)
  if (hidden === present) return prefs
  return {
    ...prefs,
    hiddenTeamIds: hidden
      ? [...prefs.hiddenTeamIds, teamId]
      : prefs.hiddenTeamIds.filter((id) => id !== teamId),
  }
}

// ─── React glue ───────────────────────────────────────────────────────────

export function useTeamPreferences(): TeamPreferences {
  const [value, setValue] = useState<TeamPreferences>(() => cloneDefaults())
  useEffect(() => {
    const sync = () => setValue(loadTeamPreferences())
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

// ─── Internals ────────────────────────────────────────────────────────────

function cloneDefaults(): TeamPreferences {
  return {
    subscribeEvents: {},
    favoriteTeamIds: [],
    hiddenTeamIds: [],
  }
}

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((s): s is string => typeof s === "string" && s.length > 0)
}

function normalizeSubscribeEvents(
  raw: unknown
): Record<string, TeamSubscribeEvent[]> {
  if (!raw || typeof raw !== "object") return {}
  const out: Record<string, TeamSubscribeEvent[]> = {}
  for (const [teamId, events] of Object.entries(
    raw as Record<string, unknown>
  )) {
    if (typeof teamId !== "string" || !teamId) continue
    if (!Array.isArray(events)) continue
    const filtered = events.filter(
      (e): e is TeamSubscribeEvent =>
        typeof e === "string" && VALID_EVENTS.has(e)
    )
    if (filtered.length > 0) out[teamId] = filtered
  }
  return out
}

/** Test-only: clear persisted state. */
export function _resetTeamPreferencesForTests(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
}
