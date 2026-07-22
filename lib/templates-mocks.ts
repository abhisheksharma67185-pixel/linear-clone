// In-memory mock store for the Issue templates settings page.
// State now lives on the per-session LinearStoreState; this is a thin facade.

import { _state } from "@/app/lib/session"
import type {
  CustomFormField,
  IssueTemplate,
  TemplateDefaults,
  TemplateType,
} from "@/app/lib/state"

export type { CustomFormField, IssueTemplate, TemplateDefaults, TemplateType }

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

export const templates: IssueTemplate[] = arrayProxy(
  () => _state().issueTemplates
)

function nextOrder(): number {
  const arr = _state().issueTemplates
  return arr.length === 0 ? 0 : Math.max(...arr.map((t) => t.order)) + 1
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
  _state().issueTemplates.push(template)
  return { success: true, data: template }
}

export function updateTemplate(
  id: string,
  patch: Partial<Omit<IssueTemplate, "id" | "createdAt" | "type">>
): { success: true; data: IssueTemplate } | { success: false; error: string } {
  const t = _state().issueTemplates.find((x) => x.id === id)
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
  const arr = _state().issueTemplates
  const idx = arr.findIndex((t) => t.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  arr.splice(idx, 1)
  return { success: true as const, data: { id } }
}

export function duplicateTemplate(id: string) {
  const arr = _state().issueTemplates
  const src = arr.find((t) => t.id === id)
  if (!src) return { success: false as const, error: "Not found" }
  const copy: IssueTemplate = {
    ...src,
    id: `tpl_${Math.random().toString(36).slice(2, 10)}`,
    name: `${src.name} (copy)`,
    order: nextOrder(),
    createdAt: now(),
    updatedAt: now(),
  }
  arr.push(copy)
  return { success: true as const, data: copy }
}
