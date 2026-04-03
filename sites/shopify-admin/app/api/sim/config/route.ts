import { NextRequest, NextResponse } from "next/server";
import { startEpisode } from "../../../lib/episode";
import type { EpisodeConfig } from "../../../lib/episode";

export async function POST(request: NextRequest) {
  const body = await request.json();

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
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
