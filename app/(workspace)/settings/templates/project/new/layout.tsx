import type { Metadata } from "next"

// See app/(workspace)/settings/templates/document/new/layout.tsx —
// same rationale, project-template variant.
export const metadata: Metadata = { title: "New project template" }

export default function NewProjectTemplateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
