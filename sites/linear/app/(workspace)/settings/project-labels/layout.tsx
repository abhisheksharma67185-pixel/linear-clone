import type { ReactNode } from "react"

// Server-component layout so the tab title is in the SSR HTML and the
// browser doesn't briefly show the URL before the JS-set title takes
// over. The page itself is `'use client'` and can't export metadata.
export const metadata = {
  title: "Labels",
}

export default function ProjectLabelsLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
