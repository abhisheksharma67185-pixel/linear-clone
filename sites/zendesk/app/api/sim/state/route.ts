import { NextRequest, NextResponse } from "next/server"
import "../../../lib/init-sim"
import {
  captureSnapshot,
  computeDiff,
  getActiveEpisode,
} from "@thetabench/core"
import * as store from "../../../lib/store"

const getState = () => ({
  tickets: store.getTickets(),
  users: store.getUsers(),
  groups: store.getGroups(),
  brands: store.getBrands(),
  macros: store.getMacros(),
  views: store.getViews(),
  comments: store.getTickets().flatMap((t) => store.getCommentsByTicket(t.id)),
})

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const wantDiff = url.searchParams.get("diff") === "true"

  const current = captureSnapshot(getState)

  if (wantDiff) {
    const episode = getActiveEpisode()
    if (!episode) {
      return NextResponse.json(
        { error: "No active episode for diff computation" },
        { status: 400 }
      )
    }
    const diff = computeDiff(
      episode.initialSnapshot,
      current,
      ["tickets", "macros", "groups", "comments"],
      []
    )
    return NextResponse.json({ state: current, diff })
  }

  return NextResponse.json(current)
}
