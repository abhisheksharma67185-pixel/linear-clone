import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../../lib/store"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }

  const issueId = body.issue_id ?? body.issueId
  if (!issueId || typeof issueId !== "string") {
    return NextResponse.json(
      { error: "issue_id (string) is required" },
      { status: 400 }
    )
  }

  const result = store.moveIssueToSprint(issueId, id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}
