import { NextResponse } from "next/server"
import { templates, createTemplate } from "@/lib/templates-mocks"

export async function GET() {
  // Return sorted by order ascending so the client can render drag-handle rows
  // in the same order without extra sorting.
  const sorted = [...templates].sort((a, b) => a.order - b.order)
  return NextResponse.json(sorted)
}

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = createTemplate(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
