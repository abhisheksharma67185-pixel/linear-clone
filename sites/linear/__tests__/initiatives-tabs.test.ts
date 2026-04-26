/**
 * Unit tests for the Initiatives tabs filtering contract.
 *
 * The page rendered Active inline and stubbed Planned/Completed as
 * static empty banners — meaning a count badge could disagree with
 * the rendered list. These tests pin the new contract:
 *
 *   bucketsForTabs(initiatives)[tab].length === <badge count for tab>
 *
 * They also lock the URL → tab resolver so an unrecognised `?tab=` value
 * never lands on a non-existent tab key.
 */
import { describe, expect, it } from "vitest"

import {
  bucketsForTabs,
  initiativesForTab,
  INITIATIVE_TABS,
  resolveTab,
  type InitiativeWithStatus,
} from "../app/lib/initiatives-filters"

function init(
  id: string,
  status?: InitiativeWithStatus["status"]
): InitiativeWithStatus {
  return {
    id,
    name: `Initiative ${id}`,
    summary: "",
    ownerId: null,
    targetDate: null,
    totalProjects: 0,
    completedProjects: 0,
    activeProjects: 0,
    health: "no_update",
    status,
  }
}

describe("Initiatives tab filters", () => {
  it("buckets every initiative into exactly one tab", () => {
    const fixtures: InitiativeWithStatus[] = [
      init("a1", "active"),
      init("a2", "active"),
      init("p1", "planned"),
      init("c1", "completed"),
      init("c2", "completed"),
      init("c3", "completed"),
    ]
    const buckets = bucketsForTabs(fixtures)
    expect(buckets.active).toHaveLength(2)
    expect(buckets.planned).toHaveLength(1)
    expect(buckets.completed).toHaveLength(3)
    // No initiative is double-counted.
    const total =
      buckets.active.length + buckets.planned.length + buckets.completed.length
    expect(total).toBe(fixtures.length)
  })

  it("treats missing status as 'active' (Linear's freshly-created behavior)", () => {
    const fixtures: InitiativeWithStatus[] = [
      init("legacy"), // no status
      init("p", "planned"),
    ]
    expect(bucketsForTabs(fixtures).active.map((i) => i.id)).toEqual(["legacy"])
    expect(bucketsForTabs(fixtures).planned.map((i) => i.id)).toEqual(["p"])
  })

  it("badge count equals rendered list length for every tab", () => {
    // Generate a deterministic mix.
    const fixtures: InitiativeWithStatus[] = [
      init("1", "active"),
      init("2", "planned"),
      init("3", "completed"),
      init("4", "active"),
      init("5"),
      init("6", "planned"),
    ]
    const buckets = bucketsForTabs(fixtures)
    for (const tab of INITIATIVE_TABS) {
      const list = initiativesForTab(fixtures, tab)
      // The badge count is `buckets[tab].length`; the rendered list is
      // `initiativesForTab(...)`. They must be the same array.
      expect(list.length).toBe(buckets[tab].length)
    }
  })

  it("empty input yields empty buckets, not undefined", () => {
    const buckets = bucketsForTabs([])
    expect(buckets.active).toEqual([])
    expect(buckets.planned).toEqual([])
    expect(buckets.completed).toEqual([])
  })
})

describe("Initiatives URL → tab resolver", () => {
  it("accepts the three valid keys", () => {
    expect(resolveTab("active")).toBe("active")
    expect(resolveTab("planned")).toBe("planned")
    expect(resolveTab("completed")).toBe("completed")
  })

  it("falls back to 'active' for null/undefined/junk", () => {
    expect(resolveTab(null)).toBe("active")
    expect(resolveTab(undefined)).toBe("active")
    expect(resolveTab("")).toBe("active")
    expect(resolveTab("xyz")).toBe("active")
    expect(resolveTab("Active")).toBe("active") // case-sensitive on purpose
  })
})
