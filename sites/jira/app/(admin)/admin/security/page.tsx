import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Security" }

export default function SecurityPage() {
  redirect("/admin/security/security-guide")
}
