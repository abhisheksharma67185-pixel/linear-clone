import type { Metadata } from "next"

export const metadata: Metadata = { title: "Edit issue template" }

export default function IssueTemplateEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
