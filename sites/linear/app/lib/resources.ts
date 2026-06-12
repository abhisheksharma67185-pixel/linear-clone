/**
 * Resource registry for /api/v2 endpoints.
 * Maps resource names to handler objects with CRUD operations.
 */

import * as store from "./store"

export interface ResourceDef {
  list(): unknown
  getById?(id: string): unknown
  getByKey?(key: string): unknown
  create?(data: unknown): unknown
  update?(id: string, data: unknown): unknown
  remove?(id: string): unknown
  actions?: Record<string, (id: string, data: unknown) => unknown>
}

const resources: Record<string, ResourceDef> = {
  projects: {
    list: () => store.getProjects(),
    getById: (id) => store.getProjectById(id),
    create: (data: unknown) => {
      const d = data as Record<string, unknown>
      return store.createProject({
        name: String(d.name || ""),
        description: d.description ? String(d.description) : undefined,
        teamId: d.teamId ? String(d.teamId) : undefined,
        status: d.status as
          | "planned"
          | "in_progress"
          | "completed"
          | "cancelled"
          | undefined,
      })
    },
    update: (id, data: unknown) => {
      const d = data as Record<string, unknown>
      return store.updateProject(id, {
        name: d.name ? String(d.name) : undefined,
        description: d.description ? String(d.description) : undefined,
        status: d.status as
          | "planned"
          | "in_progress"
          | "completed"
          | "cancelled"
          | undefined,
      })
    },
  },
  issues: {
    list: () => store.getIssues(),
    getById: (id) => store.getIssueById(id),
    create: (data: unknown) => {
      const d = data as Record<string, unknown>
      return store.createIssue({
        title: String(d.title || ""),
        description: d.description ? String(d.description) : undefined,
        projectId: d.projectId ? String(d.projectId) : undefined,
        assigneeId: d.assigneeId ? String(d.assigneeId) : undefined,
        priority: d.priority as
          | "urgent"
          | "high"
          | "medium"
          | "low"
          | "none"
          | undefined,
      })
    },
    update: (id, data: unknown) => {
      const d = data as Record<string, unknown>
      return store.updateIssue(id, {
        title: d.title ? String(d.title) : undefined,
        description: d.description ? String(d.description) : undefined,
        assigneeId: d.assigneeId ? String(d.assigneeId) : undefined,
        priority: d.priority as
          | "urgent"
          | "high"
          | "medium"
          | "low"
          | "none"
          | undefined,
      })
    },
    remove: (id) => store.deleteIssue(id),
  },
  cycles: {
    list: () => store.getCycles(),
    getById: (id) => store.getCycleById(id),
    create: (data: unknown) => {
      const d = data as Record<string, unknown>
      return store.createCycle({
        name: String(d.name || ""),
        description: d.description ? String(d.description) : undefined,
        startDate: d.startDate ? String(d.startDate) : undefined,
        endDate: d.endDate ? String(d.endDate) : undefined,
      })
    },
  },
  labels: {
    list: () => store.getLabels(),
    getById: (id) => store.getLabelById(id),
    create: (data: unknown) => {
      const d = data as Record<string, unknown>
      return store.createLabel({
        name: String(d.name || ""),
        color: d.color ? String(d.color) : "blue",
      })
    },
    update: (id, data: unknown) => {
      const d = data as Record<string, unknown>
      return store.updateLabel(id, {
        name: d.name ? String(d.name) : undefined,
        color: d.color ? String(d.color) : undefined,
      })
    },
    remove: (id) => store.deleteLabel(id),
  },
  members: {
    list: () => store.getMembers(),
    getById: (id) => store.getMemberById(id),
  },
  teams: {
    list: () => store.getTeams(),
    getById: (id) => store.getTeamById(id),
    getByKey: (key) => store.getTeamByKey(key),
    create: (data: unknown) => {
      const d = data as Record<string, unknown>
      return store.createTeam({
        name: String(d.name || ""),
        description: d.description ? String(d.description) : undefined,
      })
    },
    update: (id, data: unknown) => {
      const d = data as Record<string, unknown>
      return store.updateTeam(id, {
        name: d.name ? String(d.name) : undefined,
        description: d.description ? String(d.description) : undefined,
      })
    },
  },
  views: {
    list: () => store.getViews(),
    getById: (id) => store.getViewById(id),
    create: (data: unknown) => {
      const d = data as Record<string, unknown>
      return store.createView({
        name: String(d.name || ""),
        description: d.description ? String(d.description) : undefined,
        filterQuery: d.filterQuery ? String(d.filterQuery) : undefined,
      })
    },
    update: (id, data: unknown) => {
      const d = data as Record<string, unknown>
      return store.updateView(id, {
        name: d.name ? String(d.name) : undefined,
        description: d.description ? String(d.description) : undefined,
        filterQuery: d.filterQuery ? String(d.filterQuery) : undefined,
      })
    },
    remove: (id) => store.deleteView(id),
  },
}

/**
 * Get a resource definition by name
 */
export function getResource(resourceName: string): ResourceDef | undefined {
  return resources[resourceName]
}

/**
 * List all available resources
 */
export function listResources(): string[] {
  return Object.keys(resources)
}
