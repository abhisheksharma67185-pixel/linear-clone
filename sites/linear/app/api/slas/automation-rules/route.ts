import { NextResponse } from "next/server"
import { automationRules, createRule } from "@/lib/sla-mocks"

export async function GET() {
  return NextResponse.json(automationRules)
}

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = createRule(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
