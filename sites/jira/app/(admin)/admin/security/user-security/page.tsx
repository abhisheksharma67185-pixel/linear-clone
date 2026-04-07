import { redirect } from "next/navigation"

export default function UserSecurityPage() {
  redirect("/admin/security/user-security/authentication-policies")
}
