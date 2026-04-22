import type { Metadata } from "next"

export const metadata: Metadata = { title: "Your Work" }

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
