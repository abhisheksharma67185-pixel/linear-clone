import { NextResponse } from "next/server"
import {
  removeMember,
  resendInvite,
  setMemberRole,
  suspendMember,
  unsuspendMember,
  type MemberRole,
} from "@/lib/members-admin-mocks"

type PatchBody = {
  action: "set-role" | "suspend" | "unsuspend" | "remove" | "resend-invite"
  role?: MemberRole
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: PatchBody = { action: "set-role" }
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  let result
  switch (body.action) {
    case "set-role":
      if (!body.role) {
        return NextResponse.json(
          { error: "Role is required" },
          { status: 400 }
        )
      }
      result = setMemberRole(id, body.role)
      break
    case "suspend":
      result = suspendMember(id)
      break
    case "unsuspend":
      result = unsuspendMember(id)
      break
    case "remove":
      result = removeMember(id)
      break
    case "resend-invite":
      result = resendInvite(id)
      break
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}
