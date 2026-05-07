// ---------------------------------------------------------------------------
// POST /api/v2/:resource/:id/:action  → invoke a named action on an item.
//
// e.g. POST /api/v2/cycles/cycle-3/start    → cycles.start("cycle-3")
//      POST /api/v2/labels/label-7/archive  → labels.archive("label-7")
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server"
import { getResource } from "../../../../../lib/resources"
import { route } from "../../../../../lib/route"

type Ctx = {
  params: Promise<{ resource: string; id: string; action: string }>
}

export const POST = route<Ctx>(async (_request, { params }) => {
  const { resource, id, action } = await params
  const def = getResource(resource)
  if (!def) {
    return NextResponse.json(
      { error: `Unknown resource: ${resource}` },
      { status: 404 }
    )
  }
  const fn = def.actions?.[action]
  if (!fn) {
    return NextResponse.json(
      { error: `Unknown action: ${action} on ${resource}` },
      { status: 404 }
    )
  }
  // Resolve via key first so callers can pass identifiers like "PLT-101".
  const byKey = def.getByKey?.(id)
  const resolvedId = byKey
    ? ((byKey as Record<string, unknown>).id as string)
    : id
  const result = fn(resolvedId)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
})
