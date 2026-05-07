import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"
import { withSession } from "../../../lib/session"

export const GET = withSession(async (request: NextRequest) => {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId") ?? undefined
  return NextResponse.json(store.getNotifications(userId))
})

export const PATCH = withSession(async (request: NextRequest) => {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId") ?? undefined
  store.markAllNotificationsRead(userId)
  return NextResponse.json({ success: true })
})
