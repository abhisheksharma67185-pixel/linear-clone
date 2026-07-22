import { NextResponse } from "next/server"
import { duplicateStatus, usageCountFor } from "@/lib/project-statuses-mocks"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = duplicateStatus(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json(
    { ...result.data, usageCount: usageCountFor(result.data) },
    { status: 201 }
  )
}
