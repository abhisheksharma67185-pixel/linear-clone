import type { Metadata } from "next"

export const metadata: Metadata = { title: "Teams" }

export default function TeamsGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
