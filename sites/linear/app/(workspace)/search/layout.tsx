import type { Metadata } from "next"

// See app/(workspace)/initiatives/layout.tsx for the rationale.
export const metadata: Metadata = { title: "Search" }

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
