import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Organization settings",
}

export default function SettingsPage() {
  redirect("/admin/settings/profile")
}
