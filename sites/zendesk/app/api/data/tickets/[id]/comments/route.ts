import { NextRequest, NextResponse } from "next/server"
import "../../../../../lib/init-sim"
import * as store from "../../../../../lib/store"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const result = store.addComment({
    ticketId: id,
    authorId: body.authorId ?? "usr-1",
    body: body.body ?? "",
    public: body.public,
  })
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
