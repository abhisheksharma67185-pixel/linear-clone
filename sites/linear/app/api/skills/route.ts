import { NextResponse } from "next/server"
import { skills, createSkill } from "@/lib/agent-mocks"
import { route } from "@/app/lib/with-route"

export const GET = route(async () => {
  return NextResponse.json(skills)
})

export const POST = route(async (request) => {
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
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }
  if (!body.slashCommand?.trim()) {
    return NextResponse.json(
      { error: "Slash command is required" },
      { status: 400 }
    )
  }
  const skill = createSkill({
    name: body.name,
    slashCommand: body.slashCommand,
    promptTemplate: body.promptTemplate,
    autoSelectRules: body.autoSelectRules,
  })
  return NextResponse.json(skill, { status: 201 })
})
