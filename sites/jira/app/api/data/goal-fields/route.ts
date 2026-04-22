import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"

export async function GET() {
  return NextResponse.json(store.getCustomFields())
}

/** DELETE /api/data/goal-fields — removes ALL custom fields (test/dev utility). */
export async function DELETE() {
  const fields = store.getCustomFields()
  for (const f of fields) {
    store.deleteCustomField(f.id)
  }
  return NextResponse.json({ deleted: fields.length })
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = store.createCustomField({
    name: body.name as string | undefined,
    type: body.type as store.CustomField["type"] | undefined,
    options: body.options as string[] | undefined,
    multi: body.multi as boolean | undefined,
    description: body.description as string | undefined,
  })
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
