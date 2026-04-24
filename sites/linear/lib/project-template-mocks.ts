// In-memory mock store for the Project templates settings page.

export type ProjectTemplateVisibility = "private" | "workspace"
export type ProjectTemplateScope = "workspace" | "team"

export type ProjectMilestone = {
  id: string
  name: string
}

export type ProjectTemplateAttributes = {
  status: string // e.g. "backlog"
  priority: "none" | "low" | "medium" | "high" | "urgent"
  leadId: string | null
  memberIds: string[]
  teamId: string | null
  labelIds: string[]
  dependencies: string[] // simple free-text placeholders for the prototype
  issuesSeed: number // 0..N — prefilled issues
}

export type ProjectTemplate = {
  id: string
  name: string
  iconName: string // e.g. "cube", "rocket", "target"
  projectName: string
  summary: string
  description: string
  attributes: ProjectTemplateAttributes
  milestones: ProjectMilestone[]
  visibility: ProjectTemplateVisibility
  scope: ProjectTemplateScope
  order: number
  createdAt: string
  updatedAt: string
}

const now = () => new Date().toISOString()

export const projectTemplates: ProjectTemplate[] = []

function nextOrder(): number {
  return projectTemplates.length === 0
    ? 0
    : Math.max(...projectTemplates.map((t) => t.order)) + 1
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

export function createProjectTemplate(input: {
  name?: string
} & Partial<ProjectTemplate>) {
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
  projectTemplates.push(template)
  return { success: true as const, data: template }
}

export function updateProjectTemplate(
  id: string,
  patch: Partial<Omit<ProjectTemplate, "id" | "createdAt">>
) {
  const t = projectTemplates.find((x) => x.id === id)
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
  const idx = projectTemplates.findIndex((t) => t.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  projectTemplates.splice(idx, 1)
  return { success: true as const, data: { id } }
}

export function duplicateProjectTemplate(id: string) {
  const src = projectTemplates.find((t) => t.id === id)
  if (!src) return { success: false as const, error: "Not found" }
  const copy: ProjectTemplate = {
    ...src,
    id: `pt_${Math.random().toString(36).slice(2, 10)}`,
    name: `${src.name} (copy)`,
    order: nextOrder(),
    createdAt: now(),
    updatedAt: now(),
  }
  projectTemplates.push(copy)
  return { success: true as const, data: copy }
}
