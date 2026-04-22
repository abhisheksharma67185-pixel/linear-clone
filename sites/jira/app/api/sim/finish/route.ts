import { NextRequest, NextResponse } from "next/server"
import "../../../lib/init-sim"
import {
  finishEpisode,
  hasActiveEpisode,
  getActiveEpisode,
} from "@thetabench/core"

export async function POST(request: NextRequest) {
  if (!hasActiveEpisode()) {
    return NextResponse.json({ error: "No active episode" }, { status: 400 })
  }

  let agentResponse: string | undefined
  try {
    const body = await request.json()
    agentResponse = body.agent_response ?? body.agentResponse
  } catch {
    // No body is fine for action-only tasks
  }

  const activeEp = getActiveEpisode()
  try {
    const episode = finishEpisode(agentResponse)
    return NextResponse.json({
      episode_id: episode.id,
      task_id: episode.task.id,
      status: episode.status,
      steps: episode.stepCount,
      score: episode.result?.score ?? 0,
      total_reward: episode.result?.totalReward ?? 0,
      wall_time_seconds: episode.result?.wallTimeSeconds ?? 0,
      eval: episode.result?.eval,
      judge_result: episode.result?.judgeResult,
      diff: episode.result?.diff,
      action_log: episode.actionLog,
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to finish episode"
    return NextResponse.json(
      {
        error: message,
        episode_id: activeEp?.id ?? null,
        task_id: activeEp?.task.id ?? null,
      },
      { status: 400 }
    )
  }
}
