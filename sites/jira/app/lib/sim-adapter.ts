/**
 * Jira site adapter — wires @thetabench/core engine to Jira's store.
 * This file is the bridge between the generic engine and Jira-specific data.
 *
 * Import this once at app startup to register the adapter + tasks + predicates.
 */

import {
  registerSiteAdapter,
  registerTasks,
  registerPredicate,
  getNestedField,
  type SiteAdapter,
  type GenericSnapshot,
  type EvalCheck,
} from "@thetabench/core"

import * as store from "./store"

// Site-specific task definitions
import { navigationTasks } from "./tasks/navigation"
import { issueTasks } from "./tasks/issues"
import { sprintTasks } from "./tasks/sprints"
import { boardTasks } from "./tasks/boards"
import { searchTasks } from "./tasks/search"
import { retrievalTasks } from "./tasks/retrieval"
import { multiDomainTasks } from "./tasks/multi-domain"
import { impossibleTasks } from "./tasks/impossible"

// ---------------------------------------------------------------------------
// 1. Register site adapter
// ---------------------------------------------------------------------------

const jiraAdapter: SiteAdapter = {
  getState: () => ({
    issues: store.getIssues(),
    projects: store.getProjects(),
    sprints: store.getSprints(),
    epics: store.getEpics(),
    users: store.getUsers(),
    boards: store.getBoards(),
    filters: store.getFilters(),
  }),

  reset: (seed?: number) => store.reset(seed),

  executeMutation: (name: string, args: unknown[]) => {
    const MUTATION_ALLOWLIST = new Set([
      "createIssue",
      "updateIssue",
      "deleteIssue",
      "transitionIssue",
      "createProject",
      "updateProject",
      "createSprint",
      "startSprint",
      "completeSprint",
      "moveIssueToSprint",
      "createEpic",
      "updateEpic",
      "createFilter",
    ])
    if (!MUTATION_ALLOWLIST.has(name)) {
      return { success: false, error: `Unknown mutation: ${name}` }
    }
    const fn = (
      store as unknown as Record<string, (...a: unknown[]) => unknown>
    )[name]
    if (fn) return fn(...args)
    return { success: false, error: `Mutation not found: ${name}` }
  },

  collections: [
    "issues",
    "projects",
    "sprints",
    "epics",
    "users",
    "boards",
    "filters",
  ],
  singletons: [],
}

registerSiteAdapter(jiraAdapter)

// ---------------------------------------------------------------------------
// 2. Register all tasks
// ---------------------------------------------------------------------------

registerTasks([
  ...navigationTasks,
  ...issueTasks,
  ...sprintTasks,
  ...boardTasks,
  ...searchTasks,
  ...retrievalTasks,
  ...multiDomainTasks,
  ...impossibleTasks,
])

// ---------------------------------------------------------------------------
// 3. Register Jira-specific predicates
// ---------------------------------------------------------------------------

registerPredicate(
  "issue_has_fields",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const expected = check.expected as Record<string, unknown> | undefined
    if (!expected) return false
    const issues = snapshot.issues as {
      id: string
      key?: string
      summary?: string
    }[]
    let issue = check.id ? issues?.find((i) => i.id === check.id) : undefined
    if (!issue && check.id) {
      issue = issues?.find((i) => i.key === check.id)
    }
    if (!issue && expected.summary) {
      issue = issues?.find(
        (i) =>
          i.summary?.toLowerCase() === String(expected.summary).toLowerCase()
      )
    }
    if (!issue) return false
    return Object.entries(expected).every(
      ([key, val]) =>
        JSON.stringify(getNestedField(issue, key)) === JSON.stringify(val)
    )
  }
)

registerPredicate(
  "issue_exists_with_key",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const key = String(check.expected ?? "")
    const issues = snapshot.issues as { key: string }[]
    return issues?.some((i) => i.key === key) ?? false
  }
)

registerPredicate(
  "issue_has_status",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const issues = snapshot.issues as {
      id: string
      key?: string
      status: string
    }[]
    const issue = issues?.find((i) => i.id === check.id || i.key === check.id)
    return issue?.status === check.expected
  }
)

registerPredicate(
  "issue_has_priority",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const issues = snapshot.issues as {
      id: string
      key?: string
      priority: string
    }[]
    const issue = issues?.find((i) => i.id === check.id || i.key === check.id)
    return issue?.priority === check.expected
  }
)

registerPredicate(
  "issue_has_type",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const issues = snapshot.issues as {
      id: string
      key?: string
      type: string
    }[]
    const issue = issues?.find((i) => i.id === check.id || i.key === check.id)
    return issue?.type === check.expected
  }
)

registerPredicate(
  "issue_in_sprint",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const issues = snapshot.issues as {
      id: string
      key?: string
      sprintId: string | null
    }[]
    const issue = issues?.find((i) => i.id === check.id || i.key === check.id)
    return issue?.sprintId === check.expected
  }
)

registerPredicate(
  "issue_in_epic",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const issues = snapshot.issues as {
      id: string
      key?: string
      epicId: string | null
    }[]
    const issue = issues?.find((i) => i.id === check.id || i.key === check.id)
    return issue?.epicId === check.expected
  }
)

registerPredicate(
  "issue_has_story_points",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const issues = snapshot.issues as {
      id: string
      key?: string
      storyPoints: number | null
    }[]
    const issue = issues?.find((i) => i.id === check.id || i.key === check.id)
    return issue?.storyPoints === Number(check.expected)
  }
)

registerPredicate(
  "issue_has_assignee",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const issues = snapshot.issues as {
      id: string
      key?: string
      assigneeId: string | null
    }[]
    const issue = issues?.find((i) => i.id === check.id || i.key === check.id)
    return issue?.assigneeId === check.expected
  }
)

registerPredicate(
  "sprint_has_state",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const sprints = snapshot.sprints as { id: string; state: string }[]
    const sprint = sprints?.find((s) => s.id === check.id)
    return sprint?.state === check.expected
  }
)

registerPredicate(
  "sprint_issue_count",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const issues = snapshot.issues as { sprintId: string | null }[]
    const count = issues?.filter((i) => i.sprintId === check.id).length ?? 0
    return count === Number(check.expected)
  }
)

registerPredicate(
  "project_has_fields",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const expected = check.expected as Record<string, unknown> | undefined
    if (!expected) return false
    const projects = snapshot.projects as {
      id: string
      key?: string
      name?: string
    }[]
    let project = check.id
      ? projects?.find((p) => p.id === check.id)
      : undefined
    if (!project && expected.name) {
      project = projects?.find(
        (p) => p.name?.toLowerCase() === String(expected.name).toLowerCase()
      )
    }
    if (!project) return false
    return Object.entries(expected).every(
      ([key, val]) =>
        JSON.stringify(getNestedField(project, key)) === JSON.stringify(val)
    )
  }
)

registerPredicate(
  "epic_has_status",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const epics = snapshot.epics as { id: string; status: string }[]
    const epic = epics?.find((e) => e.id === check.id)
    return epic?.status === check.expected
  }
)

registerPredicate(
  "all_issues_in_status",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const issues = snapshot.issues as { status: string }[]
    return issues?.every((i) => i.status === check.expected) ?? false
  }
)

registerPredicate(
  "issue_count_equals",
  (snapshot: GenericSnapshot, check: EvalCheck) => {
    const issues = snapshot.issues as unknown[]
    return issues?.length === Number(check.expected)
  }
)

// ---------------------------------------------------------------------------
// Export for use in API routes
// ---------------------------------------------------------------------------

export { jiraAdapter }
