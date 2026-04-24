// In-memory mock state for the SLAs settings page.

export type BillingPlan =
  | "free"
  | "standard"
  | "trial"
  | "business"
  | "enterprise"

export type PlanState = {
  plan: BillingPlan
  trialDaysRemaining: number | null
}

export const planState: PlanState = {
  plan: "free",
  trialDaysRemaining: null,
}

export function setPlan(next: BillingPlan, days: number | null = null) {
  planState.plan = next
  planState.trialDaysRemaining = days
}

export type SlaDurationUnit = "minutes" | "hours" | "days" | "business-hours"

export type SlaPolicy = {
  id: string
  name: string
  durationValue: number
  durationUnit: SlaDurationUnit
  scopeChips: string[] // e.g. ["Priority: High", "Team: Eng"]
  pauseConditions: string // freeform for the prototype
  breachNotify: string // comma-separated recipients
  createdAt: string
  updatedAt: string
}

export type AutomationTrigger =
  | "issue-created"
  | "issue-updated"
  | "label-added"

export type AutomationAction = "add-sla" | "remove-sla"

export type AutomationRule = {
  id: string
  name: string
  trigger: AutomationTrigger
  conditions: {
    teamId: string | null
    labelIds: string[]
    priority: string | null
    assigneeId: string | null
  }
  action: AutomationAction
  slaPolicyId: string | null
  createdAt: string
  updatedAt: string
}

export const slaPolicies: SlaPolicy[] = []
export const automationRules: AutomationRule[] = []

const now = () => new Date().toISOString()

// -- Policies ---------------------------------------------------------------

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
  slaPolicies.push(policy)
  return { success: true as const, data: policy }
}

export function updatePolicy(
  id: string,
  patch: Partial<Omit<SlaPolicy, "id" | "createdAt">>
) {
  const policy = slaPolicies.find((p) => p.id === id)
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
  const idx = slaPolicies.findIndex((p) => p.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  slaPolicies.splice(idx, 1)
  // Null out any automation rule that referenced this policy so UI doesn't
  // dangle. We don't delete the rule; the user can re-target it.
  for (const r of automationRules) {
    if (r.slaPolicyId === id) r.slaPolicyId = null
  }
  return { success: true as const, data: { id } }
}

// -- Automation rules -------------------------------------------------------

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
  automationRules.push(rule)
  return { success: true as const, data: rule }
}

export function updateRule(
  id: string,
  patch: Partial<Omit<AutomationRule, "id" | "createdAt">>
) {
  const rule = automationRules.find((r) => r.id === id)
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
  const idx = automationRules.findIndex((r) => r.id === id)
  if (idx === -1) return { success: false as const, error: "Not found" }
  automationRules.splice(idx, 1)
  return { success: true as const, data: { id } }
}
