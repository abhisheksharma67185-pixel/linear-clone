import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"

export async function GET() {
  const all = store.getMessages()
  return NextResponse.json(all.filter((m) => m.scheduledFor !== null))
}

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (!body.scheduledFor) {
    return NextResponse.json(
      { error: "scheduledFor (ISO timestamp) required" },
      { status: 400 }
    )
  }
  const result = store.scheduleMessage(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) {
    return NextResponse.json(
      { error: "id query param required" },
      { status: 400 }
    )
  }
  const result = store.cancelScheduledMessage(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}
