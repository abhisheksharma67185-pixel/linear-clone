import type { Metadata } from "next"

// See app/(workspace)/initiatives/layout.tsx for the rationale.
export const metadata: Metadata = { title: "Inbox" }

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
