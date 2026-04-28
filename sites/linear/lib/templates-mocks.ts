// In-memory mock store for the Issue templates settings page.

export type TemplateType = "standard" | "custom-form"

export type TemplateDefaults = {
  teamId: string | null
  priority: "none" | "low" | "medium" | "high" | "urgent"
  assigneeId: string | null
  projectId: string | null
  labelIds: string[]
  status?: string | null
  estimate?: number | null
  cycleId?: string | null
  dueDate?: string | null
  parentId?: string | null
}

export type CustomFormField = {
  id: string
  kind:
    | "text"
    | "textarea"
    | "select"
    | "multi-select"
    | "number"
    | "date"
    | "toggle"
  label: string
  placeholder: string
  required: boolean
  options: string[] // used for select / multi-select
}

export type IssueTemplate = {
  id: string
  type: TemplateType
  name: string
  description: string
  issueTitle: string
  issueBody: string
  defaults: TemplateDefaults
  fields: CustomFormField[] // populated for custom-form templates
  order: number
  createdAt: string
  updatedAt: string
}

const now = () => new Date().toISOString()

export const templates: IssueTemplate[] = []

function nextOrder(): number {
  return templates.length === 0
    ? 0
    : Math.max(...templates.map((t) => t.order)) + 1
}

export function createTemplate(
  input: Partial<IssueTemplate> & { name: string; type: TemplateType }
): { success: true; data: IssueTemplate } | { success: false; error: string } {
  if (!input.name?.trim()) {
    return { success: false, error: "Name is required" }
  }
  if (!input.defaults?.teamId) {
    return { success: false, error: "Team is required" }
  }
  const t = now()
  const template: IssueTemplate = {
    id: `tpl_${Math.random().toString(36).slice(2, 10)}`,
    type: input.type,
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    issueTitle: input.issueTitle ?? "",
    issueBody: input.issueBody ?? "",
    defaults: {
      teamId: input.defaults.teamId,
      priority: input.defaults.priority ?? "none",
      assigneeId: input.defaults.assigneeId ?? null,
      projectId: input.defaults.projectId ?? null,
      labelIds: input.defaults.labelIds ?? [],
      status: input.defaults.status ?? null,
      estimate: input.defaults.estimate ?? null,
      cycleId: input.defaults.cycleId ?? null,
      dueDate: input.defaults.dueDate ?? null,
      parentId: input.defaults.parentId ?? null,
    },
    fields: input.fields ?? [],
    order: nextOrder(),
    createdAt: t,
    updatedAt: t,
  }
  templates.push(template)
  return { success: true, data: template }
}

export function updateTemplate(
  id: string,
  patch: Partial<Omit<IssueTemplate, "id" | "createdAt" | "type">>
): { success: true; data: IssueTemplate } | { success: false; error: string } {
  const t = templates.find((x) => x.id === id)
  if (!t) return { success: false, error: "Template not found" }
  if (patch.name !== undefined) {
    if (!patch.name.trim())
      return { success: false, error: "Name cannot be empty" }
    t.name = patch.name.trim()
  }
  if (patch.description !== undefined) t.description = patch.description
  if (patch.issueTitle !== undefined) t.issueTitle = patch.issueTitle
  if (patch.issueBody !== undefined) t.issueBody = patch.issueBody
  if (patch.defaults !== undefined)
    t.defaults = { ...t.defaults, ...patch.defaults }
  if (patch.fields !== undefined) t.fields = patch.fields
  if (patch.order !== undefined) t.order = patch.order
  t.updatedAt = now()
  return { success: true, data: t }
}

export function deleteTemplate(id: string) {
  const idx = templates.findIndex((t) => t.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  templates.splice(idx, 1)
  return { success: true as const, data: { id } }
}

export function duplicateTemplate(id: string) {
  const src = templates.find((t) => t.id === id)
  if (!src) return { success: false as const, error: "Not found" }
  const copy: IssueTemplate = {
    ...src,
    id: `tpl_${Math.random().toString(36).slice(2, 10)}`,
    name: `${src.name} (copy)`,
    order: nextOrder(),
    createdAt: now(),
    updatedAt: now(),
  }
  templates.push(copy)
  return { success: true as const, data: copy }
}
