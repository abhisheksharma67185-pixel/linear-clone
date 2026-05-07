import { NextResponse } from "next/server"
import { workspace, updateWorkspace } from "@/lib/workspace-mocks"
import { route } from "@/app/lib/route"

export const GET = route(async () => {
  return NextResponse.json(workspace)
})

export const PATCH = route(async (request) => {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = updateWorkspace(body ?? {})
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
})
