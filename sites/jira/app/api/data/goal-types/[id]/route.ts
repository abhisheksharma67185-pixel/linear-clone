import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = store.updateGoalType(id, {
    name: body.name as string | undefined,
    description: body.description as string | undefined,
    enabled: body.enabled as boolean | undefined,
  })
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === "Goal type not found" ? 404 : 400 }
    )
  }
  return NextResponse.json(result.data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = store.deleteGoalType(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json({ deleted: id })
}
