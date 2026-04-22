import { NextRequest, NextResponse } from "next/server"
import "../../../../lib/init-sim"
import { getTaskById } from "@thetabench/core"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const task = getTaskById(id)

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json(task)
}
