"use client"

import { use } from "react"
import { ProjectTemplateEditor } from "@/components/project-template-editor"

export default function EditProjectTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <ProjectTemplateEditor mode="edit" templateId={id} />
}
