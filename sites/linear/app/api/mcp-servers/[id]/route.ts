import { NextResponse } from "next/server"
import { deleteMcpServer } from "@/lib/agent-mocks"
import { route } from "@/app/lib/with-route"

type Ctx = { params: Promise<{ id: string }> }

export const DELETE = route<Ctx>(async (_req, { params }) => {
  const { id } = await params
  if (!deleteMcpServer(id)) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
})
