// AUTH: Intentionally omitted — this route is designed for local benchmark/sim use only.
import { NextRequest, NextResponse } from "next/server"
import "../../../lib/init-sim"
import { startEpisode } from "@thetabench/core"
import type { EpisodeConfig } from "@thetabench/core"

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    )
  }

  const taskId = body.task_id ?? body.taskId
  if (!taskId || typeof taskId !== "string") {
    return NextResponse.json(
      { error: "task_id (string) is required" },
      { status: 400 }
    )
  }

  const mode = body.mode ?? "rest"
  if (mode !== "rest" && mode !== "browser") {
    return NextResponse.json(
      { error: "mode must be 'rest' or 'browser'" },
      { status: 400 }
    )
  }

  const seed = body.seed !== undefined ? Number(body.seed) : undefined
  if (seed !== undefined && (!isFinite(seed) || seed < 0)) {
    return NextResponse.json(
      { error: "seed must be a non-negative finite number" },
      { status: 400 }
    )
  }

  const config: EpisodeConfig = {
    taskId,
    seed,
    mode,
    configOverrides: body.config_overrides ?? body.configOverrides,
  }

  try {
    const episode = startEpisode(config)
    return NextResponse.json({
      episode_id: episode.id,
      task: {
        id: episode.task.id,
        title: episode.task.title,
        goal: episode.task.goal,
        type: episode.task.type,
        difficulty: episode.task.difficulty,
        max_steps: episode.task.maxSteps,
        curriculum_stage: episode.task.curriculumStage,
      },
      status: episode.status,
      initial_snapshot: episode.initialSnapshot,
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to start episode"
    const status = message.includes("Task not found") ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
