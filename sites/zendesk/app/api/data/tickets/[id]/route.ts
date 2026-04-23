import { NextRequest, NextResponse } from "next/server"
import "../../../../lib/init-sim"
import * as store from "../../../../lib/store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ticket = store.getTicketById(id)
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
  }
  const comments = store.getCommentsByTicket(id)
  return NextResponse.json({ ticket, comments })
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
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const result = store.updateTicket(id, body ?? {})
  if (!result.success) {
    const status = result.error === "Ticket not found" ? 404 : 400
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json(result.data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = store.deleteTicket(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
}
