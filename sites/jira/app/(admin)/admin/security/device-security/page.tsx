import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Device Security" }

export default function DeviceSecurityPage() {
  redirect("/admin/security/device-security/ip-allowlists")
}
