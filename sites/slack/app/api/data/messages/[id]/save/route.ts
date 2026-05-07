import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../../lib/store"
import { withSession } from "../../../../../lib/session"

export const POST = withSession(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    let body: { reminder?: string | null; userId?: string } = {}
    try {
      body = await request.json()
    } catch {
      // empty body acceptable
    }
    const result = store.saveMessage(id, body.reminder, body.userId)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data)
  }
)

export const DELETE = withSession(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId") ?? undefined
    const result = store.unsaveMessage(id, userId)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data)
  }
)
