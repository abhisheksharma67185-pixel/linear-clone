import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Workspace Settings",
}

export default function OrganizationSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
