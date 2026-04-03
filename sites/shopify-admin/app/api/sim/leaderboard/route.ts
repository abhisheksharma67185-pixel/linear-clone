import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, submitToLeaderboard } from "../../../lib/leaderboard";

export async function GET() {
  const entries = getLeaderboard();
  return NextResponse.json({
    total: entries.length,
    entries: entries.map((e, i) => ({
      rank: i + 1,
      id: e.id,
      agent_name: e.agentName,
      model_name: e.modelName,
      mode: e.mode,
      submitted_at: e.submittedAt,
      score: e.results.avgScore,
      tasks_passed: e.results.tasksPassed,
      total_tasks: e.results.totalTasks,
      highest_stage: e.results.highestStage,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.agent_name || !body.results) {
    return NextResponse.json({ error: "agent_name and results are required" }, { status: 400 });
  }

  const entry = submitToLeaderboard({
    agentName: body.agent_name,
    modelName: body.model_name ?? "unknown",
    mode: body.mode ?? "rest",
    results: {
      totalTasks: body.results.total_tasks ?? 0,
      tasksPassed: body.results.tasks_passed ?? 0,
      avgScore: body.results.avg_score ?? 0,
      avgSteps: body.results.avg_steps ?? 0,
      avgReward: body.results.avg_reward ?? 0,
      highestStage: body.results.highest_stage ?? 0,
      perDomain: body.results.per_domain ?? {},
    },
  });

  return NextResponse.json(
    {
      id: entry.id,
      rank: getLeaderboard().findIndex((e) => e.id === entry.id) + 1,
      message: "Submitted to leaderboard",
    },
    { status: 201 },
  );
}
