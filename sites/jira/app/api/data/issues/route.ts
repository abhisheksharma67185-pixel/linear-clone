import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"

function populateRelations(
  issues: Record<string, unknown>[],
  fields: Set<string>
) {
  const userMap = fields.has("users")
    ? new Map(store.getUsers().map((u) => [u.id, u]))
    : null
  const sprintMap = fields.has("sprints")
    ? new Map(store.getSprints().map((s) => [s.id, s]))
    : null
  const epicMap = fields.has("epics")
    ? new Map(store.getEpics().map((e) => [e.id, e]))
    : null

  return issues.map((issue) => {
    const populated: Record<string, unknown> = { ...issue }
    if (userMap) {
      populated.assignee = issue.assigneeId
        ? (userMap.get(issue.assigneeId as string) ?? null)
        : null
      populated.reporter = userMap.get(issue.reporterId as string) ?? null
    }
    if (sprintMap) {
      populated.sprint = issue.sprintId
        ? (sprintMap.get(issue.sprintId as string) ?? null)
        : null
    }
    if (epicMap) {
      populated.epic = issue.epicId
        ? (epicMap.get(issue.epicId as string) ?? null)
        : null
    }
    return populated
  })
}

export async function GET(request: NextRequest) {
  const issues = store.getIssues()
  const populate = request.nextUrl.searchParams.get("populate")
  if (populate) {
    const fields = new Set(populate.split(",").map((s) => s.trim()))
    return NextResponse.json(
      populateRelations(issues as unknown as Record<string, unknown>[], fields)
    )
  }
  return NextResponse.json(issues)
}

export async function POST(request: NextRequest) {
  let fields
  try {
    fields = await request.json()
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const result = store.createIssue(fields)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
