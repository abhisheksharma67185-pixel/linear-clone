import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s | Administration",
    default: "Administration",
  },
}

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
