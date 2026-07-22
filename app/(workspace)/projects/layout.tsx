import type { Metadata } from "next"

// See app/(workspace)/initiatives/layout.tsx for the rationale.
// Note: nested route segments (`/projects/[key]`, `/projects/[key]/board`)
// can override this with their own metadata once project names are
// available; this layout only sets the default for the index route.
export const metadata: Metadata = { title: "Projects" }

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
