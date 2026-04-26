/**
 * Favorites for top-level views (e.g. a team's Issues page). Toggled
 * by the star button in the page header; rendered as a dedicated
 * "Favorites" section in the workspace sidebar.
 *
 * Each favorite is keyed by a stable string (e.g. `team:ABH:issues`)
 * so the same view can be toggled from anywhere without duplicating
 * entries. Same localStorage + CustomEvent pattern as
 * `team-preferences.ts` so the sidebar updates instantly when the
 * star is toggled in another part of the app.
 */
import { useEffect, useState } from "react"

const STORAGE_KEY = "view:favorites:v1"
const STORAGE_EVENT = "view:favorites:change"

/** Icon hint understood by the sidebar renderer. */
export type FavoriteIcon = "issues" | "view"

export interface FavoriteView {
  /** Stable key — used to look up / toggle the favorite. */
  key: string
  /** Display label in the sidebar. */
  label: string
  /** Where the sidebar item navigates to. */
  href: string
  /** Which icon the sidebar should render next to the label. */
  icon: FavoriteIcon
}

export function loadFavorites(): FavoriteView[] {
  if (typeof window === "undefined") return []
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return []
  }
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isFavoriteView)
  } catch {
    return []
  }
}

function saveFavorites(value: FavoriteView[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Best-effort.
  }
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT))
}

export function isFavorite(key: string): boolean {
  return loadFavorites().some((f) => f.key === key)
}

export function addFavorite(view: FavoriteView): void {
  const current = loadFavorites()
  if (current.some((f) => f.key === view.key)) return
  saveFavorites([...current, view])
}

export function removeFavorite(key: string): void {
  const current = loadFavorites()
  const next = current.filter((f) => f.key !== key)
  if (next.length === current.length) return
  saveFavorites(next)
}

export function toggleFavorite(view: FavoriteView): boolean {
  const current = loadFavorites()
  const present = current.some((f) => f.key === view.key)
  if (present) {
    saveFavorites(current.filter((f) => f.key !== view.key))
    return false
  }
  saveFavorites([...current, view])
  return true
}

export function useFavorites(): FavoriteView[] {
  const [value, setValue] = useState<FavoriteView[]>([])
  useEffect(() => {
    const sync = () => setValue(loadFavorites())
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

export function useIsFavorite(key: string): boolean {
  const favs = useFavorites()
  return favs.some((f) => f.key === key)
}

function isFavoriteView(v: unknown): v is FavoriteView {
  if (!v || typeof v !== "object") return false
  const obj = v as Record<string, unknown>
  return (
    typeof obj.key === "string" &&
    typeof obj.label === "string" &&
    typeof obj.href === "string" &&
    (obj.icon === "issues" || obj.icon === "view")
  )
}

/** Test-only: clear persisted state. */
export function _resetFavoritesForTests(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
}
