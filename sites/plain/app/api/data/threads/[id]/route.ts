import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const thread = store.getThreadById(id)
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 })
  }
  return NextResponse.json({
    ...thread,
    messages: store.getMessagesByThread(id),
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Status updates fan out to dedicated mutations so they trigger the right
  // side-effects (snoozedUntil, doneAt, reopen). Anything else flows through
  // updateThread.
  if (body.status === "done") {
    const r = store.doneThread(id)
    return r.success
      ? NextResponse.json(r.data)
      : NextResponse.json({ error: r.error }, { status: 400 })
  }
  if (body.status === "snoozed") {
    const r = store.snoozeThread(
      id,
      body.snoozedUntil ?? new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    )
    return r.success
      ? NextResponse.json(r.data)
      : NextResponse.json({ error: r.error }, { status: 400 })
  }
  if (body.status === "open") {
    const r = store.reopenThread(id)
    return r.success
      ? NextResponse.json(r.data)
      : NextResponse.json({ error: r.error }, { status: 400 })
  }

  const result = store.updateThread(id, body)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}
