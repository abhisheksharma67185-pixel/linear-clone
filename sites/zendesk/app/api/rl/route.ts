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
// Per-episode RL session state
// ---------------------------------------------------------------------------

interface RLSessionState {
  currentPage: string
  lastAction: string | null
  stepCount: number
}

let _rlState: RLSessionState = {
  currentPage: "/home",
  lastAction: null,
  stepCount: 0,
}

export function resetRLState(): void {
  _rlState = {
    currentPage: "/home",
    lastAction: null,
    stepCount: 0,
  }
}

// ---------------------------------------------------------------------------
// Observation
// ---------------------------------------------------------------------------

function getContextData(): Record<string, unknown> {
  const ticketMatch = _rlState.currentPage.match(/^\/tickets\/(.+)$/)
  if (ticketMatch) {
    const id = ticketMatch[1]
    return {
      ticket: store.getTicketById(id) ?? null,
      comments: store.getCommentsByTicket(id),
    }
  }
  const userMatch = _rlState.currentPage.match(/^\/users\/(.+)$/)
  if (userMatch) {
    return { user: store.getUserById(userMatch[1]) ?? null }
  }
  return {}
}

function getAvailableActions(): string[] {
  const base = ["navigate", "search", "respond"]
  const page = _rlState.currentPage

  if (page === "/home" || page === "/views" || page.startsWith("/views/")) {
    return [...base, "create_ticket", "assign_ticket", "transition_ticket"]
  }
  if (page.match(/^\/tickets\/.+$/)) {
    return [
      ...base,
      "update_ticket",
      "delete_ticket",
      "transition_ticket",
      "assign_ticket",
      "add_tag",
      "remove_tag",
      "add_comment",
      "merge_tickets",
    ]
  }
  if (page === "/macros") {
    return [...base, "create_macro", "update_macro"]
  }
  if (page === "/groups") {
    return [...base, "create_group"]
  }
  if (page === "/customers") {
    return [...base, "create_user"]
  }
  return base
}

function getObservation() {
  const tickets = store.getTickets()
  const users = store.getUsers()
  const groups = store.getGroups()
  const macros = store.getMacros()
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
      totalTickets: tickets.length,
      newTickets: tickets.filter((t) => t.status === "new").length,
      openTickets: tickets.filter((t) => t.status === "open").length,
      pendingTickets: tickets.filter((t) => t.status === "pending").length,
      onHoldTickets: tickets.filter((t) => t.status === "on-hold").length,
      solvedTickets: tickets.filter((t) => t.status === "solved").length,
      closedTickets: tickets.filter((t) => t.status === "closed").length,
      totalUsers: users.length,
      totalGroups: groups.length,
      totalMacros: macros.length,
    },
    data: {
      tickets: tickets.map((t) => ({
        id: t.id,
        number: t.number,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        channel: t.channel,
        requesterId: t.requesterId,
        assigneeId: t.assigneeId,
        groupId: t.groupId,
        tags: t.tags,
      })),
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        groupId: u.groupId,
      })),
      groups: groups.map((g) => ({ id: g.id, name: g.name })),
      macros: macros.map((m) => ({
        id: m.id,
        title: m.title,
        active: m.active,
      })),
      views: views.map((v) => ({ id: v.id, title: v.title, group: v.group })),
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
    case "create_ticket": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createTicket(
          fields as Parameters<typeof store.createTicket>[0]
        )
        reward = result.success ? 0.5 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "update_ticket": {
      const result = store.updateTicket(
        action.ticketId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateTicket>[1]
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "delete_ticket": {
      const result = store.deleteTicket(action.ticketId as string)
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "transition_ticket": {
      const result = store.transitionTicket(
        action.ticketId as string,
        action.status as Parameters<typeof store.transitionTicket>[1]
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "assign_ticket": {
      const result = store.assignTicket(
        action.ticketId as string,
        (action.assigneeId ?? null) as string | null,
        action.groupId as string | null | undefined
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "merge_tickets": {
      const result = store.mergeTickets(
        action.sourceId as string,
        action.targetId as string
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "add_tag": {
      const result = store.addTag(
        action.ticketId as string,
        action.tag as string
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "remove_tag": {
      const result = store.removeTag(
        action.ticketId as string,
        action.tag as string
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "add_comment": {
      const result = store.addComment({
        ticketId: action.ticketId as string,
        authorId: action.authorId as string,
        body: action.body as string,
        public: action.public as boolean | undefined,
      })
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "create_macro": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createMacro(
          fields as Parameters<typeof store.createMacro>[0]
        )
        reward = result.success ? 0.5 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "update_macro": {
      const result = store.updateMacro(
        action.macroId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateMacro>[1]
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "create_group": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createGroup(
          fields as Parameters<typeof store.createGroup>[0]
        )
        reward = result.success ? 0.5 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "create_user": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createUser(
          fields as Parameters<typeof store.createUser>[0]
        )
        reward = result.success ? 0.5 : -0.5
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
      description: "ThetaBench Zendesk RL Environment",
      version: "1.0",
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

  const { reward: baseReward, success } = executeAction(action)

  _rlState.stepCount++

  let finalReward = baseReward
  const episode = getActiveEpisode()

  if (episode && episode.status === "active") {
    const stepReward = getStepReward(success)
    finalReward = success ? baseReward + stepReward : stepReward

    logAction(
      actionName,
      action as Record<string, unknown>,
      finalReward,
      success
    )
  }

  const observation = getObservation()

  let done = false
  if (episode) {
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
