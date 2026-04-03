import { NextRequest, NextResponse } from "next/server";
import "../../../lib/init-sim";
import { startEpisode } from "@simbench/core";
import type { EpisodeConfig } from "@simbench/core";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  const config: EpisodeConfig = {
    taskId: body.task_id ?? body.taskId,
    seed: body.seed,
    mode: body.mode ?? "rest",
    configOverrides: body.config_overrides ?? body.configOverrides,
  };

  if (!config.taskId) {
    return NextResponse.json({ error: "task_id is required" }, { status: 400 });
  }

  try {
    const episode = startEpisode(config);
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
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start episode";
    const status = message.includes("Task not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
