import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: { userId?: string } = {}
  try {
    body = await request.json()
  } catch {
    // empty body acceptable
  }
  const result = store.joinHuddle(id, body.userId)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = store.endHuddle(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}
