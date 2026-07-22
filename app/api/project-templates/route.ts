import { NextResponse } from "next/server"
import {
  projectTemplates,
  createProjectTemplate,
} from "@/lib/project-template-mocks"

export async function GET() {
  const sorted = [...projectTemplates].sort((a, b) => a.order - b.order)
  return NextResponse.json(sorted)
}

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = createProjectTemplate(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
