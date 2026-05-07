import { NextResponse } from "next/server"
import * as store from "../../../../../lib/store"
import { route } from "../../../../../lib/route"

type Ctx = { params: Promise<{ id: string }> }

export const POST = route<Ctx>(async (_request, { params }) => {
  const { id } = await params
  const result = store.startCycle(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data)
})
