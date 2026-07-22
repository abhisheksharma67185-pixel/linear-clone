import type { Metadata } from "next"

export const metadata: Metadata = { title: "Edit project template" }

export default function ProjectTemplateEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
