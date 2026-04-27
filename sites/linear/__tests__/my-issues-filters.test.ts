/**
 * Unit tests for My Issues tab filters.
 *
 * The Subscribed tab regressed in the past by silently re-using the
 * Created tab's predicate (`creator == currentUser`). These tests lock
 * in two invariants:
 *
 *   1. Each tab compiles to a *distinct* WHERE clause string. Catching
 *      drift at the query level means we can detect regressions even
 *      when the data happens to make the wrong predicate return the
 *      "right" rows by accident.
 *
 *   2. Each predicate, given a deliberately divergent fixture set,
 *      returns the rows it's supposed to and excludes the rows it
 *      isn't.
 */
import { describe, expect, it } from "vitest"

import type { Issue } from "../app/lib/mock-data"
import {
  assignedQuery,
  createdQuery,
  queryForTab,
  subscribedQuery,
} from "../app/lib/my-issues-filters"

const ME = "usr-1"
const SOMEONE_ELSE = "usr-2"
const THIRD_PARTY = "usr-3"

function issue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: overrides.id ?? "iss-test",
    identifier: overrides.identifier ?? "TST-1",
    title: overrides.title ?? "Test issue",
    description: overrides.description ?? "",
    status: overrides.status ?? "todo",
    priority: overrides.priority ?? "none",
    assigneeId: overrides.assigneeId ?? null,
    creatorId: overrides.creatorId ?? SOMEONE_ELSE,
    subscriberIds: overrides.subscriberIds,
    teamId: overrides.teamId ?? "team-1",
    projectId: overrides.projectId ?? null,
    cycleId: overrides.cycleId ?? null,
    labelIds: overrides.labelIds ?? [],
    estimate: overrides.estimate ?? null,
    dueDate: overrides.dueDate ?? null,
    createdAt: overrides.createdAt ?? "2026-01-01T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-01-01T00:00:00.000Z",
  }
}

describe("My Issues filters — WHERE clause shape", () => {
  it("Created and Subscribed compile to different WHERE clauses", () => {
    const created = createdQuery(ME).where
    const subscribed = subscribedQuery(ME).where
    expect(created).not.toBe(subscribed)
    // Catch the specific regression where Subscribed silently aliases
    // back to "creator ==" — the where-clause text must NOT mention
    // `creator` at all on the subscribed side.
    expect(subscribed).not.toMatch(/creator/i)
    expect(subscribed).toMatch(/subscribers/i)
  })

  it("Assigned and Created and Subscribed all compile to distinct clauses", () => {
    const a = assignedQuery(ME).where
    const c = createdQuery(ME).where
    const s = subscribedQuery(ME).where
    expect(new Set([a, c, s]).size).toBe(3)
  })

  it("queryForTab dispatches to the right factory", () => {
    expect(queryForTab("assigned", ME).where).toBe(assignedQuery(ME).where)
    expect(queryForTab("created", ME).where).toBe(createdQuery(ME).where)
    expect(queryForTab("subscribed", ME).where).toBe(subscribedQuery(ME).where)
  })
})

describe("My Issues filters — predicate behavior", () => {
  it("Assigned: returns only open issues assigned to me", () => {
    const fixtures: Issue[] = [
      issue({ id: "1", assigneeId: ME, status: "in_progress" }), // ✓
      issue({ id: "2", assigneeId: ME, status: "todo" }), // ✓
      issue({ id: "3", assigneeId: ME, status: "done" }), // ✗ done
      issue({ id: "4", assigneeId: ME, status: "cancelled" }), // ✗ cancelled
      issue({ id: "5", assigneeId: SOMEONE_ELSE, status: "todo" }), // ✗ not me
    ]
    const got = fixtures.filter(assignedQuery(ME).predicate).map((i) => i.id)
    expect(got).toEqual(["1", "2"])
  })

  it("Created: returns issues authored by me regardless of status", () => {
    const fixtures: Issue[] = [
      issue({ id: "1", creatorId: ME, status: "done" }), // ✓ done is fine for created
      issue({ id: "2", creatorId: ME, status: "todo" }), // ✓
      issue({ id: "3", creatorId: SOMEONE_ELSE }), // ✗
    ]
    const got = fixtures.filter(createdQuery(ME).predicate).map((i) => i.id)
    expect(got).toEqual(["1", "2"])
  })

  it("Subscribed: matches `subscribers contains me`, NOT `creator == me`", () => {
    const fixtures: Issue[] = [
      // I'm subscribed but didn't create — must be included.
      issue({
        id: "subscribed-not-creator",
        creatorId: SOMEONE_ELSE,
        subscriberIds: [SOMEONE_ELSE, ME],
      }),
      // I created but unsubscribed (subscribers list does not include me) —
      // must be excluded. This is the regression case: the bug returned
      // this row because it was secretly using the creator filter.
      issue({
        id: "creator-not-subscribed",
        creatorId: ME,
        subscriberIds: [SOMEONE_ELSE],
      }),
      // Someone else's issue, no relation to me.
      issue({
        id: "unrelated",
        creatorId: THIRD_PARTY,
        subscriberIds: [THIRD_PARTY, SOMEONE_ELSE],
      }),
      // Missing subscriberIds field entirely should be treated as `[]`.
      issue({ id: "no-subscribers-field", creatorId: ME }),
    ]
    const got = fixtures.filter(subscribedQuery(ME).predicate).map((i) => i.id)
    expect(got).toEqual(["subscribed-not-creator"])
  })

  it("Created and Subscribed return *different* result sets on the same data", () => {
    const fixtures: Issue[] = [
      issue({
        id: "only-created",
        creatorId: ME,
        subscriberIds: [SOMEONE_ELSE],
      }),
      issue({
        id: "only-subscribed",
        creatorId: SOMEONE_ELSE,
        subscriberIds: [ME],
      }),
      issue({
        id: "both",
        creatorId: ME,
        subscriberIds: [ME],
      }),
    ]
    const created = fixtures
      .filter(createdQuery(ME).predicate)
      .map((i) => i.id)
      .sort()
    const subscribed = fixtures
      .filter(subscribedQuery(ME).predicate)
      .map((i) => i.id)
      .sort()
    expect(created).toEqual(["both", "only-created"])
    expect(subscribed).toEqual(["both", "only-subscribed"])
    // Symmetric difference must be non-empty — the two queries are not
    // interchangeable on real data.
    const onlyInCreated = created.filter((id) => !subscribed.includes(id))
    const onlyInSubscribed = subscribed.filter((id) => !created.includes(id))
    expect(onlyInCreated).toEqual(["only-created"])
    expect(onlyInSubscribed).toEqual(["only-subscribed"])
  })
})
