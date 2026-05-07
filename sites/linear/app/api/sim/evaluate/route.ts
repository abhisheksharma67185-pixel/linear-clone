import { NextResponse } from "next/server"
import "../../../lib/init-sim"
import { evaluateEpisode, getActiveEpisode } from "@thetabench/core"
import { route } from "../../../lib/with-route"

export const POST = route(async () => {
  const episode = getActiveEpisode()
  if (!episode) {
    return NextResponse.json({ error: "No active episode" }, { status: 400 })
  }

  const result = evaluateEpisode()
  if (!result) {
    return NextResponse.json(
      {
        error: "Evaluation failed",
        episode_id: episode?.id ?? null,
        task_id: episode?.task.id ?? null,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(result)
})
