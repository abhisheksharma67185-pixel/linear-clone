import { NextResponse } from "next/server"
import * as store from "../../../lib/store"
import { route } from "../../../lib/with-route"

export const GET = route(async () => {
  return NextResponse.json(store.getMembers())
})
