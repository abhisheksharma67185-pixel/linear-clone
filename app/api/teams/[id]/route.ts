import { NextResponse } from "next/server"
import {
  archiveTeam,
  deleteTeam,
  leaveTeam,
  restoreTeam,
} from "@/lib/teams-admin-mocks"

type Action = "archive" | "restore" | "delete" | "leave"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: { action?: Action } = {}
  try {
    body = (await request.json()) as { action?: Action }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  switch (body.action) {
    case "archive":
      archiveTeam(id)
      break
    case "restore":
      restoreTeam(id)
      break
    case "delete":
      deleteTeam(id)
      break
    case "leave":
      leaveTeam(id)
      break
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
