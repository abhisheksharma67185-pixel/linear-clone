import { NextResponse } from "next/server"
import { deletePasskey } from "@/lib/security-mocks"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ok = deletePasskey(id)
  if (!ok) {
    return NextResponse.json({ error: "Passkey not found" }, { status: 404 })
  }
  return NextResponse.json({ deleted: true })
}
