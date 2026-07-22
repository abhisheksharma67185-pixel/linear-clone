import { NextResponse } from "next/server"
import * as store from "../../../lib/store"
import { route } from "../../../lib/with-route"

export const GET = route(async () => {
  return NextResponse.json(store.getProjects())
})

export const POST = route(async (request) => {
  let fields
  try {
    fields = await request.json()
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }
  const result = store.createProject(fields)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json(result.data, { status: 201 })
})
