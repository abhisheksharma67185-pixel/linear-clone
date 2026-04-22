import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const board = store.getBoardById(id)
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 })
  }
  return NextResponse.json(board)
}
