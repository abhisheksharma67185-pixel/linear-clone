import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../../lib/store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const issue = store.getIssueByKey(key) ?? store.getIssueById(key)
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })
  }
  const issueId = (issue as unknown as Record<string, unknown>).id as string

  const comments = store.getCommentsByIssue(issueId)

  // Populate author objects
  const users = store.getUsers()
  const userMap = new Map(users.map((u) => [u.id, u]))
  const populated = comments.map((c) => ({
    ...c,
    author: userMap.get(c.authorId as string) ?? null,
  }))

  return NextResponse.json(populated)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const issue = store.getIssueByKey(key) ?? store.getIssueById(key)
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })
  }
  const issueId = (issue as unknown as Record<string, unknown>).id as string

  let fields
  try {
    fields = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = store.createComment({
    issueId,
    authorId: fields.authorId ?? "usr-1",
    body: fields.body,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  // Populate author on the response
  const users = store.getUsers()
  const userMap = new Map(users.map((u) => [u.id, u]))
  return NextResponse.json(
    {
      ...result.data,
      author: userMap.get(result.data.authorId as string) ?? null,
    },
    { status: 201 }
  )
}
