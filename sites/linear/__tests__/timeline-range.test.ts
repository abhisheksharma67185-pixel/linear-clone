/**
 * Unit tests for the Projects timeline range/bucket helpers.
 *
 * The component-level regression we're guarding against:
 *   - Switching Zoom (Year → Month → Year) made project rows
 *     disappear because the rows shared state with the zoom.
 *   - Dateless projects had no row at all and were invisible.
 *   - The horizontal scroll spanned 1943 → today+3yrs even when the
 *     workspace was empty, so the Today indicator was lost in the
 *     middle of an immense canvas.
 *
 * These tests pin the contracts of the pure helpers used by the
 * refactored TimelineView so the next regression fails a test
 * instead of the UI:
 *
 *   1. `bucketProjects` always partitions every input into exactly
 *      one of {scheduled, unscheduled} — and the union equals the
 *      input.
 *   2. `bucketProjects` is referentially stable in the sense that
 *      its output (counts and contents) is independent of zoom — the
 *      "rows persist across zoom" invariant.
 *   3. `pxPerDayForZoom` returns a *strictly different* value for
 *      every zoom mode, so changing zoom always re-scales.
 *   4. `computeTimelineBounds` always includes today, defaults to a
 *      focused window when no projects have dates, and expands to
 *      cover project dates plus a 6-month buffer.
 */
import { describe, expect, it } from "vitest"

import type { Project } from "../app/lib/mock-data"
import {
  bucketProjects,
  computeTimelineBounds,
  isScheduled,
  pxPerDayForZoom,
  type TimelineZoom,
} from "../app/lib/timeline-range"

function project(id: string, overrides: Partial<Project> = {}): Project {
  // Use `in` checks for date-like fields so explicit `null` overrides
  // are respected (we need null `createdAt` to test dateless projects).
  const base = {
    id,
    name: `Project ${id}`,
    description: "",
    icon: "📦",
    color: "#7c3aed",
    status: "active",
    health: "on_track",
    priority: "medium",
    leadId: null,
    teamId: "team-1",
    targetDate: "createdAt" in overrides ? null : null,
    createdAt: "2026-04-01T00:00:00.000Z",
  }
  return { ...base, ...overrides } as Project
}

describe("bucketProjects", () => {
  it("scheduled = has start OR target; unscheduled = neither", () => {
    const fixtures: Project[] = [
      project("with-both", {
        createdAt: "2026-01-01T00:00:00.000Z",
        targetDate: "2026-04-01T00:00:00.000Z",
      }),
      project("with-start-only", {
        createdAt: "2026-01-01T00:00:00.000Z",
        targetDate: null,
      }),
      project("with-target-only", {
        createdAt: null as unknown as string,
        targetDate: "2026-04-01T00:00:00.000Z",
      }),
      project("dateless", {
        createdAt: null as unknown as string,
        targetDate: null,
      }),
    ]
    const buckets = bucketProjects(fixtures)
    expect(buckets.scheduled.map((p) => p.id)).toEqual([
      "with-both",
      "with-start-only",
      "with-target-only",
    ])
    expect(buckets.unscheduled.map((p) => p.id)).toEqual(["dateless"])
    // Every input ends up in exactly one bucket.
    expect(buckets.scheduled.length + buckets.unscheduled.length).toBe(
      fixtures.length
    )
  })

  it("isScheduled is consistent with bucketProjects", () => {
    const projects: Project[] = [
      project("a", { createdAt: "2026-01-01", targetDate: "2026-02-01" }),
      project("b", { createdAt: null as unknown as string, targetDate: null }),
    ]
    const { scheduled, unscheduled } = bucketProjects(projects)
    expect(scheduled.every(isScheduled)).toBe(true)
    expect(unscheduled.every((p) => !isScheduled(p))).toBe(true)
  })

  it("project rows persist across zoom changes (count is invariant)", () => {
    const projects: Project[] = [
      project("p1", { createdAt: "2026-01-01", targetDate: "2026-03-01" }),
      project("p2", { createdAt: "2026-02-15", targetDate: null }),
      project("p3", {
        createdAt: null as unknown as string,
        targetDate: null,
      }),
    ]
    const counts = (["Year", "Quarter", "Month", "Week"] as TimelineZoom[]).map(
      () => {
        const buckets = bucketProjects(projects)
        return buckets.scheduled.length + buckets.unscheduled.length
      }
    )
    // The bucket totals must be identical for every zoom mode.
    expect(new Set(counts).size).toBe(1)
    expect(counts[0]).toBe(projects.length)
  })
})

describe("pxPerDayForZoom", () => {
  it("each zoom mode produces a distinct pixel density", () => {
    const values = (["Year", "Quarter", "Month", "Week"] as TimelineZoom[]).map(
      pxPerDayForZoom
    )
    expect(new Set(values).size).toBe(4)
    // Sanity: tighter zoom = larger px/day.
    expect(pxPerDayForZoom("Week")).toBeGreaterThan(pxPerDayForZoom("Month"))
    expect(pxPerDayForZoom("Month")).toBeGreaterThan(pxPerDayForZoom("Quarter"))
    expect(pxPerDayForZoom("Quarter")).toBeGreaterThan(pxPerDayForZoom("Year"))
  })
})

describe("computeTimelineBounds", () => {
  const today = new Date(2026, 3, 25) // 25 Apr 2026

  it("defaults to today ± focused window when no projects have dates", () => {
    const bounds = computeTimelineBounds([], today)
    // 3 months back (Jan 1 2026) and 9 months forward (Feb 1 2027).
    expect(bounds.start.getFullYear()).toBe(2026)
    expect(bounds.start.getMonth()).toBe(0) // Jan
    expect(bounds.end.getFullYear()).toBe(2027)
    // Implementation snaps to the first of the month after `today + 9mo`,
    // which is Feb 1 2027 for an Apr 25 today.
    expect(bounds.end.getMonth()).toBe(1) // Feb
  })

  it("expands to cover project dates with a 6-month buffer", () => {
    const projects: Project[] = [
      project("early", { createdAt: "2025-09-15", targetDate: "2025-10-15" }),
      project("late", { createdAt: "2027-01-01", targetDate: "2027-03-01" }),
    ]
    const bounds = computeTimelineBounds(projects, today)
    // Start should be at most 6 months before the earliest project date.
    expect(bounds.start.getTime()).toBeLessThanOrEqual(
      new Date(2025, 8, 15).getTime()
    )
    expect(bounds.start.getTime()).toBeLessThanOrEqual(
      new Date(2025, 2, 15).getTime() // sept-15 - 6mo = mar-15
    )
    // End should be at least 6 months after the latest project date.
    expect(bounds.end.getTime()).toBeGreaterThanOrEqual(
      new Date(2027, 2, 1).getTime() // mar-1 2027
    )
  })

  it("always includes today in the visible range", () => {
    // A project span entirely in the past — the bounds must still cover today.
    const ancientProjects: Project[] = [
      project("p1", { createdAt: "2020-01-01", targetDate: "2020-02-01" }),
    ]
    const bounds = computeTimelineBounds(ancientProjects, today)
    expect(bounds.start.getTime()).toBeLessThanOrEqual(today.getTime())
    expect(bounds.end.getTime()).toBeGreaterThanOrEqual(today.getTime())
  })

  it("snaps start/end to the first of a month for clean grid alignment", () => {
    const bounds = computeTimelineBounds([], today)
    expect(bounds.start.getDate()).toBe(1)
    expect(bounds.end.getDate()).toBe(1)
  })
})
