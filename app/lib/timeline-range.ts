/**
 * Pure helpers for the Projects timeline view.
 *
 * Three concerns isolated here so the React component stays small and
 * the regression-prone parts are unit-testable:
 *
 *   1. `computeTimelineBounds(projects, today)` — derives the visible
 *      date range from project start/end dates plus a sensible buffer
 *      around today, instead of the prior fixed 1943→today+3yrs range
 *      that produced a multi-mile-wide horizontal scroll on an empty
 *      workspace.
 *
 *   2. `bucketProjects(projects)` — splits projects into "scheduled"
 *      (have at least one of startDate/targetDate) and "unscheduled"
 *      (have neither). Unscheduled projects must render in a dedicated
 *      lane at the top of the timeline rather than vanishing.
 *
 *   3. `pxPerDayForZoom(zoom)` — translates a zoom mode into a
 *      column density. The page's `zoom` state previously had no
 *      effect on rendering; making it a function of pixel density
 *      ensures every zoom mode produces a different layout while the
 *      project list itself remains untouched.
 *
 * All three are pure functions: same input → same output, no side
 * effects, no dependence on `Date.now()`. The unit tests in
 * `__tests__/timeline-range.test.ts` lock the contracts in place.
 */

import type { Project } from "@/app/lib/mock-data"

export type TimelineZoom = "Year" | "Quarter" | "Month" | "Week"

/** A project is "scheduled" if it has either a start or a target date. */
export interface ProjectDates {
  startDate: Date | null
  endDate: Date | null
}

export function projectDates(project: Project): ProjectDates {
  const start = project.createdAt ? new Date(project.createdAt) : null
  const end = project.targetDate ? new Date(project.targetDate) : null
  return { startDate: start, endDate: end }
}

export function isScheduled(project: Project): boolean {
  const { startDate, endDate } = projectDates(project)
  return startDate !== null || endDate !== null
}

/**
 * Split projects into scheduled / unscheduled lists in stable order.
 * Unscheduled projects are the ones that go into the "Unscheduled"
 * lane at the top of the timeline.
 */
export function bucketProjects(projects: Project[]): {
  scheduled: Project[]
  unscheduled: Project[]
} {
  const scheduled: Project[] = []
  const unscheduled: Project[] = []
  for (const project of projects) {
    if (isScheduled(project)) scheduled.push(project)
    else unscheduled.push(project)
  }
  return { scheduled, unscheduled }
}

/**
 * Compute the visible date range for the timeline.
 *
 * Behavior:
 *  - If at least one project has a start or end date, expand the range
 *    to cover all of them, then add a 6-month buffer on each side and
 *    union with [today - 6mo, today + 6mo] so today is always visible.
 *  - If no projects have dates, default to [today - 3mo, today + 9mo].
 *
 * The returned `start` and `end` are normalised to the first day of
 * the month so month-cell rendering aligns cleanly.
 */
export function computeTimelineBounds(
  projects: Project[],
  today: Date
): { start: Date; end: Date } {
  const dates: number[] = []
  for (const project of projects) {
    const { startDate, endDate } = projectDates(project)
    if (startDate) dates.push(startDate.getTime())
    if (endDate) dates.push(endDate.getTime())
  }

  const SIX_MONTHS = 6
  const NINE_MONTHS = 9
  const THREE_MONTHS = 3

  if (dates.length === 0) {
    // No project dates at all — show a focused window around today
    // (3 months back, 9 months forward) so the user can immediately
    // start scheduling.
    return {
      start: addMonthsFloor(today, -THREE_MONTHS),
      end: addMonthsCeil(today, NINE_MONTHS),
    }
  }

  const minMs = Math.min(...dates)
  const maxMs = Math.max(...dates)

  // Buffer ±6 months around the project span, then union with the
  // ±6mo window around today so today is always in view.
  const candidateStart = addMonthsFloor(new Date(minMs), -SIX_MONTHS)
  const candidateEnd = addMonthsCeil(new Date(maxMs), SIX_MONTHS)
  const todayStart = addMonthsFloor(today, -SIX_MONTHS)
  const todayEnd = addMonthsCeil(today, SIX_MONTHS)

  return {
    start: candidateStart < todayStart ? candidateStart : todayStart,
    end: candidateEnd > todayEnd ? candidateEnd : todayEnd,
  }
}

/**
 * Pixel density per day for each zoom level. Lower zoom = wider days
 * = more horizontal real estate per project bar. Picked to match
 * Linear's defaults reasonably:
 *   Year     → 2 px/day   (~60 px/month)
 *   Quarter  → 4 px/day   (~120 px/month — current default)
 *   Month    → 12 px/day  (~360 px/month)
 *   Week     → 28 px/day  (~840 px/month)
 */
export function pxPerDayForZoom(zoom: TimelineZoom): number {
  switch (zoom) {
    case "Year":
      return 2
    case "Quarter":
      return 4
    case "Month":
      return 12
    case "Week":
      return 28
  }
}

// ─── Internals ────────────────────────────────────────────────────────────

function addMonthsFloor(date: Date, months: number): Date {
  // Snap to the first of the month before/after by `months`.
  const year = date.getFullYear()
  const month = date.getMonth() + months
  return new Date(year, month, 1)
}

function addMonthsCeil(date: Date, months: number): Date {
  // Snap to the first of the *next* month, then add `months - 1`.
  // i.e. for any input date, return the first of the month that is
  // `months` ahead, exclusive of the input month if it's mid-month.
  const year = date.getFullYear()
  const month = date.getMonth() + months + 1
  return new Date(year, month, 1)
}
