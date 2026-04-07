import { redirect } from "next/navigation"

export default function DeviceSecurityPage() {
  redirect("/admin/security/device-security/ip-allowlists")
}
