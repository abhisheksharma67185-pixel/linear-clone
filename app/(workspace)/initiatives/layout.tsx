import type { Metadata } from "next"

// Static `<title>` for the top-level Initiatives route. The page itself
// is "use client" (interactive lists / live state), so we keep the
// title in this thin server-component layout — that way SSR HTML
// carries the right `<title>` on F5 and the browser tab doesn't fall
// back to the URL during the JS-load gap.
export const metadata: Metadata = { title: "Initiatives" }

export default function InitiativesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
