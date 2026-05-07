import { NextResponse } from "next/server"
import { agentState, setGuidance, GUIDANCE_MAX_CHARS } from "@/lib/agent-mocks"
import { route } from "@/app/lib/route"

export const GET = route(async () => {
  return NextResponse.json({ guidance: agentState.guidance })
})

export const PATCH = route(async (request) => {
  let body: { guidance?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (typeof body.guidance !== "string") {
    return NextResponse.json(
      { error: "guidance must be a string" },
      { status: 400 }
    )
  }
  if (body.guidance.length > GUIDANCE_MAX_CHARS) {
    return NextResponse.json(
      { error: `guidance exceeds ${GUIDANCE_MAX_CHARS} characters` },
      { status: 400 }
    )
  }
  const next = setGuidance(body.guidance)
  return NextResponse.json({ guidance: next })
})
