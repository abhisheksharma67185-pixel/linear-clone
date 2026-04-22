import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const issue = store.getIssueByKey(key) ?? store.getIssueById(key)
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })
  }
  const populate = request.nextUrl.searchParams.get("populate")
  if (populate) {
    const fields = new Set(populate.split(",").map((s) => s.trim()))
    const raw = issue as unknown as Record<string, unknown>
    const populated: Record<string, unknown> = { ...raw }
    if (fields.has("users")) {
      const userMap = new Map(store.getUsers().map((u) => [u.id, u]))
      populated.assignee = raw.assigneeId
        ? (userMap.get(raw.assigneeId as string) ?? null)
        : null
      populated.reporter = userMap.get(raw.reporterId as string) ?? null
    }
    if (fields.has("sprints")) {
      const sprintMap = new Map(store.getSprints().map((s) => [s.id, s]))
      populated.sprint = raw.sprintId
        ? (sprintMap.get(raw.sprintId as string) ?? null)
        : null
    }
    if (fields.has("epics")) {
      const epicMap = new Map(store.getEpics().map((e) => [e.id, e]))
      populated.epic = raw.epicId
        ? (epicMap.get(raw.epicId as string) ?? null)
        : null
    }
    return NextResponse.json(populated)
  }
  return NextResponse.json(issue)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  // Resolve key to id
  const existing = store.getIssueByKey(key) ?? store.getIssueById(key)
  if (!existing) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })
  }
  let fields
  try {
    fields = await request.json()
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const result = store.updateIssue(
    (existing as Record<string, unknown>).id as string,
    fields
  )
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const existing = store.getIssueByKey(key) ?? store.getIssueById(key)
  if (!existing) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })
  }
  let fields
  try {
    fields = await request.json()
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const result = store.updateIssue(
    (existing as Record<string, unknown>).id as string,
    fields
  )
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const existing = store.getIssueByKey(key) ?? store.getIssueById(key)
  if (!existing) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })
  }
  const result = store.deleteIssue(
    (existing as Record<string, unknown>).id as string
  )
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
}
