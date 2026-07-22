import type { Metadata } from "next"

// See app/(workspace)/initiatives/layout.tsx for the rationale —
// thin server-component shell exists solely to expose a static
// `<title>` for the My-issues route, which is otherwise "use client".
export const metadata: Metadata = { title: "My issues" }

export default function MyIssuesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
