import type { Metadata } from "next"

export const metadata: Metadata = { title: "User Counts" }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
