import type { Metadata } from "next"

export const metadata: Metadata = { title: "Projects" }

export default function ProjectDirectoryGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
