import { NextResponse } from "next/server"
import * as store from "../../../../lib/store"
import { route } from "../../../../lib/with-route"

type Ctx = { params: Promise<{ key: string }> }

export const GET = route<Ctx>(async (_request, { params }) => {
  const { key } = await params
  const issue = store.getIssueByIdentifier(key) ?? store.getIssueById(key)
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 })
  }
  return NextResponse.json(issue)
})

export const PUT = route<Ctx>(async (request, { params }) => {
  const { key } = await params
  const existing = store.getIssueByIdentifier(key) ?? store.getIssueById(key)
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
})

export const DELETE = route<Ctx>(async (_request, { params }) => {
  const { key } = await params
  const existing = store.getIssueByIdentifier(key) ?? store.getIssueById(key)
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
})
