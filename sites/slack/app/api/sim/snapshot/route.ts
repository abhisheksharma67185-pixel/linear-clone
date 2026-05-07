import { NextResponse } from "next/server"
import "../../../lib/init-sim"
import { getActiveEpisode } from "@thetabench/core"
import { withSession } from "../../../lib/session"

export const GET = withSession(async () => {
  const episode = getActiveEpisode()
  if (!episode) {
    return NextResponse.json({ error: "No active episode" }, { status: 400 })
  }
  return NextResponse.json(episode.initialSnapshot)
})
