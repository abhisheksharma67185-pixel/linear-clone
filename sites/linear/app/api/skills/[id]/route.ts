import { NextResponse } from "next/server"
import { updateSkill, deleteSkill } from "@/lib/agent-mocks"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: {
    name?: string
    slashCommand?: string
    promptTemplate?: string
    autoSelectRules?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const skill = updateSkill(id, body)
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  }
  return NextResponse.json(skill)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!deleteSkill(id)) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
}
