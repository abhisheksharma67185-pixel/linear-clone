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
    return NextResponse.json(store.getBookmarks(channel.id))
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
    const result = store.addBookmark(channel.id, body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data, { status: 201 })
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
    const bookmarkId = url.searchParams.get("bookmarkId")
    if (!bookmarkId) {
      return NextResponse.json(
        { error: "bookmarkId query param required" },
        { status: 400 }
      )
    }
    const result = store.removeBookmark(channel.id, bookmarkId)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data)
  }
)
