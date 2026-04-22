import type { Metadata } from "next"

export const metadata: Metadata = { title: "Goals" }

export default function GoalsGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
