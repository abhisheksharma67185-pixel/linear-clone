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
    /^\/(issues|projects|sprints|epics|boards)\/(.+)$/
  )
  if (match) {
    const [, entity, id] = match
    switch (entity) {
      case "issues":
        return {
          issue: store.getIssueById(id) ?? store.getIssueByKey(id) ?? null,
        }
      case "projects":
        return {
          project:
            store.getProjectById(id) ?? store.getProjectByKey(id) ?? null,
        }
      case "sprints":
        return { sprint: store.getSprintById(id) ?? null }
      case "epics":
        return { epic: store.getEpicById(id) ?? null }
      case "boards":
        return { board: store.getBoardById(id) ?? null }
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
    return [...base, "create_issue", "transition_issue", "move_issue_to_sprint"]
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
    _rlState.currentPage === "/sprints" ||
    _rlState.currentPage.match(/^\/sprints\/.+$/)
  ) {
    return [
      ...base,
      "create_sprint",
      "start_sprint",
      "complete_sprint",
      "move_issue_to_sprint",
    ]
  }
  if (
    _rlState.currentPage === "/epics" ||
    _rlState.currentPage.match(/^\/epics\/.+$/)
  ) {
    return [...base, "create_epic", "update_epic"]
  }
  if (_rlState.currentPage === "/filters") {
    return [...base, "create_filter"]
  }

  return base
}

function getObservation() {
  const issues = store.getIssues()
  const projects = store.getProjects()
  const sprints = store.getSprints()
  const epics = store.getEpics()
  const boards = store.getBoards()
  const filters = store.getFilters()
  const users = store.getUsers()

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
      todoIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "to_do"
      ).length,
      inProgressIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "in_progress"
      ).length,
      doneIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "done"
      ).length,
      totalProjects: projects.length,
      totalSprints: sprints.length,
      totalEpics: epics.length,
      totalBoards: boards.length,
      totalFilters: filters.length,
      totalUsers: users.length,
    },
    data: {
      issues: issues.map((i: Record<string, unknown>) => ({
        id: i.id,
        key: i.key,
        summary: i.summary,
        status: i.status,
        priority: i.priority,
        issueType: i.issueType,
        assigneeId: i.assigneeId,
        projectKey: i.projectKey,
        sprintId: i.sprintId,
        epicId: i.epicId,
      })),
      projects: projects.map((p: Record<string, unknown>) => ({
        id: p.id,
        key: p.key,
        name: p.name,
        projectType: p.projectType,
      })),
      sprints: sprints.map((s: Record<string, unknown>) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        startDate: s.startDate,
        endDate: s.endDate,
      })),
      epics: epics.map((e: Record<string, unknown>) => ({
        id: e.id,
        name: e.name,
        status: e.status,
      })),
      boards: boards.map((b: Record<string, unknown>) => ({
        id: b.id,
        name: b.name,
      })),
      filters: filters.map((f: Record<string, unknown>) => ({
        id: f.id,
        name: f.name,
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
    case "create_sprint": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createSprint(
          fields as Parameters<typeof store.createSprint>[0]
        )
        reward = result.success ? 0.5 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "start_sprint": {
      const result = store.startSprint(action.sprintId as string)
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "complete_sprint": {
      const result = store.completeSprint(action.sprintId as string)
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "move_issue_to_sprint": {
      const result = store.moveIssueToSprint(
        action.sprintId as string,
        action.issueId as string
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "create_epic": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createEpic(
          fields as Parameters<typeof store.createEpic>[0]
        )
        reward = result.success ? 0.5 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "update_epic": {
      const result = store.updateEpic(
        action.epicId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateEpic>[1]
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "create_filter": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createFilter(
          fields as Parameters<typeof store.createFilter>[0]
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
      description: "ThetaBench Jira RL Environment",
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
