import { NextResponse } from "next/server"
import * as store from "../../../lib/store"
import { route } from "../../../lib/route"

export const GET = route(async () => {
  return NextResponse.json(store.getMembers())
})
