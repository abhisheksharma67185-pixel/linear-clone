"use client"

import { use } from "react"
import { DocumentTemplateEditor } from "@/components/document-template-editor"

export default function EditDocumentTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <DocumentTemplateEditor mode="edit" templateId={id} />
}
