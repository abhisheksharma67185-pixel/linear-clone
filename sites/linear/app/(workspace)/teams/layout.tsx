import type { Metadata } from "next"

// See app/(workspace)/initiatives/layout.tsx for the rationale.
// `/teams/[key]/issues` overrides this once a team is selected.
export const metadata: Metadata = { title: "Teams" }

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
