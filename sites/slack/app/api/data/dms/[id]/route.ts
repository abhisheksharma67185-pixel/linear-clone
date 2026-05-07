import { NextRequest, NextResponse } from "next/server"
import * as store from "../../../../lib/store"
import { withSession } from "../../../../lib/session"

export const GET = withSession(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params
    const dm = store.getDmById(id)
    if (!dm) {
      return NextResponse.json({ error: `DM ${id} not found` }, { status: 404 })
    }
    return NextResponse.json(dm)
  }
)
