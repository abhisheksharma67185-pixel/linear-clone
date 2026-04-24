import { NextResponse } from "next/server"
import {
  createDocumentTemplate,
  documentTemplates,
} from "@/lib/document-template-mocks"

export async function GET() {
  const sorted = [...documentTemplates].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt)
  )
  return NextResponse.json(sorted)
}

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = createDocumentTemplate(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
