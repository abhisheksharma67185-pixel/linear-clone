import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const project = store.getProjectByKey(key) ?? store.getProjectById(key)
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }
  return NextResponse.json(project)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  let fields
  try {
    fields = await request.json()
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  let projectId = key
  const byKey = store.getProjectByKey(key)
  if (byKey) projectId = byKey.id

  const result = store.updateProject(projectId, fields)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}
