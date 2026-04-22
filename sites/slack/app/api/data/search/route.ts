import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase()
  if (!q) {
    return NextResponse.json({
      query: "",
      messages: [],
      channels: [],
      users: [],
      files: [],
    })
  }

  const messages = store
    .getMessages()
    .filter((m) => !m.isDeleted && m.text.toLowerCase().includes(q))
    .slice(0, 50)

  const channels = store
    .getChannels()
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q)
    )
    .slice(0, 20)

  const users = store
    .getUsers()
    .filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    )
    .slice(0, 20)

  const files = store
    .getMessages()
    .flatMap((m) => m.attachments.map((a) => ({ ...a, messageId: m.id })))
    .filter((a) => a.name.toLowerCase().includes(q))
    .slice(0, 20)

  return NextResponse.json({
    query: q,
    totalResults:
      messages.length + channels.length + users.length + files.length,
    messages,
    channels,
    users,
    files,
  })
}
