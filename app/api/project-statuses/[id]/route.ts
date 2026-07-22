import { NextResponse } from "next/server"
import {
  deleteStatus,
  projectStatuses,
  updateStatus,
  usageCountFor,
} from "@/lib/project-statuses-mocks"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const s = projectStatuses.find((x) => x.id === id)
  if (!s) {
    return NextResponse.json({ error: "Status not found" }, { status: 404 })
  }
  return NextResponse.json({ ...s, usageCount: usageCountFor(s) })
}

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
  const result = updateStatus(id, body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === "Status not found" ? 404 : 400 }
    )
  }
  return NextResponse.json({
    ...result.data,
    usageCount: usageCountFor(result.data),
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = deleteStatus(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json(result.data)
}
