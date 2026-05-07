import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"
import { withSession } from "../../../../lib/session"

export const GET = withSession(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    const group = store.getUserGroups().find((g) => g.id === id)
    if (!group) {
      return NextResponse.json(
        { error: `User group ${id} not found` },
        { status: 404 }
      )
    }
    return NextResponse.json(group)
  }
)

export const PATCH = withSession(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const result = store.updateUserGroup(id, body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data)
  }
)

export const DELETE = withSession(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    const result = store.disableUserGroup(id)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data)
  }
)
