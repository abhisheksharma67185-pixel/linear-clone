import type { Metadata } from "next"

// `/settings/templates/document/new` is a "use client" editor — without
// an SSR `<title>` the browser tab falls back to the raw URL on F5.
// See app/(workspace)/initiatives/layout.tsx for the broader pattern
// (round 8 added the same shell to top-level workspace routes).
export const metadata: Metadata = { title: "New document template" }

export default function NewDocumentTemplateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
