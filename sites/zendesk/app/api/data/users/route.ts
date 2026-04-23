import { NextRequest, NextResponse } from "next/server"
import "../../../lib/init-sim"
import * as store from "../../../lib/store"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const role = url.searchParams.get("role")
  let users = store.getUsers()
  if (role) users = users.filter((u) => u.role === role)
  return NextResponse.json({ total: users.length, users })
}
