import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../../lib/store"

function resolve(name: string) {
  return store.getChannelById(name) ?? store.getChannelByName(name)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const channel = resolve(name)
  if (!channel) {
    return NextResponse.json(
      { error: `Channel ${name} not found` },
      { status: 404 }
    )
  }
  const pins = channel.pinnedMessageIds
    .map((id) => store.getMessageById(id))
    .filter(Boolean)
  return NextResponse.json(pins)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const channel = resolve(name)
  if (!channel) {
    return NextResponse.json(
      { error: `Channel ${name} not found` },
      { status: 404 }
    )
  }
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = store.pinMessage(channel.id, body.messageId)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const channel = resolve(name)
  if (!channel) {
    return NextResponse.json(
      { error: `Channel ${name} not found` },
      { status: 404 }
    )
  }
  const url = new URL(request.url)
  const messageId = url.searchParams.get("messageId")
  if (!messageId) {
    return NextResponse.json(
      { error: "messageId query param required" },
      { status: 400 }
    )
  }
  const result = store.unpinMessage(channel.id, messageId)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}
