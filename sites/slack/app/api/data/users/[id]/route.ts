import { NextResponse } from "next/server"
import * as store from "../../../../lib/store"
import { withSession } from "../../../../lib/session"

export const GET = withSession(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    const user = store.getUserById(id)
    if (!user) {
      return NextResponse.json(
        { error: `User ${id} not found` },
        { status: 404 }
      )
    }
    return NextResponse.json(user)
  }
)
