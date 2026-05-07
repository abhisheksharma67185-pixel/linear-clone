import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"
import { withSession } from "../../../lib/session"

export const GET = withSession(async () => {
  return NextResponse.json(store.getPreferences())
})

export const PATCH = withSession(async (request: NextRequest) => {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  for (const [key, value] of Object.entries(body)) {
    store.setPreference(key, value)
  }
  return NextResponse.json(store.getPreferences())
})
