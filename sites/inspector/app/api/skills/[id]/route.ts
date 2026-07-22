import { NextResponse } from "next/server"
import { updateSkill, deleteSkill } from "@/lib/agent-mocks"
import { route } from "@/app/lib/with-route"

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = route<Ctx>(async (request, { params }) => {
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
})

export const DELETE = route<Ctx>(async (_request, { params }) => {
  const { id } = await params
  if (!deleteSkill(id)) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
})
