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
  const history = store.getHistoryByIssue(issueId)

  const users = store.getUsers()
  const userMap = new Map(users.map((u) => [u.id, u]))

  const populated = history.map((h) => ({
    ...h,
    author: userMap.get(h.authorId as string) ?? null,
  }))

  return NextResponse.json(populated)
}
