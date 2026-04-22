/**
 * Linear site adapter — wires @thetabench/core engine to Linear's store.
 * This file is the bridge between the generic engine and Linear-specific data.
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
} from "@thetabench/core";

import * as store from "./store";

// Site-specific task definitions
import { navigationTasks } from "./tasks/navigation";
import { issueTasks } from "./tasks/issues";
import { cycleTasks } from "./tasks/cycles";
import { labelTasks } from "./tasks/labels";
import { viewTasks } from "./tasks/views";
import { searchTasks } from "./tasks/search";
import { retrievalTasks } from "./tasks/retrieval";
import { multiDomainTasks } from "./tasks/multi-domain";
import { impossibleTasks } from "./tasks/impossible";

// ---------------------------------------------------------------------------
// 1. Register site adapter
// ---------------------------------------------------------------------------

const linearAdapter: SiteAdapter = {
  getState: () => ({
    issues: store.getIssues(),
    projects: store.getProjects(),
    cycles: store.getCycles(),
    labels: store.getLabels(),
    teams: store.getTeams(),
    members: store.getMembers(),
    views: store.getViews(),
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
      "createCycle",
      "startCycle",
      "completeCycle",
      "moveIssueToCycle",
      "createLabel",
      "updateLabel",
      "createTeam",
      "updateTeam",
      "createView",
    ]);
    if (!MUTATION_ALLOWLIST.has(name)) {
      return { success: false, error: `Unknown mutation: ${name}` };
    }
    const fn = (store as unknown as Record<string, (...a: unknown[]) => unknown>)[name];
    if (fn) return fn(...args);
    return { success: false, error: `Mutation not found: ${name}` };
  },

  collections: ["issues", "projects", "cycles", "labels", "teams", "members", "views"],
  singletons: [],
};

registerSiteAdapter(linearAdapter);

// ---------------------------------------------------------------------------
// 2. Register all tasks
// ---------------------------------------------------------------------------

registerTasks([
  ...navigationTasks,
  ...issueTasks,
  ...cycleTasks,
  ...labelTasks,
  ...viewTasks,
  ...searchTasks,
  ...retrievalTasks,
  ...multiDomainTasks,
  ...impossibleTasks,
]);

// ---------------------------------------------------------------------------
// 3. Register Linear-specific predicates
// ---------------------------------------------------------------------------

registerPredicate("issue_has_fields", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const expected = check.expected as Record<string, unknown> | undefined;
  if (!expected) return false;
  const issues = snapshot.issues as { id: string; identifier?: string; title?: string }[];
  let issue = check.id ? issues?.find((i) => i.id === check.id) : undefined;
  if (!issue && check.id) {
    issue = issues?.find((i) => i.identifier === check.id);
  }
  if (!issue && expected.title) {
    issue = issues?.find(
      (i) => i.title?.toLowerCase() === String(expected.title).toLowerCase(),
    );
  }
  if (!issue) return false;
  return Object.entries(expected).every(
    ([key, val]) => JSON.stringify(getNestedField(issue, key)) === JSON.stringify(val),
  );
});

registerPredicate("issue_exists_with_identifier", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const identifier = String(check.expected ?? "");
  const issues = snapshot.issues as { identifier: string }[];
  return issues?.some((i) => i.identifier === identifier) ?? false;
});

registerPredicate("issue_has_status", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const issues = snapshot.issues as { id: string; identifier?: string; status: string }[];
  const issue = issues?.find((i) => i.id === check.id || i.identifier === check.id);
  return issue?.status === check.expected;
});

registerPredicate("issue_has_priority", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const issues = snapshot.issues as { id: string; identifier?: string; priority: string }[];
  const issue = issues?.find((i) => i.id === check.id || i.identifier === check.id);
  return issue?.priority === check.expected;
});

registerPredicate("issue_in_cycle", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const issues = snapshot.issues as { id: string; identifier?: string; cycleId: string | null }[];
  const issue = issues?.find((i) => i.id === check.id || i.identifier === check.id);
  return issue?.cycleId === check.expected;
});

registerPredicate("issue_has_estimate", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const issues = snapshot.issues as { id: string; identifier?: string; estimate: number | null }[];
  const issue = issues?.find((i) => i.id === check.id || i.identifier === check.id);
  return issue?.estimate === Number(check.expected);
});

registerPredicate("issue_has_assignee", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const issues = snapshot.issues as { id: string; identifier?: string; assigneeId: string | null }[];
  const issue = issues?.find((i) => i.id === check.id || i.identifier === check.id);
  return issue?.assigneeId === check.expected;
});

registerPredicate("cycle_has_state", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const cycles = snapshot.cycles as { id: string; state: string }[];
  const cycle = cycles?.find((c) => c.id === check.id);
  return cycle?.state === check.expected;
});

registerPredicate("cycle_issue_count", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const issues = snapshot.issues as { cycleId: string | null }[];
  const count = issues?.filter((i) => i.cycleId === check.id).length ?? 0;
  return count === Number(check.expected);
});

registerPredicate("project_has_fields", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const expected = check.expected as Record<string, unknown> | undefined;
  if (!expected) return false;
  const projects = snapshot.projects as { id: string; name?: string }[];
  let project = check.id ? projects?.find((p) => p.id === check.id) : undefined;
  if (!project && expected.name) {
    project = projects?.find(
      (p) => p.name?.toLowerCase() === String(expected.name).toLowerCase(),
    );
  }
  if (!project) return false;
  return Object.entries(expected).every(
    ([key, val]) => JSON.stringify(getNestedField(project, key)) === JSON.stringify(val),
  );
});

registerPredicate("label_exists", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const expected = check.expected as Record<string, unknown> | string | undefined;
  if (!expected) return false;
  const labels = snapshot.labels as { id: string; name: string; color?: string }[];
  if (typeof expected === "string") {
    return labels?.some((l) => l.name === expected) ?? false;
  }
  const exp = expected as Record<string, unknown>;
  return labels?.some((l) => {
    return Object.entries(exp).every(
      ([key, val]) => JSON.stringify(getNestedField(l, key)) === JSON.stringify(val),
    );
  }) ?? false;
});

registerPredicate("all_issues_in_status", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const issues = snapshot.issues as { status: string }[];
  return issues?.every((i) => i.status === check.expected) ?? false;
});

registerPredicate("issue_count_equals", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const issues = snapshot.issues as unknown[];
  return issues?.length === Number(check.expected);
});

registerPredicate("team_has_fields", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const expected = check.expected as Record<string, unknown> | undefined;
  if (!expected) return false;
  const teams = snapshot.teams as { id: string; name?: string; key?: string }[];
  let team = check.id ? teams?.find((t) => t.id === check.id) : undefined;
  if (!team && expected.name) {
    team = teams?.find(
      (t) => t.name?.toLowerCase() === String(expected.name).toLowerCase(),
    );
  }
  if (!team) return false;
  return Object.entries(expected).every(
    ([key, val]) => JSON.stringify(getNestedField(team, key)) === JSON.stringify(val),
  );
});

// ---------------------------------------------------------------------------
// Export for use in API routes
// ---------------------------------------------------------------------------

export { linearAdapter };
