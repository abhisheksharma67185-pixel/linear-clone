import { NextRequest, NextResponse } from "next/server"
import "../../../lib/init-sim"
import { getAllTasks, getTasksByCriteria, getTaskCount } from "@thetabench/core"
import type { TaskDomain, TaskDifficulty, TaskType } from "@thetabench/core"

const VALID_DOMAINS: TaskDomain[] = [
  "navigation",
  "products",
  "orders",
  "customers",
  "discounts",
  "settings",
  "search",
  "retrieval",
  "impossible",
  "multi-domain",
  "issues",
  "projects",
  "cycles",
  "labels",
  "views",
  "teams",
]
const VALID_DIFFICULTIES: TaskDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "expert",
]
const VALID_TYPES: TaskType[] = [
  "action",
  "retrieval",
  "action_retrieval",
  "no_action",
]

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const domainRaw = url.searchParams.get("domain")
  const difficultyRaw = url.searchParams.get("difficulty")
  const typeRaw = url.searchParams.get("type")
  const stage = url.searchParams.get("stage")
  const site = url.searchParams.get("site")
  const limitRaw = url.searchParams.get("limit")

  if (domainRaw && !VALID_DOMAINS.includes(domainRaw as TaskDomain)) {
    return NextResponse.json(
      { error: `Invalid domain. Must be one of: ${VALID_DOMAINS.join(", ")}` },
      { status: 400 }
    )
  }
  if (
    difficultyRaw &&
    !VALID_DIFFICULTIES.includes(difficultyRaw as TaskDifficulty)
  ) {
    return NextResponse.json(
      {
        error: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(", ")}`,
      },
      { status: 400 }
    )
  }
  if (typeRaw && !VALID_TYPES.includes(typeRaw as TaskType)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    )
  }

  const domain = domainRaw as TaskDomain | null
  const difficulty = difficultyRaw as TaskDifficulty | null
  const type = typeRaw as TaskType | null

  const hasFilters = domain || difficulty || type || stage || site

  let tasks = hasFilters
    ? getTasksByCriteria({
        domain: domain ?? undefined,
        difficulty: difficulty ?? undefined,
        type: type ?? undefined,
        stage: stage ? parseInt(stage, 10) : undefined,
        site: site ?? undefined,
      })
    : getAllTasks()

  // `?limit=N` truncates the response. Invalid (negative, non-numeric)
  // values are silently ignored — matches zendesk + plain.
  if (limitRaw) {
    const limit = parseInt(limitRaw, 10)
    if (Number.isFinite(limit) && limit > 0) {
      tasks = tasks.slice(0, limit)
    }
  }

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
  })
}
