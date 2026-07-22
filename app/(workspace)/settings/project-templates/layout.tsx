import type { ReactNode } from "react"

export const metadata = {
  title: "Project templates",
}

export default function ProjectTemplatesLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
