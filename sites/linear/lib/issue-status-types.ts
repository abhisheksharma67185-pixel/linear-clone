/**
 * Status-type taxonomy used by the team-issues page tabs.
 *
 * Linear groups workflow states by *type* — Backlog / Started /
 * Completed / Canceled / Triage — and the page-level tabs filter
 * by these groups, not by individual statuses. Centralising the
 * mapping here means:
 *   - The "Active" tab can never accidentally include Backlog rows
 *     (the bug we're fixing was an oversight in the per-tab filter).
 *   - Tests pin the membership of each tab so future status additions
 *     have to opt in to a tab explicitly.
 */

import type { Issue } from "@/app/lib/mock-data"

export type IssueStatus = Issue["status"]

/** The four status-type buckets currently modelled in the mock. */
export type IssueStatusType =
  | "backlog"
  | "started"
  | "completed"
  | "canceled"

/**
 * Authoritative mapping from individual workflow statuses → their
 * type bucket. The mock has 5 statuses; in real Linear "todo" and
 * "in_progress" both belong to the "started" type.
 */
export const STATUS_TO_TYPE: Record<IssueStatus, IssueStatusType> = {
  backlog: "backlog",
  todo: "started",
  in_progress: "started",
  done: "completed",
  cancelled: "canceled",
}

/**
 * The three top-level tabs Linear renders on a team's issues page.
 * `all` includes every status; `active` is the regression target —
 * it must include only `started`-type statuses; `backlog` is the
 * mirror that holds Backlog-type rows.
 */
export type IssueTab = "all" | "active" | "backlog"

/**
 * Predicate for a given tab. Composed with the page's other filters
 * (search, assignee, etc.) to produce the final visible list.
 */
export function isIssueInTab(status: IssueStatus, tab: IssueTab): boolean {
  if (tab === "all") return true
  const type = STATUS_TO_TYPE[status]
  if (tab === "active") return type === "started"
  if (tab === "backlog") return type === "backlog"
  return false
}

/**
 * Convenience: filter a list of issues by tab.
 */
export function filterIssuesByTab<I extends { status: IssueStatus }>(
  issues: I[],
  tab: IssueTab
): I[] {
  return issues.filter((i) => isIssueInTab(i.status, tab))
}

/**
 * Group issues by their type bucket. Used by the team-issues page
 * to render per-status section headers within a tab.
 */
export function groupIssuesByType<I extends { status: IssueStatus }>(
  issues: I[]
): Record<IssueStatusType, I[]> {
  const out: Record<IssueStatusType, I[]> = {
    backlog: [],
    started: [],
    completed: [],
    canceled: [],
  }
  for (const issue of issues) {
    out[STATUS_TO_TYPE[issue.status]].push(issue)
  }
  return out
}
