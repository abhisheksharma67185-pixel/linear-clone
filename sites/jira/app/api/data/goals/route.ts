import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"

export async function GET() {
  const goals = store.getGoals()
  const users = store.getUsers()
  const userMap = new Map(users.map((u) => [u.id, u]))
  const populated = goals.map((g) => ({
    ...g,
    ownerUser: userMap.get(g.owner as string) ?? null,
  }))
  return NextResponse.json(populated)
}

export async function POST(request: NextRequest) {
  let fields
  try {
    fields = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = store.createGoal(fields)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  // Populate owner for response
  const users = store.getUsers()
  const userMap = new Map(users.map((u) => [u.id, u]))
  const populated = {
    ...result.data,
    ownerUser: userMap.get(result.data.owner as string) ?? null,
  }
  return NextResponse.json(populated, { status: 201 })
}
