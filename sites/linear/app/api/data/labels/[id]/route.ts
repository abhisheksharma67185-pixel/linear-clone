import { NextResponse } from "next/server"
import * as store from "../../../../lib/store"
import { route } from "../../../../lib/route"

type Ctx = { params: Promise<{ id: string }> }

export const GET = route<Ctx>(async (_request, { params }) => {
  const { id } = await params
  const label = store.getLabelById(id)
  if (!label) {
    return NextResponse.json({ error: "Label not found" }, { status: 404 })
  }
  return NextResponse.json(label)
})

export const PUT = route<Ctx>(async (request, { params }) => {
  const { id } = await params
  let fields
  try {
    fields = await request.json()
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const result = store.updateLabel(id, fields)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
})

// PATCH accepts the same fields as PUT; provided for clients that prefer the
// partial-update semantic (e.g. toggling archivedAt without touching name).
export const PATCH = PUT

export const DELETE = route<Ctx>(async (_request, { params }) => {
  const { id } = await params
  const result = store.deleteLabel(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json(result.data)
})
