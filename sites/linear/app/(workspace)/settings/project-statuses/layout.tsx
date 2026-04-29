import type { ReactNode } from "react"

export const metadata = {
  title: "Statuses",
}

export default function ProjectStatusesLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
