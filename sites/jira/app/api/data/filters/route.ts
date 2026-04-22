import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../lib/store"

export async function GET() {
  return NextResponse.json(store.getFilters())
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
  const result = store.createFilter(fields)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
