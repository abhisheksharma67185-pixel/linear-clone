import { NextResponse } from "next/server"
import "../../../lib/init-sim"
import * as store from "../../../lib/store"

export async function GET() {
  const groups = store.getGroups()
  return NextResponse.json({ total: groups.length, groups })
}
