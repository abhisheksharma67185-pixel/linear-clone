import type { Metadata } from "next"

export const metadata: Metadata = { title: "Identity Providers" }

export default function IdentityProvidersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
