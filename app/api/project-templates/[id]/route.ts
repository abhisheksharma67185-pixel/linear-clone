import { NextResponse } from "next/server"
import {
  projectTemplates,
  updateProjectTemplate,
  deleteProjectTemplate,
} from "@/lib/project-template-mocks"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const t = projectTemplates.find((x) => x.id === id)
  if (!t) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }
  return NextResponse.json(t)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = updateProjectTemplate(id, body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === "Template not found" ? 404 : 400 }
    )
  }
  return NextResponse.json(result.data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = deleteProjectTemplate(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json(result.data)
}
