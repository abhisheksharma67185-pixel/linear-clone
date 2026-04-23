import { NextRequest, NextResponse } from "next/server"
import "../../../../lib/init-sim"
import { logAction, hasActiveEpisode } from "@thetabench/core"

export async function POST(request: NextRequest) {
  if (!hasActiveEpisode()) {
    return NextResponse.json({ error: "No active episode" }, { status: 400 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }

  logAction(
    body.action ?? "unknown",
    body.payload ?? {},
    body.reward ?? -0.01,
    body.success ?? false
  )

  return NextResponse.json({ logged: true })
}
