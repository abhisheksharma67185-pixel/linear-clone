import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"

export async function GET() {
  return NextResponse.json(store.getGoalTypes())
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = store.createGoalType({
    name: body.name as string | undefined,
    description: body.description as string | undefined,
    enabled: body.enabled as boolean | undefined,
    children: body.children as
      | { name: string; description: string }[]
      | undefined,
  })
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}

/** DELETE /api/data/goal-types — removes all non-seeded goal types (test utility) */
export async function DELETE() {
  const types = store.getGoalTypes()
  let deleted = 0
  for (const t of types) {
    if (!t.seeded) {
      store.deleteGoalType(t.id)
      deleted++
    }
  }
  return NextResponse.json({ deleted })
}
