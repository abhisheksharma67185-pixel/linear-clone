import type { Metadata } from "next"

export const metadata: Metadata = { title: "New issue template" }

export default function NewIssueTemplateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
