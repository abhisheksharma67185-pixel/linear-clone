import { NextResponse } from "next/server"
import { inviteMembers } from "@/lib/members-admin-mocks"

export async function POST(request: Request) {
  let body: {
    emails?: string
    role?: unknown
    teamIds?: unknown
  } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  // Forward the optional role + teamIds — both default sensibly inside
  // `inviteMembers` if absent. This is what fixes the "always Admin
  // (Invited)" Status-column bug: the modal's role choice is finally
  // persisted instead of being discarded at the API boundary.
  const result = inviteMembers(body.emails, {
    role: body.role,
    teamIds: body.teamIds,
  })
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ invited: result.data }, { status: 201 })
}
