import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = store.updateCustomField(id, {
    name: body.name as string | undefined,
    options: body.options as string[] | undefined,
    multi: body.multi as boolean | undefined,
    description: body.description as string | undefined,
  })
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = store.deleteCustomField(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return new NextResponse(null, { status: 204 })
}
