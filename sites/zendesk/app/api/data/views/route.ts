import { NextResponse } from "next/server"
import "../../../lib/init-sim"
import * as store from "../../../lib/store"

export async function GET() {
  const views = store.getViews()
  return NextResponse.json({ total: views.length, views })
}
