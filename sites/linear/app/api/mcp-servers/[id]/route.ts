import { NextResponse } from "next/server"
import { deleteMcpServer } from "@/lib/agent-mocks"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!deleteMcpServer(id)) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
}
