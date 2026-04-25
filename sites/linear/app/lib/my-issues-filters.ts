/**
 * Filter helpers for the My Issues tabs.
 *
 * Each helper is pure (input → output, no side effects) and exposes a
 * companion `WHERE` description string. The description is what would
 * become a SQL/GraphQL `where` clause if these filters were pushed
 * server-side; it's also what the unit test asserts on, so a future
 * regression — e.g. accidentally re-using the `creator == currentUser`
 * filter for the Subscribed tab — fails loudly instead of silently
 * returning the wrong rows.
 */

import type { Issue } from "@/app/lib/mock-data"

export type MyIssuesTab = "assigned" | "created" | "subscribed"

export interface MyIssuesQuery {
  /** Pure JS predicate used by the client to filter the loaded issue list. */
  predicate: (issue: Issue) => boolean
  /**
   * The equivalent server-side WHERE clause. Stable string identity so
   * tests can assert that two tabs *don't* compile to the same query.
   */
  where: string
}

/**
 * Issues currently assigned to the user, excluding completed work.
 * The completed-exclusion mirrors Linear's "Assigned" tab default.
 */
export function assignedQuery(currentUserId: string): MyIssuesQuery {
  return {
    predicate: (i) =>
      i.assigneeId === currentUserId &&
      i.status !== "done" &&
      i.status !== "cancelled",
    where: `assignee == ${currentUserId} AND status NOT IN (done, cancelled)`,
  }
}

/**
 * Issues the user authored. Matches on `creatorId`, never on subscribers
 * — the Subscribed tab uses a separate query and the two are not
 * interchangeable.
 */
export function createdQuery(currentUserId: string): MyIssuesQuery {
  return {
    predicate: (i) => i.creatorId === currentUserId,
    where: `creator == ${currentUserId}`,
  }
}

/**
 * Issues the user is following. Uses the `subscriberIds` collection,
 * NOT the `creatorId` field. A regression in the past silently aliased
 * this to `createdQuery`, returning empty results when the user had
 * subscribed to issues authored by other people.
 */
export function subscribedQuery(currentUserId: string): MyIssuesQuery {
  return {
    predicate: (i) =>
      Array.isArray(i.subscriberIds) &&
      i.subscriberIds.includes(currentUserId),
    where: `subscribers CONTAINS ${currentUserId}`,
  }
}

/**
 * Single entry point used by UI code so callers don't have to remember
 * which factory belongs to which tab.
 */
export function queryForTab(
  tab: MyIssuesTab,
  currentUserId: string
): MyIssuesQuery {
  switch (tab) {
    case "assigned":
      return assignedQuery(currentUserId)
    case "created":
      return createdQuery(currentUserId)
    case "subscribed":
      return subscribedQuery(currentUserId)
  }
}
