import type { Metadata } from "next"

export const metadata: Metadata = { title: "Migration assistant" }

export default function MigrationAssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
