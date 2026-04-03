import { NextRequest, NextResponse } from "next/server";
import { getAllTasks, getTasksByCriteria, getTaskCount } from "../../../lib/tasks";
import type { TaskDomain, TaskDifficulty, TaskType } from "../../../lib/tasks/types";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const domain = url.searchParams.get("domain") as TaskDomain | null;
  const difficulty = url.searchParams.get("difficulty") as TaskDifficulty | null;
  const type = url.searchParams.get("type") as TaskType | null;
  const stage = url.searchParams.get("stage");
  const site = url.searchParams.get("site");

  const hasFilters = domain || difficulty || type || stage || site;

  const tasks = hasFilters
    ? getTasksByCriteria({
        domain: domain ?? undefined,
        difficulty: difficulty ?? undefined,
        type: type ?? undefined,
        stage: stage ? parseInt(stage, 10) : undefined,
        site: site ?? undefined,
      })
    : getAllTasks();

  return NextResponse.json({
    total: getTaskCount(),
    filtered: tasks.length,
    tasks: tasks.map((t) => ({
      id: t.id,
      site: t.site,
      domain: t.domain,
      type: t.type,
      difficulty: t.difficulty,
      curriculum_stage: t.curriculumStage,
      title: t.title,
      goal: t.goal,
      max_steps: t.maxSteps,
      tags: t.tags,
    })),
  });
}
