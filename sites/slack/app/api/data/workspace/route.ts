import { NextResponse } from "next/server"
import * as store from "../../../lib/store"
import { withSession } from "../../../lib/session"

export const GET = withSession(async () => {
  return NextResponse.json(store.getWorkspace())
})
