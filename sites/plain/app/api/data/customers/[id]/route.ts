import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const customer = store.getCustomerById(id)
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 })
  }
  const tenant = store.getTenantById(customer.tenantId)
  const threads = store.getThreadsByCustomer(id)
  return NextResponse.json({ ...customer, tenant: tenant ?? null, threads })
}
