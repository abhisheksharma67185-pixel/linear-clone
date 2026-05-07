// In-memory mock store for the Project statuses settings page.
// State now lives on the per-session LinearStoreState; this is a thin facade.

import { _state } from "@/app/lib/session"
import type {
  ProjectStatusRow as ProjectStatus,
  StatusCategory,
} from "@/app/lib/state"

export type { StatusCategory, ProjectStatus }

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

export const projectStatuses: ProjectStatus[] = arrayProxy(
  () => _state().projectStatuses
)

function nextOrderIn(category: StatusCategory): number {
  const siblings = _state().projectStatuses.filter(
    (s) => s.category === category
  )
  if (siblings.length === 0) return STATUS_CATEGORIES.indexOf(category) * 1000
  return Math.max(...siblings.map((s) => s.order)) + 1
}

export function getCategoryDefaultColor(category: StatusCategory): string {
  return CATEGORY_META[category].defaultColor
}

/**
 * Usage count per status. Reads from the live session's projects array so the
 * count reflects per-rollout state. Custom (user-created) statuses report 0.
 */
export function usageCountFor(status: ProjectStatus): number {
  const enumValue = CATEGORY_META[status.category].projectEnum
  if (!enumValue) return 0
  const ownerId = `ps_default_${status.category.replace("-", "_")}`
  if (status.id !== ownerId) return 0
  return _state().projects.filter(
    (p) => (p as { status: string }).status === enumValue
  ).length
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
  _state().projectStatuses.push(status)
  return { success: true as const, data: status }
}

export function updateStatus(
  id: string,
  patch: Partial<Omit<ProjectStatus, "id" | "createdAt" | "category">>
) {
  const s = _state().projectStatuses.find((x) => x.id === id)
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
  const arr = _state().projectStatuses
  const idx = arr.findIndex((s) => s.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  arr.splice(idx, 1)
  return { success: true as const, data: { id } }
}

export function duplicateStatus(id: string) {
  const arr = _state().projectStatuses
  const src = arr.find((s) => s.id === id)
  if (!src) return { success: false as const, error: "Not found" }
  const copy: ProjectStatus = {
    ...src,
    id: `ps_${Math.random().toString(36).slice(2, 10)}`,
    name: `${src.name} (copy)`,
    order: nextOrderIn(src.category),
    createdAt: now(),
    updatedAt: now(),
  }
  arr.push(copy)
  return { success: true as const, data: copy }
}
