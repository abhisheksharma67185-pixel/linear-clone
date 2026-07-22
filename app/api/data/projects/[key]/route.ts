import { NextResponse } from "next/server"
import * as store from "../../../../lib/store"
import { route } from "../../../../lib/with-route"

type Ctx = { params: Promise<{ key: string }> }

export const GET = route<Ctx>(async (_request, { params }) => {
  const { key } = await params
  const team = store.getTeamByKey(key)
  if (team) {
    return NextResponse.json(team)
  }
  const project = store.getProjectById(key)
  if (project) {
    return NextResponse.json(project)
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 })
})

export const PUT = route<Ctx>(async (request, { params }) => {
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
  const team = store.getTeamByKey(key)
  if (team) {
    const result = store.updateTeam(
      (team as Record<string, unknown>).id as string,
      fields
    )
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data)
  }
  const result = store.updateProject(key, fields)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
})
