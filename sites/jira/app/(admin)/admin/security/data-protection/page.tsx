import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Data Protection" }

export default function DataProtectionPage() {
  redirect("/admin/security/data-protection/data-classification")
}
