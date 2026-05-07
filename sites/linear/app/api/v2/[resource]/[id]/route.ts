// ---------------------------------------------------------------------------
// GET    /api/v2/:resource/:id   → fetch one (tries getByKey first, then getById)
// PUT    /api/v2/:resource/:id   → update
// PATCH  /api/v2/:resource/:id   → update (partial-update semantic)
// DELETE /api/v2/:resource/:id   → delete
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server"
import { getResource } from "../../../../lib/resources"
import { route } from "../../../../lib/route"

type Ctx = { params: Promise<{ resource: string; id: string }> }

function resolveItem(
  def: ReturnType<typeof getResource>,
  id: string
): { item: unknown; resolvedId: string } | null {
  if (!def) return null
  const byKey = def.getByKey?.(id)
  if (byKey) {
    return {
      item: byKey,
      resolvedId: (byKey as Record<string, unknown>).id as string,
    }
  }
  const byId = def.getById(id)
  if (byId) return { item: byId, resolvedId: id }
  return null
}

export const GET = route<Ctx>(async (_request, { params }) => {
  const { resource, id } = await params
  const def = getResource(resource)
  if (!def) {
    return NextResponse.json(
      { error: `Unknown resource: ${resource}` },
      { status: 404 }
    )
  }
  const found = resolveItem(def, id)
  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(found.item)
})

export const PUT = route<Ctx>(async (request, { params }) => {
  const { resource, id } = await params
  const def = getResource(resource)
  if (!def?.update) {
    return NextResponse.json(
      { error: def ? `Resource ${resource} is read-only` : `Unknown resource` },
      { status: def ? 405 : 404 }
    )
  }
  const found = resolveItem(def, id)
  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
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
  const result = def.update(found.resolvedId, fields ?? {})
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
})

export const PATCH = PUT

export const DELETE = route<Ctx>(async (_request, { params }) => {
  const { resource, id } = await params
  const def = getResource(resource)
  if (!def?.remove) {
    return NextResponse.json(
      {
        error: def
          ? `Resource ${resource} does not support delete`
          : `Unknown resource`,
      },
      { status: def ? 405 : 404 }
    )
  }
  const found = resolveItem(def, id)
  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  const result = def.remove(found.resolvedId)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
})
