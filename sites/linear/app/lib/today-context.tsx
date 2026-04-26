"use client"

/**
 * Single source of truth for "today" inside the workspace shell.
 *
 * Why this exists: the timeline page used to compute `new Date()` on
 * every render of every sub-component (header pill, today indicator,
 * scroll-to-today button, hover cursor label). Across enough renders,
 * those `Date` objects could straddle a midnight boundary and the
 * app would show "APR 25" in one pill and "APR 26" in another.
 *
 * The fix is to compute `today` once at provider mount (timezone-aware,
 * via `new Date()`) and pin it for the lifetime of the page. Every
 * component reads from `useToday()` so all "today" surfaces show the
 * same string. Tests can wrap components in `<TodayProvider value=...>`
 * to inject a deterministic value.
 *
 * Note on rollover: this intentionally does NOT auto-update at
 * midnight. Linear's app behaves the same way — a long-lived tab keeps
 * its "today" stable until the user navigates or refreshes.
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"

const TodayContext = createContext<Date | null>(null)

/**
 * Provider that pins `today` to a single Date instance for its
 * subtree. Pass a fixed `value` for tests; omit for production.
 */
export function TodayProvider({
  children,
  value,
}: {
  children: ReactNode
  value?: Date
}) {
  // useMemo with no deps captures the Date once at provider mount.
  // Re-renders of the provider keep returning the same instance, so
  // memoization downstream stays stable.
  const today = useMemo(() => value ?? new Date(), [value])
  return <TodayContext.Provider value={today}>{children}</TodayContext.Provider>
}

/**
 * Read the pinned "today" Date. Falls back to a stable `new Date()`
 * captured once per consumer if no provider is mounted (so legacy
 * callers don't crash). Production code paths inside the workspace
 * must always have the provider.
 */
export function useToday(): Date {
  const ctx = useContext(TodayContext)
  // Always call useMemo — never conditionally — so rules-of-hooks
  // is satisfied. The fallback is captured once at first render of
  // the consumer and reused across re-renders.
  const fallback = useMemo(() => new Date(), [])
  return ctx ?? fallback
}

/**
 * Same `today` value, formatted as the timeline's "today pill"
 * displays it: "APR 25" (uppercase 3-letter month + day-of-month).
 * Centralised so a future locale change is one edit.
 */
export function formatTodayPill(date: Date): string {
  const month = date
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase()
  return `${month} ${date.getDate()}`
}
