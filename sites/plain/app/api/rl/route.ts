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
  currentPage: "/inbox",
  lastAction: null,
  stepCount: 0,
}

export function resetRLState(): void {
  _rlState = {
    currentPage: "/inbox",
    lastAction: null,
    stepCount: 0,
  }
}

// ---------------------------------------------------------------------------
// Observation
// ---------------------------------------------------------------------------

function getContextData(): Record<string, unknown> {
  const match = _rlState.currentPage.match(
    /^\/(threads|customers|tenants|labels)\/(.+)$/
  )
  if (match) {
    const [, entity, id] = match
    switch (entity) {
      case "threads":
        return { thread: store.getThreadById(id) ?? null }
      case "customers":
        return { customer: store.getCustomerById(id) ?? null }
      case "tenants":
        return { tenant: store.getTenantById(id) ?? null }
      case "labels":
        return { label: store.getLabelById(id) ?? null }
    }
  }
  return {}
}

function getAvailableActions(): string[] {
  const base = ["navigate", "search", "respond"]

  if (_rlState.currentPage.match(/^\/threads\/.+$/)) {
    return [
      ...base,
      "reply_thread",
      "snooze_thread",
      "done_thread",
      "reopen_thread",
      "assign_thread",
      "add_label",
      "remove_label",
      "set_priority",
      "add_internal_note",
    ]
  }
  if (
    _rlState.currentPage === "/inbox" ||
    _rlState.currentPage === "/snoozed" ||
    _rlState.currentPage === "/done"
  ) {
    return [...base, "create_thread"]
  }
  if (_rlState.currentPage.match(/^\/customers\/.+$/)) {
    return [...base, "update_customer", "merge_customers"]
  }
  return base
}

function getObservation() {
  const threads = store.getThreads()
  const messages = store.getMessages()
  const customers = store.getCustomers()
  const tenants = store.getTenants()
  const labels = store.getLabels()
  const agents = store.getAgents()

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
      totalThreads: threads.length,
      openThreads: threads.filter((t) => t.status === "open").length,
      snoozedThreads: threads.filter((t) => t.status === "snoozed").length,
      doneThreads: threads.filter((t) => t.status === "done").length,
      urgentThreads: threads.filter((t) => t.priority === "urgent").length,
      totalCustomers: customers.length,
      totalTenants: tenants.length,
      totalLabels: labels.length,
      totalAgents: agents.length,
      totalMessages: messages.length,
    },
    data: {
      threads: threads.map((t) => ({
        id: t.id,
        title: t.title,
        customerId: t.customerId,
        tenantId: t.tenantId,
        status: t.status,
        priority: t.priority,
        labelIds: t.labelIds,
        assigneeId: t.assigneeId,
      })),
      customers: customers.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        tenantId: c.tenantId,
        plan: c.plan,
        lifecycleStage: c.lifecycleStage,
      })),
      tenants: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        plan: t.plan,
      })),
      labels: labels.map((l) => ({ id: l.id, name: l.name, color: l.color })),
      agents: agents.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        role: a.role,
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
    case "create_thread": {
      const fields = action.fields as Record<string, unknown> | undefined
      if (fields) {
        const result = store.createThread(
          fields as Parameters<typeof store.createThread>[0]
        )
        reward = result.success ? 0.5 : -0.5
        success = result.success
      } else {
        reward = -0.5
        success = false
      }
      break
    }
    case "reply_thread": {
      const result = store.replyThread(
        action.threadId as string,
        (action.fields ?? {}) as Parameters<typeof store.replyThread>[1]
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "snooze_thread": {
      const result = store.snoozeThread(
        action.threadId as string,
        (action.until as string) ??
          new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "done_thread": {
      const result = store.doneThread(action.threadId as string)
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "reopen_thread": {
      const result = store.reopenThread(action.threadId as string)
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "assign_thread": {
      const result = store.assignThread(
        action.threadId as string,
        (action.assigneeId ?? null) as string | null
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "add_label": {
      const result = store.addLabel(
        action.threadId as string,
        action.labelId as string
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "remove_label": {
      const result = store.removeLabel(
        action.threadId as string,
        action.labelId as string
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "set_priority": {
      const result = store.setPriority(
        action.threadId as string,
        action.priority as Parameters<typeof store.setPriority>[1]
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
      break
    }
    case "update_customer": {
      const result = store.updateCustomer(
        action.customerId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateCustomer>[1]
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "merge_customers": {
      const result = store.mergeCustomers(
        action.primaryId as string,
        action.duplicateId as string
      )
      reward = result.success ? 0.5 : -0.5
      success = result.success
      break
    }
    case "add_internal_note": {
      const result = store.addInternalNote(
        action.threadId as string,
        (action.fields ?? {}) as Parameters<typeof store.addInternalNote>[1]
      )
      reward = result.success ? 0.3 : -0.5
      success = result.success
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
      description: "ThetaBench Plain RL Environment",
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
