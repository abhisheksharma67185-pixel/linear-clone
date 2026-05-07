// In-memory mock state for the SLAs settings page.
// State now lives on the per-session LinearStoreState; this is a thin facade.

import { _state } from "@/app/lib/session"
import type {
  AutomationAction,
  AutomationRule,
  AutomationTrigger,
  BillingPlan,
  PlanState,
  SlaDurationUnit,
  SlaPolicy,
} from "@/app/lib/state"

export type {
  AutomationAction,
  AutomationRule,
  AutomationTrigger,
  BillingPlan,
  PlanState,
  SlaDurationUnit,
  SlaPolicy,
}

const now = () => new Date().toISOString()

// ---------------------------------------------------------------------------
// planState — exposed as a Proxy so callers that hold the reference still see
// the active session's plan.
// ---------------------------------------------------------------------------

export const planState: PlanState = new Proxy({} as PlanState, {
  get: (_t, prop) =>
    (_state().planState as unknown as Record<string | symbol, unknown>)[prop],
  set: (_t, prop, value) => {
    const ps = _state().planState as unknown as Record<string | symbol, unknown>
    ps[prop] = value
    return true
  },
  has: (_t, prop) => prop in _state().planState,
  ownKeys: () => Object.keys(_state().planState),
  getOwnPropertyDescriptor: (_t, prop) =>
    Object.getOwnPropertyDescriptor(_state().planState, prop),
})

export function setPlan(next: BillingPlan, days: number | null = null) {
  const ps = _state().planState
  ps.plan = next
  ps.trialDaysRemaining = days
}

function arrayProxy<T>(getArr: () => T[]): T[] {
  return new Proxy([] as T[], {
    get(_t, prop) {
      const arr = getArr()
      const value = (arr as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === "function"
        ? (value as (...a: unknown[]) => unknown).bind(arr)
        : value
    },
    set(_t, prop, value) {
      const arr = getArr() as unknown as Record<string | symbol, unknown>
      arr[prop] = value
      return true
    },
    has: (_t, prop) => prop in getArr(),
    ownKeys: () => Object.keys(getArr()),
    getOwnPropertyDescriptor: (_t, prop) =>
      Object.getOwnPropertyDescriptor(getArr(), prop),
  })
}

export const slaPolicies: SlaPolicy[] = arrayProxy(() => _state().slaPolicies)
export const automationRules: AutomationRule[] = arrayProxy(
  () => _state().automationRules
)

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------

export function createPolicy(input: {
  name?: string
  durationValue?: number
  durationUnit?: SlaDurationUnit
  scopeChips?: string[]
  pauseConditions?: string
  breachNotify?: string
}) {
  if (!input.name?.trim()) {
    return { success: false as const, error: "Name is required" }
  }
  if (!input.durationValue || input.durationValue <= 0) {
    return { success: false as const, error: "Duration must be positive" }
  }
  const t = now()
  const policy: SlaPolicy = {
    id: `sla_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    durationValue: input.durationValue,
    durationUnit: input.durationUnit ?? "hours",
    scopeChips: input.scopeChips ?? [],
    pauseConditions: input.pauseConditions ?? "",
    breachNotify: input.breachNotify ?? "",
    createdAt: t,
    updatedAt: t,
  }
  _state().slaPolicies.push(policy)
  return { success: true as const, data: policy }
}

export function updatePolicy(
  id: string,
  patch: Partial<Omit<SlaPolicy, "id" | "createdAt">>
) {
  const policy = _state().slaPolicies.find((p) => p.id === id)
  if (!policy) return { success: false as const, error: "Policy not found" }
  if (patch.name !== undefined) {
    if (!patch.name.trim())
      return { success: false as const, error: "Name cannot be empty" }
    policy.name = patch.name.trim()
  }
  if (patch.durationValue !== undefined) {
    if (patch.durationValue <= 0)
      return {
        success: false as const,
        error: "Duration must be positive",
      }
    policy.durationValue = patch.durationValue
  }
  if (patch.durationUnit !== undefined) policy.durationUnit = patch.durationUnit
  if (patch.scopeChips !== undefined) policy.scopeChips = patch.scopeChips
  if (patch.pauseConditions !== undefined)
    policy.pauseConditions = patch.pauseConditions
  if (patch.breachNotify !== undefined) policy.breachNotify = patch.breachNotify
  policy.updatedAt = now()
  return { success: true as const, data: policy }
}

export function deletePolicy(id: string) {
  const arr = _state().slaPolicies
  const idx = arr.findIndex((p) => p.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  arr.splice(idx, 1)
  for (const r of _state().automationRules) {
    if (r.slaPolicyId === id) r.slaPolicyId = null
  }
  return { success: true as const, data: { id } }
}

// ---------------------------------------------------------------------------
// Automation rules
// ---------------------------------------------------------------------------

export function createRule(input: {
  name?: string
  trigger?: AutomationTrigger
  conditions?: AutomationRule["conditions"]
  action?: AutomationAction
  slaPolicyId?: string | null
}) {
  if (!input.name?.trim()) {
    return { success: false as const, error: "Name is required" }
  }
  const t = now()
  const rule: AutomationRule = {
    id: `rule_${Math.random().toString(36).slice(2, 10)}`,
    name: input.name.trim(),
    trigger: input.trigger ?? "issue-created",
    conditions: input.conditions ?? {
      teamId: null,
      labelIds: [],
      priority: null,
      assigneeId: null,
    },
    action: input.action ?? "add-sla",
    slaPolicyId: input.slaPolicyId ?? null,
    createdAt: t,
    updatedAt: t,
  }
  _state().automationRules.push(rule)
  return { success: true as const, data: rule }
}

export function updateRule(
  id: string,
  patch: Partial<Omit<AutomationRule, "id" | "createdAt">>
) {
  const rule = _state().automationRules.find((r) => r.id === id)
  if (!rule) return { success: false as const, error: "Rule not found" }
  if (patch.name !== undefined) {
    if (!patch.name.trim())
      return { success: false as const, error: "Name cannot be empty" }
    rule.name = patch.name.trim()
  }
  if (patch.trigger !== undefined) rule.trigger = patch.trigger
  if (patch.conditions !== undefined) rule.conditions = patch.conditions
  if (patch.action !== undefined) rule.action = patch.action
  if (patch.slaPolicyId !== undefined) rule.slaPolicyId = patch.slaPolicyId
  rule.updatedAt = now()
  return { success: true as const, data: rule }
}

export function deleteRule(id: string) {
  const arr = _state().automationRules
  const idx = arr.findIndex((r) => r.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  arr.splice(idx, 1)
  return { success: true as const, data: { id } }
}
