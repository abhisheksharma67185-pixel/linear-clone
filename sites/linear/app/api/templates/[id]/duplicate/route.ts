import { NextResponse } from "next/server"
import { duplicateTemplate } from "@/lib/templates-mocks"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = duplicateTemplate(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json(result.data, { status: 201 })
}
