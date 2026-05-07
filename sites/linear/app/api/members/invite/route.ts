import { NextResponse } from "next/server"
import { inviteMembers } from "@/lib/members-admin-mocks"
import { route } from "@/app/lib/with-route"

export const POST = route(async (request) => {
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
  const result = inviteMembers(body.emails, {
    role: body.role,
    teamIds: body.teamIds,
  })
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ invited: result.data }, { status: 201 })
})
