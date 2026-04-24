"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { TemplateEditor } from "@/components/template-editor"

function NewIssueTemplatePageInner() {
  const params = useSearchParams()
  const rawType = params.get("type")
  const type = rawType === "custom-form" ? "custom-form" : "standard"
  return <TemplateEditor mode="new" type={type} />
}

export default function NewIssueTemplatePage() {
  return (
    <Suspense fallback={null}>
      <NewIssueTemplatePageInner />
    </Suspense>
  )
}
