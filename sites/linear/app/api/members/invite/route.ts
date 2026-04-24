import { NextResponse } from "next/server"
import { inviteMembers } from "@/lib/members-admin-mocks"

export async function POST(request: Request) {
  let body: { emails?: string } = {}
  try {
    body = (await request.json()) as { emails?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = inviteMembers(body.emails)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ invited: result.data }, { status: 201 })
}
