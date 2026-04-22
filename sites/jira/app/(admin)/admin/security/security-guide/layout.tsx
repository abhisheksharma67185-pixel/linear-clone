import type { Metadata } from "next"

export const metadata: Metadata = { title: "Security Guide" }

export default function SecurityGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
