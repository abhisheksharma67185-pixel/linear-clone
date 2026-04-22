import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../../lib/store"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: { name?: string; goal?: string; durationWeeks?: number } = {}
  try {
    body = await request.json()
  } catch {
    // no body is fine — use defaults
  }
  const result = store.startSprint(id, body)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}
