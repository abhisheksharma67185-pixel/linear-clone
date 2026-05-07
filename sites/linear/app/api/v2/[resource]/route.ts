// ---------------------------------------------------------------------------
// GET    /api/v2/:resource         → list
// POST   /api/v2/:resource         → create
//
// Dispatches to the resource registry. Adding a new resource is a one-line
// edit to app/lib/resources.ts — no new route files needed.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server"
import { getResource } from "../../../lib/resources"
import { route } from "../../../lib/route"

type Ctx = { params: Promise<{ resource: string }> }

export const GET = route<Ctx>(async (_request, { params }) => {
  const { resource } = await params
  const def = getResource(resource)
  if (!def) {
    return NextResponse.json(
      { error: `Unknown resource: ${resource}` },
      { status: 404 }
    )
  }
  return NextResponse.json(def.list())
})

export const POST = route<Ctx>(async (request, { params }) => {
  const { resource } = await params
  const def = getResource(resource)
  if (!def) {
    return NextResponse.json(
      { error: `Unknown resource: ${resource}` },
      { status: 404 }
    )
  }
  if (!def.create) {
    return NextResponse.json(
      { error: `Resource ${resource} is read-only` },
      { status: 405 }
    )
  }
  let fields
  try {
    fields = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const result = def.create(fields ?? {})
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
})
