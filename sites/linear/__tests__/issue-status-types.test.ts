/**
 * Unit tests for the team-issues tab filter logic.
 *
 * The spec's regression: the "Active" tab on the team-issues page
 * was incorrectly including Backlog rows because the filter ran
 * by individual status string instead of by Linear's status-type
 * taxonomy. These tests pin the corrected behavior:
 *
 *   - Active tab → only "started"-type statuses (todo, in_progress).
 *   - Backlog tab → only "backlog"-type statuses.
 *   - All tab → every status.
 *
 * If a future status is added without an explicit type mapping the
 * STATUS_TO_TYPE table fails to typecheck (Record over Issue["status"]),
 * which is the surface we want to fail loudly.
 */
import { describe, expect, it } from "vitest"

import type { Issue } from "../app/lib/mock-data"
import {
  filterIssuesByTab,
  groupIssuesByType,
  isIssueInTab,
  STATUS_TO_TYPE,
} from "../lib/issue-status-types"

function issue(
  id: string,
  status: Issue["status"],
  overrides: Partial<Issue> = {}
): Issue {
  return {
    id,
    identifier: `T-${id}`,
    title: `Issue ${id}`,
    description: "",
    status,
    priority: "none",
    assigneeId: null,
    creatorId: "usr-1",
    teamId: "team-1",
    projectId: null,
    cycleId: null,
    labelIds: [],
    estimate: null,
    dueDate: null,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("STATUS_TO_TYPE", () => {
  it("maps every workflow status to a type bucket", () => {
    expect(STATUS_TO_TYPE.backlog).toBe("backlog")
    expect(STATUS_TO_TYPE.todo).toBe("started")
    expect(STATUS_TO_TYPE.in_progress).toBe("started")
    expect(STATUS_TO_TYPE.done).toBe("completed")
    expect(STATUS_TO_TYPE.cancelled).toBe("canceled")
  })
})

describe("isIssueInTab", () => {
  it("'all' tab includes every status", () => {
    for (const status of [
      "backlog",
      "todo",
      "in_progress",
      "done",
      "cancelled",
    ] as const) {
      expect(isIssueInTab(status, "all")).toBe(true)
    }
  })

  it("'active' tab includes started-type statuses only", () => {
    expect(isIssueInTab("todo", "active")).toBe(true)
    expect(isIssueInTab("in_progress", "active")).toBe(true)
    // The regression rows: these MUST be excluded from Active.
    expect(isIssueInTab("backlog", "active")).toBe(false)
    expect(isIssueInTab("done", "active")).toBe(false)
    expect(isIssueInTab("cancelled", "active")).toBe(false)
  })

  it("'backlog' tab includes backlog-type statuses only", () => {
    expect(isIssueInTab("backlog", "backlog")).toBe(true)
    expect(isIssueInTab("todo", "backlog")).toBe(false)
    expect(isIssueInTab("in_progress", "backlog")).toBe(false)
    expect(isIssueInTab("done", "backlog")).toBe(false)
    expect(isIssueInTab("cancelled", "backlog")).toBe(false)
  })
})

describe("filterIssuesByTab", () => {
  const fixtures: Issue[] = [
    issue("a", "backlog"),
    issue("b", "todo"),
    issue("c", "in_progress"),
    issue("d", "done"),
    issue("e", "cancelled"),
    issue("f", "todo"),
  ]

  it("Active tab returns only todo + in_progress (regression case)", () => {
    const active = filterIssuesByTab(fixtures, "active").map((i) => i.id)
    expect(active.sort()).toEqual(["b", "c", "f"])
    // Crucially: backlog ID 'a' must NOT appear.
    expect(active).not.toContain("a")
  })

  it("Backlog tab returns only backlog", () => {
    const backlog = filterIssuesByTab(fixtures, "backlog").map((i) => i.id)
    expect(backlog).toEqual(["a"])
  })

  it("All tab returns every issue", () => {
    expect(filterIssuesByTab(fixtures, "all")).toHaveLength(fixtures.length)
  })

  it("Active and Backlog tab results are disjoint", () => {
    const active = new Set(
      filterIssuesByTab(fixtures, "active").map((i) => i.id)
    )
    const backlog = new Set(
      filterIssuesByTab(fixtures, "backlog").map((i) => i.id)
    )
    for (const id of active) {
      expect(backlog.has(id)).toBe(false)
    }
  })
})

describe("groupIssuesByType", () => {
  it("partitions issues into the four type buckets, no leakage", () => {
    const fixtures: Issue[] = [
      issue("a", "backlog"),
      issue("b", "todo"),
      issue("c", "in_progress"),
      issue("d", "done"),
      issue("e", "cancelled"),
    ]
    const buckets = groupIssuesByType(fixtures)
    expect(buckets.backlog.map((i) => i.id)).toEqual(["a"])
    expect(buckets.started.map((i) => i.id).sort()).toEqual(["b", "c"])
    expect(buckets.completed.map((i) => i.id)).toEqual(["d"])
    expect(buckets.canceled.map((i) => i.id)).toEqual(["e"])
  })

  it("returns empty arrays for missing buckets, not undefined", () => {
    const buckets = groupIssuesByType([])
    expect(buckets.backlog).toEqual([])
    expect(buckets.started).toEqual([])
    expect(buckets.completed).toEqual([])
    expect(buckets.canceled).toEqual([])
  })
})
