import { NextRequest, NextResponse } from "next/server"
import { getLeaderboard, submitToLeaderboard } from "../../../lib/leaderboard"

export async function GET() {
  const entries = getLeaderboard()
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
  })
}

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

  if (!body.agent_name || typeof body.agent_name !== "string") {
    return NextResponse.json(
      { error: "agent_name (string) is required" },
      { status: 400 }
    )
  }
  if (!body.results || typeof body.results !== "object") {
    return NextResponse.json(
      { error: "results (object) is required" },
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

  const totalTasks = Number(body.results.total_tasks) || 0
  const tasksPassed = Number(body.results.tasks_passed) || 0
  const avgScore = Number(body.results.avg_score) || 0
  const avgSteps = Number(body.results.avg_steps) || 0
  const avgReward = Number(body.results.avg_reward) || 0
  const highestStage = Number(body.results.highest_stage) || 0

  if (totalTasks < 0 || tasksPassed < 0 || tasksPassed > totalTasks) {
    return NextResponse.json(
      { error: "Invalid result values" },
      { status: 400 }
    )
  }
  if (avgScore < 0 || avgScore > 1) {
    return NextResponse.json(
      { error: "avg_score must be between 0 and 1" },
      { status: 400 }
    )
  }

  const entry = submitToLeaderboard({
    agentName: body.agent_name,
    modelName: body.model_name ?? "unknown",
    mode,
    results: {
      totalTasks,
      tasksPassed,
      avgScore,
      avgSteps,
      avgReward,
      highestStage,
      perDomain: body.results.per_domain ?? {},
    },
  })

  return NextResponse.json(
    {
      id: entry.id,
      rank: getLeaderboard().findIndex((e) => e.id === entry.id) + 1,
      message: "Submitted to leaderboard",
    },
    { status: 201 }
  )
}
