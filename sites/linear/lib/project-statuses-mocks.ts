// In-memory mock store for the Project statuses settings page.
// A status is a user-definable workflow step within one of five fixed
// categories. Default statuses are seeded; users can add/edit/delete their own.

import { projects } from "@/app/lib/mock-data"

export type StatusCategory =
  | "backlog"
  | "planned"
  | "in-progress"
  | "completed"
  | "canceled"

export const STATUS_CATEGORIES: StatusCategory[] = [
  "backlog",
  "planned",
  "in-progress",
  "completed",
  "canceled",
]

export const CATEGORY_LABEL: Record<StatusCategory, string> = {
  backlog: "Backlog",
  planned: "Planned",
  "in-progress": "In Progress",
  completed: "Completed",
  canceled: "Canceled",
}

// Each category has a default color + "enum" used to compute usage counts from
// the existing `projects` mock data (whose status is one of the Project enum
// values). Custom user-created statuses inherit their category's enum.
const CATEGORY_META: Record<
  StatusCategory,
  { defaultColor: string; projectEnum: string | null }
> = {
  backlog: { defaultColor: "#9ca3af", projectEnum: null },
  planned: { defaultColor: "#a78bfa", projectEnum: "planned" },
  "in-progress": { defaultColor: "#f59e0b", projectEnum: "in_progress" },
  completed: { defaultColor: "#10b981", projectEnum: "completed" },
  canceled: { defaultColor: "#6b7280", projectEnum: "cancelled" },
}

export type ProjectStatus = {
  id: string
  name: string
  description: string
  color: string
  category: StatusCategory
  order: number
  createdAt: string
  updatedAt: string
}

const now = () => new Date().toISOString()

export const projectStatuses: ProjectStatus[] = STATUS_CATEGORIES.map(
  (category, idx) => ({
    id: `ps_default_${category.replace("-", "_")}`,
    name: CATEGORY_LABEL[category],
    description: "",
    color: CATEGORY_META[category].defaultColor,
    category,
    order: idx * 1000,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  })
)

function nextOrderIn(category: StatusCategory): number {
  const siblings = projectStatuses.filter((s) => s.category === category)
  if (siblings.length === 0) return STATUS_CATEGORIES.indexOf(category) * 1000
  return Math.max(...siblings.map((s) => s.order)) + 1
}

export function getCategoryDefaultColor(category: StatusCategory): string {
  return CATEGORY_META[category].defaultColor
}

/**
 * Usage count per status. For default statuses we compute from the current
 * `projects` mock data by matching the category's project enum. Custom
 * statuses in the same category share the count proportionally is out of
 * scope — we just report 0 for user-created statuses. Callers use 0 to hide
 * the "N projects" line.
 */
export function usageCountFor(status: ProjectStatus): number {
  const enumValue = CATEGORY_META[status.category].projectEnum
  if (!enumValue) return 0
  // Only the first default status in a category "owns" that enum's count —
  // otherwise duplicating would double-count the same project.
  const ownerId = `ps_default_${status.category.replace("-", "_")}`
  if (status.id !== ownerId) return 0
  return projects.filter((p) => (p as { status: string }).status === enumValue)
    .length
}

export function createStatus(input: {
  name?: string
  description?: string
  color?: string
  category?: StatusCategory
}) {
  if (!input.name?.trim()) {
    return { success: false as const, error: "Name is required" }
  }
  if (!input.category || !STATUS_CATEGORIES.includes(input.category)) {
    return { success: false as const, error: "Category is required" }
  }
  const t = now()
  const status: ProjectStatus = {
    id: `ps_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    color: input.color ?? getCategoryDefaultColor(input.category),
    category: input.category,
    order: nextOrderIn(input.category),
    createdAt: t,
    updatedAt: t,
  }
  projectStatuses.push(status)
  return { success: true as const, data: status }
}

export function updateStatus(
  id: string,
  patch: Partial<Omit<ProjectStatus, "id" | "createdAt" | "category">>
) {
  const s = projectStatuses.find((x) => x.id === id)
  if (!s) return { success: false as const, error: "Status not found" }
  if (patch.name !== undefined) {
    if (!patch.name.trim())
      return { success: false as const, error: "Name cannot be empty" }
    s.name = patch.name.trim()
  }
  if (patch.description !== undefined) s.description = patch.description
  if (patch.color !== undefined) s.color = patch.color
  if (patch.order !== undefined) s.order = patch.order
  s.updatedAt = now()
  return { success: true as const, data: s }
}

export function deleteStatus(id: string) {
  const idx = projectStatuses.findIndex((s) => s.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  projectStatuses.splice(idx, 1)
  return { success: true as const, data: { id } }
}

export function duplicateStatus(id: string) {
  const src = projectStatuses.find((s) => s.id === id)
  if (!src) return { success: false as const, error: "Not found" }
  const copy: ProjectStatus = {
    ...src,
    id: `ps_${Math.random().toString(36).slice(2, 10)}`,
    name: `${src.name} (copy)`,
    order: nextOrderIn(src.category),
    createdAt: now(),
    updatedAt: now(),
  }
  projectStatuses.push(copy)
  return { success: true as const, data: copy }
}
