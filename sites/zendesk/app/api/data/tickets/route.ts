import { NextRequest, NextResponse } from "next/server"
import "../../../lib/init-sim"
import * as store from "../../../lib/store"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const status = url.searchParams.get("status")
  const channel = url.searchParams.get("channel")
  const groupId = url.searchParams.get("groupId")
  const assigneeId = url.searchParams.get("assigneeId")

  let tickets = store.getTickets()
  if (status) tickets = tickets.filter((t) => t.status === status)
  if (channel) tickets = tickets.filter((t) => t.channel === channel)
  if (groupId) tickets = tickets.filter((t) => t.groupId === groupId)
  if (assigneeId) {
    if (assigneeId === "unassigned") {
      tickets = tickets.filter((t) => t.assigneeId === null)
    } else {
      tickets = tickets.filter((t) => t.assigneeId === assigneeId)
    }
  }

  return NextResponse.json({ total: tickets.length, tickets })
}

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const result = store.createTicket(body ?? {})
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
