import type { Metadata } from "next"

// See app/(workspace)/initiatives/layout.tsx for the rationale.
export const metadata: Metadata = { title: "Cycles" }

export default function CyclesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
