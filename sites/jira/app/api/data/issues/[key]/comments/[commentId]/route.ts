import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../../../lib/store"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string; commentId: string }> }
) {
  const { commentId } = await params
  let fields
  try {
    fields = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = store.updateComment(commentId, { body: fields.body })
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string; commentId: string }> }
) {
  const { commentId } = await params
  const result = store.deleteComment(commentId)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
}
