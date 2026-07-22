import { NextResponse } from "next/server"
import { renameEmoji, deleteEmoji } from "@/lib/emoji-mocks"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const result = renameEmoji(id, body?.shortcode)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === "Emoji not found" ? 404 : 400 }
    )
  }
  return NextResponse.json(result.data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = deleteEmoji(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json(result.data)
}
