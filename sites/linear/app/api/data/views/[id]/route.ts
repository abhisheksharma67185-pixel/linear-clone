import { NextResponse } from "next/server"
import * as store from "../../../../lib/store"
import { route } from "../../../../lib/with-route"

type Ctx = { params: Promise<{ id: string }> }

export const GET = route<Ctx>(async (_request, { params }) => {
  const { id } = await params
  const view = store.getViewById(id)
  if (!view) {
    return NextResponse.json({ error: "View not found" }, { status: 404 })
  }
  return NextResponse.json(view)
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
  const result = store.updateView(id, fields)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === "View not found" ? 404 : 400 }
    )
  }
  return NextResponse.json(result.data)
})

export const DELETE = route<Ctx>(async (_request, { params }) => {
  const { id } = await params
  const result = store.deleteView(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
})
