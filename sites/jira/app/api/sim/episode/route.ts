import { NextResponse } from "next/server"
import "../../../lib/init-sim"
import { getActiveEpisode } from "@thetabench/core"

export async function GET() {
  const episode = getActiveEpisode()
  if (!episode) {
    return NextResponse.json({ active: false })
  }

  return NextResponse.json({
    active: true,
    episode_id: episode.id,
    task_id: episode.task.id,
    task_title: episode.task.title,
    task_goal: episode.task.goal,
    status: episode.status,
    step_count: episode.stepCount,
    max_steps: episode.task.maxSteps,
    elapsed_seconds:
      (Date.now() - new Date(episode.startedAt).getTime()) / 1000,
    action_log_length: episode.actionLog.length,
  })
}
