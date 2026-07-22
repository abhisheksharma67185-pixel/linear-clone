import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/security-mocks"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ok = deleteSession(id)
  if (!ok) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
}
