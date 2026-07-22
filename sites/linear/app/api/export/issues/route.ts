import { NextResponse } from "next/server"
import { buildExportRequest } from "@/lib/export-issues"

export async function POST(request: Request) {
  let body: unknown = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const payload = buildExportRequest(
    (body as { includePrivateTeams?: unknown })?.includePrivateTeams
  )
  // Mock an async job: in production this would enqueue a background
  // export task and send a download link by email.
  return NextResponse.json(
    {
      queued: true,
      eta: "a few minutes",
      request: payload,
    },
    { status: 202 }
  )
}
