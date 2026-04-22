// AUTH: Intentionally omitted — this route is designed for local benchmark/sim use only.
import { NextRequest, NextResponse } from "next/server"
import * as store from "../../lib/store"
import "../../lib/init-sim"
import {
  getActiveEpisode,
  hasActiveEpisode,
  logAction,
  getStepReward,
} from "@thetabench/core"

// ---------------------------------------------------------------------------
// Per-episode RL session state (isolated by episode, not module-level)
// ---------------------------------------------------------------------------

interface RLSessionState {
  currentPage: string
  lastAction: string | null
  stepCount: number
}

let _rlState: RLSessionState = {
  currentPage: "/board",
  lastAction: null,
  stepCount: 0,
}

export function resetRLState(): void {
  _rlState = {
    currentPage: "/board",
    lastAction: null,
    stepCount: 0,
  }
}

// ---------------------------------------------------------------------------
// Observation
// ---------------------------------------------------------------------------

function getContextData(): Record<string, unknown> {
  const match = _rlState.currentPage.match(
    /^\/(issues|projects|cycles|labels|teams)\/(.+)$/
  )
  if (match) {
    const [, entity, id] = match
    switch (entity) {
      case "issues":
        return {
          issue:
            store.getIssueById(id) ?? store.getIssueByIdentifier(id) ?? null,
        }
      case "projects":
        return { project: store.getProjectById(id) ?? null }
      case "cycles":
        return { cycle: store.getCycleById(id) ?? null }
      case "labels":
        return { label: store.getLabelById(id) ?? null }
      case "teams":
        return { team: store.getTeamById(id) ?? null }
    }
  }
  return {}
}

function getAvailableActions(): string[] {
  const base = ["navigate", "search", "respond"]

  if (
    _rlState.currentPage === "/board" ||
    _rlState.currentPage === "/backlog"
  ) {
    return [...base, "create_issue", "transition_issue", "move_issue_to_cycle"]
  }
  if (_rlState.currentPage.match(/^\/issues\/.+$/)) {
    return [...base, "update_issue", "delete_issue", "transition_issue"]
  }
  if (_rlState.currentPage === "/projects") {
    return [...base, "create_project"]
  }
  if (_rlState.currentPage.match(/^\/projects\/.+$/)) {
    return [...base, "update_project"]
  }
  if (
    _rlState.currentPage === "/cycles" ||
    _rlState.currentPage.match(/^\/cycles\/.+$/)
  ) {
    return [
      ...base,
      "create_cycle",
      "start_cycle",
      "complete_cycle",
      "move_issue_to_cycle",
    ]
  }
  if (
    _rlState.currentPage === "/labels" ||
    _rlState.currentPage.match(/^\/labels\/.+$/)
  ) {
    return [...base, "create_label", "update_label"]
  }
  if (
    _rlState.currentPage === "/teams" ||
    _rlState.currentPage.match(/^\/teams\/.+$/)
  ) {
    return [...base, "create_team", "update_team"]
  }
  if (
    _rlState.currentPage === "/views" ||
    _rlState.currentPage.match(/^\/views\/.+$/)
  ) {
    return [...base, "create_view"]
  }

  return base
}

function getObservation() {
  const issues = store.getIssues()
  const projects = store.getProjects()
  const cycles = store.getCycles()
  const labels = store.getLabels()
  const teams = store.getTeams()
  const members = store.getMembers()
  const views = store.getViews()

  const episode = getActiveEpisode()

  return {
    currentPage: _rlState.currentPage,
    stepCount: _rlState.stepCount,
    lastAction: _rlState.lastAction,
    availableActions: getAvailableActions(),
    currentPageData: getContextData(),
    episode: episode
      ? {
          id: episode.id,
          taskId: episode.task.id,
          taskGoal: episode.task.goal,
          status: episode.status,
          stepsRemaining: episode.task.maxSteps - episode.stepCount,
        }
      : null,
    summary: {
      totalIssues: issues.length,
      backlogIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "backlog"
      ).length,
      todoIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "todo"
      ).length,
      inProgressIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "in_progress"
      ).length,
      doneIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "done"
      ).length,
      cancelledIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "cancelled"
      ).length,
      totalProjects: projects.length,
      totalCycles: cycles.length,
      totalLabels: labels.length,
      totalTeams: teams.length,
      totalMembers: members.length,
      totalViews: views.length,
    },
    data: {
      issues: issues.map((i: Record<string, unknown>) => ({
        id: i.id,
        identifier: i.identifier,
        title: i.title,
        status: i.status,
        priority: i.priority,
        assigneeId: i.assigneeId,
        teamId: i.teamId,
        projectId: i.projectId,
        cycleId: i.cycleId,
        labelIds: i.labelIds,
        estimate: i.estimate,
      })),
      projects: projects.map((p: Record<string, unknown>) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        teamId: p.teamId,
      })),
      cycles: cycles.map((c: Record<string, unknown>) => ({
        id: c.id,
        name: c.name,
        state: c.state,
        startDate: c.startDate,
        endDate: c.endDate,
      })),
      labels: labels.map((l: Record<string, unknown>) => ({
        id: l.id,
        name: l.name,
        color: l.color,
      })),
      teams: teams.map((t: Record<string, unknown>) => ({
        id: t.id,
        name: t.name,
        key: t.key,
      })),
      members: members.map((m: Record<string, unknown>) => ({
        id: m.id,
        name: m.name,
      })),
      views: views.map((v: Record<string, unknown>) => ({
        id: v.id,
        name: v.name,
      })),
    },
  }
}

// ---------------------------------------------------------------------------
// Execute action and compute reward
// ---------------------------------------------------------------------------

function executeAction(action: Record<string, unknown>): {
  reward: number
  success: boolean
} {
  let reward = -0.01
  let success = true

  switch (action.action) {
    case "navigate": {
      if (
        typeof action.target === "string" &&
        action.target !== _rlState.currentPage
      ) {
        _rlState.currentPage = action.target
        reward = 0.0
      }
      break
    }
    case "search":
      reward = 0.05
      break
    case "respond":
      reward = 0.0
      break
    case "create_issue": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createIssue(
          fields as Parameters<typeof store.createIssue>[0]
        )
        reward = result.success ? 0.5 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "update_issue": {
      const result = store.updateIssue(
        action.issueId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateIssue>[1]
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "delete_issue": {
      const result = store.deleteIssue(action.issueId as string)
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "transition_issue": {
      const result = store.transitionIssue(
        action.issueId as string,
        action.status as string
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "move_issue_to_cycle": {
      const result = store.moveIssueToCycle(
        action.issueId as string,
        action.cycleId as string
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "create_project": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createProject(
          fields as Parameters<typeof store.createProject>[0]
        )
        reward = result.success ? 0.5 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "update_project": {
      const result = store.updateProject(
        action.projectId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateProject>[1]
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "create_cycle": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createCycle(
          fields as Parameters<typeof store.createCycle>[0]
        )
        reward = result.success ? 0.5 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "start_cycle": {
      const result = store.startCycle(action.cycleId as string)
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "complete_cycle": {
      const result = store.completeCycle(action.cycleId as string)
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "create_label": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createLabel(
          fields as Parameters<typeof store.createLabel>[0]
        )
        reward = result.success ? 0.3 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "update_label": {
      const result = store.updateLabel(
        action.labelId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateLabel>[1]
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "create_team": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createTeam(
          fields as Parameters<typeof store.createTeam>[0]
        )
        reward = result.success ? 0.5 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "update_team": {
      const result = store.updateTeam(
        action.teamId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateTeam>[1]
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "create_view": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createView(
          fields as Parameters<typeof store.createView>[0]
        )
        reward = result.success ? 0.3 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    default:
      reward = -0.1
      success = false
  }

  return { reward, success }
}

// ---------------------------------------------------------------------------
// HTTP handlers
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({
    observation: getObservation(),
    info: {
      description: "ThetaBench Linear RL Environment",
      version: "3.0",
      episodeActive: hasActiveEpisode(),
    },
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

  const action = body as Record<string, unknown>
  const actionName = action.action as string

  _rlState.lastAction = actionName

  // Execute the action
  const { reward: baseReward, success } = executeAction(action)

  _rlState.stepCount++

  // If episode is active, use shaped rewards and log action
  let finalReward = baseReward
  const episode = getActiveEpisode()

  if (episode && episode.status === "active") {
    // Shape reward using task's reward profile
    const stepReward = getStepReward(success)
    finalReward = success ? baseReward + stepReward : stepReward

    // Log action to episode
    logAction(
      actionName,
      action as Record<string, unknown>,
      finalReward,
      success
    )
  }

  const observation = getObservation()

  // Determine if done
  let done = false
  if (episode) {
    // Episode mode: done when episode status changes
    done =
      episode.status === "timeout" ||
      episode.status === "completed" ||
      episode.status === "failed"
  }

  return NextResponse.json({
    observation,
    reward: finalReward,
    done,
    truncated: episode ? episode.status === "timeout" : false,
    info: {
      stepCount: _rlState.stepCount,
      lastAction: actionName,
      success,
      episodeActive: hasActiveEpisode(),
      episodeStepsRemaining: episode
        ? episode.task.maxSteps - episode.stepCount
        : null,
    },
  })
}
