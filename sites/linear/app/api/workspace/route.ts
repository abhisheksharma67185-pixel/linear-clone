import { NextResponse } from "next/server"
import { workspace, updateWorkspace } from "@/lib/workspace-mocks"

export async function GET() {
  return NextResponse.json(workspace)
}

export async function PATCH(request: Request) {
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
}
