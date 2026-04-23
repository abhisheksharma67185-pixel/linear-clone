import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const status = url.searchParams.get("status")
  const customerId = url.searchParams.get("customerId")
  const tenantId = url.searchParams.get("tenantId")
  const labelId = url.searchParams.get("labelId")
  const populate = url.searchParams.get("populate")

  let threads = store.getThreads()
  if (status) threads = threads.filter((t) => t.status === status)
  if (customerId) threads = threads.filter((t) => t.customerId === customerId)
  if (tenantId) threads = threads.filter((t) => t.tenantId === tenantId)
  if (labelId) threads = threads.filter((t) => t.labelIds.includes(labelId))

  if (populate) {
    const fields = new Set(populate.split(",").map((s) => s.trim()))
    const customers = fields.has("customers")
      ? new Map(store.getCustomers().map((c) => [c.id, c]))
      : null
    const tenants = fields.has("tenants")
      ? new Map(store.getTenants().map((t) => [t.id, t]))
      : null
    const agentsMap = fields.has("agents")
      ? new Map(store.getAgents().map((a) => [a.id, a]))
      : null
    const labelsMap = fields.has("labels")
      ? new Map(store.getLabels().map((l) => [l.id, l]))
      : null

    return NextResponse.json(
      threads.map((t) => ({
        ...t,
        customer: customers ? (customers.get(t.customerId) ?? null) : undefined,
        tenant: tenants ? (tenants.get(t.tenantId) ?? null) : undefined,
        assignee:
          agentsMap && t.assigneeId
            ? (agentsMap.get(t.assigneeId) ?? null)
            : agentsMap
              ? null
              : undefined,
        labels: labelsMap
          ? t.labelIds
              .map((id) => labelsMap.get(id))
              .filter((x): x is NonNullable<typeof x> => x !== undefined)
          : undefined,
      }))
    )
  }
  return NextResponse.json(threads)
}

export async function POST(request: NextRequest) {
  let fields
  try {
    fields = await request.json()
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const result = store.createThread(fields)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
