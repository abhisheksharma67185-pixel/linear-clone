// In-memory mock store for Document templates (settings → Documents).

export type DocumentTemplate = {
  id: string
  name: string
  iconName: string // "document", "book", "pencil", "sparkle", "folder"
  body: string // rich-text body stored as plain text for the prototype
  createdAt: string
  updatedAt: string
}

const now = () => new Date().toISOString()

export const documentTemplates: DocumentTemplate[] = []

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
  documentTemplates.push(template)
  return { success: true as const, data: template }
}

export function updateDocumentTemplate(
  id: string,
  patch: Partial<Omit<DocumentTemplate, "id" | "createdAt">>
) {
  const t = documentTemplates.find((x) => x.id === id)
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
  const idx = documentTemplates.findIndex((t) => t.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  documentTemplates.splice(idx, 1)
  return { success: true as const, data: { id } }
}
