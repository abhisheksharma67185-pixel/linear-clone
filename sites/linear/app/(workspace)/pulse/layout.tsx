import type { Metadata } from "next"

// See app/(workspace)/initiatives/layout.tsx for the rationale.
export const metadata: Metadata = { title: "Pulse" }

export default function PulseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
