// In-memory mock store for the Project templates settings page.
// State now lives on the per-session LinearStoreState; this is a thin facade.

import { _state } from "@/app/lib/session"
import type {
  ProjectTemplate,
  ProjectTemplateAttributes,
  ProjectTemplateScope,
  ProjectTemplateVisibility,
  ProjectMilestone,
} from "@/app/lib/state"

export type {
  ProjectTemplate,
  ProjectTemplateAttributes,
  ProjectTemplateScope,
  ProjectTemplateVisibility,
  ProjectMilestone,
}

const now = () => new Date().toISOString()

function arrayProxy<T>(getArr: () => T[]): T[] {
  return new Proxy([] as T[], {
    get(_t, prop) {
      const arr = getArr()
      const value = (arr as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === "function"
        ? (value as (...a: unknown[]) => unknown).bind(arr)
        : value
    },
    set(_t, prop, value) {
      const arr = getArr() as unknown as Record<string | symbol, unknown>
      arr[prop] = value
      return true
    },
    has: (_t, prop) => prop in getArr(),
    ownKeys: () => Object.keys(getArr()),
    getOwnPropertyDescriptor: (_t, prop) =>
      Object.getOwnPropertyDescriptor(getArr(), prop),
  })
}

export const projectTemplates: ProjectTemplate[] = arrayProxy(
  () => _state().projectTemplates
)

function nextOrder(): number {
  const arr = _state().projectTemplates
  return arr.length === 0 ? 0 : Math.max(...arr.map((t) => t.order)) + 1
}

function defaults(): Omit<
  ProjectTemplate,
  "id" | "name" | "order" | "createdAt" | "updatedAt"
> {
  return {
    iconName: "cube",
    projectName: "",
    summary: "",
    description: "",
    attributes: {
      status: "backlog",
      priority: "none",
      leadId: null,
      memberIds: [],
      teamId: null,
      labelIds: [],
      dependencies: [],
      issuesSeed: 0,
    },
    milestones: [],
    visibility: "workspace",
    scope: "workspace",
  }
}

export function createProjectTemplate(
  input: {
    name?: string
  } & Partial<ProjectTemplate>
) {
  if (!input.name?.trim()) {
    return { success: false as const, error: "Name is required" }
  }
  const base = defaults()
  const t = now()
  const template: ProjectTemplate = {
    id: `pt_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    iconName: input.iconName ?? base.iconName,
    projectName: input.projectName ?? base.projectName,
    summary: input.summary ?? base.summary,
    description: input.description ?? base.description,
    attributes: { ...base.attributes, ...(input.attributes ?? {}) },
    milestones: input.milestones ?? [],
    visibility: input.visibility ?? base.visibility,
    scope: input.scope ?? base.scope,
    order: nextOrder(),
    createdAt: t,
    updatedAt: t,
  }
  _state().projectTemplates.push(template)
  return { success: true as const, data: template }
}

export function updateProjectTemplate(
  id: string,
  patch: Partial<Omit<ProjectTemplate, "id" | "createdAt">>
) {
  const t = _state().projectTemplates.find((x) => x.id === id)
  if (!t) return { success: false as const, error: "Template not found" }
  if (patch.name !== undefined) {
    if (!patch.name.trim())
      return { success: false as const, error: "Name cannot be empty" }
    t.name = patch.name.trim()
  }
  if (patch.iconName !== undefined) t.iconName = patch.iconName
  if (patch.projectName !== undefined) t.projectName = patch.projectName
  if (patch.summary !== undefined) t.summary = patch.summary
  if (patch.description !== undefined) t.description = patch.description
  if (patch.attributes !== undefined)
    t.attributes = { ...t.attributes, ...patch.attributes }
  if (patch.milestones !== undefined) t.milestones = patch.milestones
  if (patch.visibility !== undefined) t.visibility = patch.visibility
  if (patch.scope !== undefined) t.scope = patch.scope
  if (patch.order !== undefined) t.order = patch.order
  t.updatedAt = now()
  return { success: true as const, data: t }
}

export function deleteProjectTemplate(id: string) {
  const arr = _state().projectTemplates
  const idx = arr.findIndex((t) => t.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  arr.splice(idx, 1)
  return { success: true as const, data: { id } }
}

export function duplicateProjectTemplate(id: string) {
  const arr = _state().projectTemplates
  const src = arr.find((t) => t.id === id)
  if (!src) return { success: false as const, error: "Not found" }
  const copy: ProjectTemplate = {
    ...src,
    id: `pt_${Math.random().toString(36).slice(2, 10)}`,
    name: `${src.name} (copy)`,
    order: nextOrder(),
    createdAt: now(),
    updatedAt: now(),
  }
  arr.push(copy)
  return { success: true as const, data: copy }
}
