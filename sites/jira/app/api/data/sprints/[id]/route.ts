import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sprint = store.getSprintById(id)
  if (!sprint) {
    return NextResponse.json({ error: "Sprint not found" }, { status: 404 })
  }
  return NextResponse.json(sprint)
}
