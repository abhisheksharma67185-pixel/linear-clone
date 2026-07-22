import { NextResponse } from "next/server"
import { deleteApiKey } from "@/lib/security-mocks"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ok = deleteApiKey(id)
  if (!ok) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
}
