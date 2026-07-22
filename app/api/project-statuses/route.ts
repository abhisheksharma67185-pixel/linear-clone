import { NextResponse } from "next/server"
import {
  createStatus,
  projectStatuses,
  usageCountFor,
} from "@/lib/project-statuses-mocks"

export async function GET() {
  const sorted = [...projectStatuses].sort((a, b) => a.order - b.order)
  return NextResponse.json(
    sorted.map((s) => ({ ...s, usageCount: usageCountFor(s) }))
  )
}

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = createStatus(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(
    { ...result.data, usageCount: usageCountFor(result.data) },
    { status: 201 }
  )
}
