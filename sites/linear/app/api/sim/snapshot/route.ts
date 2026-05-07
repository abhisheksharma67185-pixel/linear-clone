import { NextResponse } from "next/server"
import "../../../lib/init-sim"
import { getActiveEpisode } from "@thetabench/core"
import { route } from "../../../lib/with-route"

export const GET = route(async () => {
  const episode = getActiveEpisode()
  if (!episode) {
    return NextResponse.json({ error: "No active episode" }, { status: 400 })
  }

  return NextResponse.json(episode.initialSnapshot)
})
