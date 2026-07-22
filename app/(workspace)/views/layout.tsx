import type { Metadata } from "next"

// See app/(workspace)/initiatives/layout.tsx for the rationale.
export const metadata: Metadata = { title: "Views" }

export default function ViewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
