import { NextResponse } from "next/server"
import * as store from "../../../../lib/store"
import { route } from "../../../../lib/route"

type Ctx = { params: Promise<{ id: string }> }

export const GET = route<Ctx>(async (_request, { params }) => {
  const { id } = await params
  const cycle = store.getCycleById(id)
  if (!cycle) {
    return NextResponse.json({ error: "Cycle not found" }, { status: 404 })
  }
  return NextResponse.json(cycle)
})
