// In-memory mock store for Document templates.
// State now lives on the per-session LinearStoreState; this is a thin facade.

import { _state } from "@/app/lib/session"
import type { DocumentTemplate } from "@/app/lib/state"

export type { DocumentTemplate }

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

export const documentTemplates: DocumentTemplate[] = arrayProxy(
  () => _state().documentTemplates
)

export function createDocumentTemplate(input: {
  name?: string
  iconName?: string
  body?: string
}) {
  if (!input.name?.trim()) {
    return { success: false as const, error: "Name is required" }
  }
  const t = now()
  const template: DocumentTemplate = {
    id: `dt_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    iconName: input.iconName ?? "document",
    body: input.body ?? "",
    createdAt: t,
    updatedAt: t,
  }
  _state().documentTemplates.push(template)
  return { success: true as const, data: template }
}

export function updateDocumentTemplate(
  id: string,
  patch: Partial<Omit<DocumentTemplate, "id" | "createdAt">>
) {
  const t = _state().documentTemplates.find((x) => x.id === id)
  if (!t) return { success: false as const, error: "Template not found" }
  if (patch.name !== undefined) {
    if (!patch.name.trim())
      return { success: false as const, error: "Name cannot be empty" }
    t.name = patch.name.trim()
  }
  if (patch.iconName !== undefined) t.iconName = patch.iconName
  if (patch.body !== undefined) t.body = patch.body
  t.updatedAt = now()
  return { success: true as const, data: t }
}

export function deleteDocumentTemplate(id: string) {
  const arr = _state().documentTemplates
  const idx = arr.findIndex((t) => t.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  arr.splice(idx, 1)
  return { success: true as const, data: { id } }
}
