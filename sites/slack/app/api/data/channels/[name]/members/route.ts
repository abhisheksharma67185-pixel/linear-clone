import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../../lib/store"
import { withSession } from "../../../../../lib/session"

function resolve(name: string) {
  return store.getChannelById(name) ?? store.getChannelByName(name)
}

export const GET = withSession(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
  ) => {
    const { name } = await params
    const channel = resolve(name)
    if (!channel) {
      return NextResponse.json(
        { error: `Channel ${name} not found` },
        { status: 404 }
      )
    }
    const members = channel.memberIds
      .map((id) => store.getUserById(id))
      .filter(Boolean)
    return NextResponse.json(members)
  }
)

export const POST = withSession(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
  ) => {
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
    const userIds = Array.isArray(body.userIds)
      ? body.userIds
      : body.userId
        ? [body.userId]
        : []
    if (userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds (string[]) or userId (string) required" },
        { status: 400 }
      )
    }
    const result = store.inviteToChannel(channel.id, userIds)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data)
  }
)

export const DELETE = withSession(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
  ) => {
    const { name } = await params
    const channel = resolve(name)
    if (!channel) {
      return NextResponse.json(
        { error: `Channel ${name} not found` },
        { status: 404 }
      )
    }
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json(
        { error: "userId query param required" },
        { status: 400 }
      )
    }
    const result = store.removeFromChannel(channel.id, userId)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data)
  }
)
