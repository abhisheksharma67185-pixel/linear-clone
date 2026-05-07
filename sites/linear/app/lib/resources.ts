// ---------------------------------------------------------------------------
// Resource registry — single source of truth for the generic /api/v2 dispatcher.
//
// Each resource declares how to list, fetch one, create, update, and delete
// items, plus an optional `actions` map for operations that don't fit CRUD
// (e.g. `cycles.start`, `cycles.complete`). The dispatcher in
// app/api/v2/[resource]/route.ts and [resource]/[id]/[action]?/route.ts uses
// this registry to serve all of /api/v2/* without per-route boilerplate.
//
// Existing /api/data/* routes still work — this is additive.
// ---------------------------------------------------------------------------

import * as store from "./store"

type Result<T> = { success: true; data: T } | { success: false; error: string }

export interface ResourceDefinition<TItem = unknown> {
  list: () => TItem[]
  getById: (id: string) => TItem | undefined
  // Optional: support fetch by alternate key (e.g. issue identifier "PLT-104"),
  // tried before getById.
  getByKey?: (key: string) => TItem | undefined
  create?: (fields: Record<string, unknown>) => Result<TItem>
  update?: (id: string, fields: Record<string, unknown>) => Result<TItem>
  remove?: (id: string) => Result<unknown>
  // Per-resource named actions: cycles.start(id), labels.archive(id), etc.
  actions?: Record<string, (id: string) => Result<unknown>>
}

export const resources: Record<string, ResourceDefinition> = {
  issues: {
    list: () => store.getIssues(),
    getById: (id) => store.getIssueById(id),
    getByKey: (key) => store.getIssueByIdentifier(key),
    create: (f) => store.createIssue(f),
    update: (id, f) => store.updateIssue(id, f),
    remove: (id) => store.deleteIssue(id),
  },
  projects: {
    list: () => store.getProjects(),
    getById: (id) => store.getProjectById(id),
    create: (f) => store.createProject(f),
    update: (id, f) => store.updateProject(id, f),
  },
  cycles: {
    list: () => store.getCycles(),
    getById: (id) => store.getCycleById(id),
    create: (f) => store.createCycle(f),
    actions: {
      start: (id) => store.startCycle(id),
      complete: (id) => store.completeCycle(id),
    },
  },
  labels: {
    list: () => store.getLabels(),
    getById: (id) => store.getLabelById(id),
    create: (f) => store.createLabel(f),
    update: (id, f) => store.updateLabel(id, f),
    remove: (id) => store.deleteLabel(id),
    actions: {
      archive: (id) => store.archiveLabel(id),
      restore: (id) => store.restoreLabel(id),
    },
  },
  "project-labels": {
    list: () => store.getProjectLabels(),
    getById: (id) => store.getProjectLabelById(id),
    create: (f) => store.createProjectLabel(f),
    update: (id, f) => store.updateProjectLabel(id, f),
    remove: (id) => store.deleteProjectLabel(id),
  },
  teams: {
    list: () => store.getTeams(),
    getById: (id) => store.getTeamById(id),
    getByKey: (key) => store.getTeamByKey(key),
    create: (f) => store.createTeam(f),
    update: (id, f) => store.updateTeam(id, f),
  },
  members: {
    list: () => store.getMembers(),
    getById: (id) => store.getMemberById(id),
  },
  views: {
    list: () => store.getViews(),
    getById: (id) => store.getViewById(id),
    create: (f) => store.createView(f),
  },
}

export function getResource(name: string): ResourceDefinition | undefined {
  return resources[name]
}
