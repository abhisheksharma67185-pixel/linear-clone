"use client"

import { use } from "react"
import { TemplateEditor } from "@/components/template-editor"

export default function EditIssueTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <TemplateEditor mode="edit" templateId={id} />
}
