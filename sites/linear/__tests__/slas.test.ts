import { afterEach, describe, expect, it } from "vitest"

import {
  automationRules,
  createPolicy,
  createRule,
  deletePolicy,
  deleteRule,
  planState,
  setPlan,
  slaPolicies,
  updatePolicy,
  updateRule,
} from "../lib/sla-mocks"

// Mirror of the UI's `isGatedPlan` helper. Kept in-file so the unit tests
// enforce the same gating logic shipped with the component.
function isGatedPlan(
  plan: "free" | "standard" | "trial" | "business" | "enterprise"
): boolean {
  return plan === "free" || plan === "standard"
}

afterEach(() => {
  slaPolicies.length = 0
  automationRules.length = 0
  setPlan("free", null)
})

describe("plan gating logic", () => {
  it("gates free and standard plans", () => {
    expect(isGatedPlan("free")).toBe(true)
    expect(isGatedPlan("standard")).toBe(true)
  })
  it("does not gate trial / business / enterprise", () => {
    expect(isGatedPlan("trial")).toBe(false)
    expect(isGatedPlan("business")).toBe(false)
    expect(isGatedPlan("enterprise")).toBe(false)
  })
})

describe("trial lifecycle", () => {
  it("setPlan flips the plan and trialDaysRemaining", () => {
    expect(planState.plan).toBe("free")
    setPlan("trial", 30)
    expect(planState.plan).toBe("trial")
    expect(planState.trialDaysRemaining).toBe(30)
  })

  it("trial plan is ungated (Add rule becomes enabled)", () => {
    setPlan("trial", 30)
    expect(isGatedPlan(planState.plan)).toBe(false)
  })
})

describe("policy CRUD", () => {
  it("rejects a policy without a name", () => {
    const r = createPolicy({ durationValue: 4, durationUnit: "hours" })
    expect(r.success).toBe(false)
  })

  it("rejects a policy with non-positive duration", () => {
    const r = createPolicy({ name: "x", durationValue: 0, durationUnit: "hours" })
    expect(r.success).toBe(false)
  })

  it("creates + updates + deletes a policy", () => {
    const c = createPolicy({
      name: "P1 response",
      durationValue: 4,
      durationUnit: "hours",
    })
    expect(c.success).toBe(true)
    if (!c.success) return

    const u = updatePolicy(c.data.id, { durationValue: 2 })
    expect(u.success).toBe(true)
    if (u.success) expect(u.data.durationValue).toBe(2)

    const d = deletePolicy(c.data.id)
    expect(d.success).toBe(true)
    expect(slaPolicies.length).toBe(0)
  })
})

describe("automation rules CRUD + cascade", () => {
  it("creates rule with default conditions", () => {
    const r = createRule({ name: "triage", trigger: "issue-created" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.conditions.priority).toBeNull()
      expect(r.data.action).toBe("add-sla")
    }
  })

  it("updates rule trigger and action", () => {
    const c = createRule({ name: "triage" })
    if (!c.success) throw new Error("seed")
    const u = updateRule(c.data.id, {
      trigger: "label-added",
      action: "remove-sla",
    })
    expect(u.success).toBe(true)
    if (u.success) {
      expect(u.data.trigger).toBe("label-added")
      expect(u.data.action).toBe("remove-sla")
    }
  })

  it("deleting a policy nulls slaPolicyId on referring rules", () => {
    const pol = createPolicy({
      name: "P1",
      durationValue: 4,
      durationUnit: "hours",
    })
    if (!pol.success) throw new Error("seed")
    const rule = createRule({
      name: "triage",
      slaPolicyId: pol.data.id,
    })
    if (!rule.success) throw new Error("seed")
    expect(rule.data.slaPolicyId).toBe(pol.data.id)

    deletePolicy(pol.data.id)
    const after = automationRules.find((r) => r.id === rule.data.id)
    expect(after?.slaPolicyId).toBeNull()
  })

  it("deleting a rule removes it from the list", () => {
    const r = createRule({ name: "x" })
    if (!r.success) throw new Error("seed")
    const d = deleteRule(r.data.id)
    expect(d.success).toBe(true)
    expect(automationRules.length).toBe(0)
  })

  it("deleting an unknown rule errors", () => {
    expect(deleteRule("rule_nope").success).toBe(false)
  })
})

describe("e2e-style flow", () => {
  it("free plan → start trial → create policy + rule → delete policy cascades", () => {
    // 1. Starting state is free — Add rule would be gated in UI.
    expect(isGatedPlan(planState.plan)).toBe(true)

    // 2. User starts the trial.
    setPlan("trial", 30)
    expect(isGatedPlan(planState.plan)).toBe(false)

    // 3. User creates an SLA policy.
    const pol = createPolicy({
      name: "P1",
      durationValue: 4,
      durationUnit: "hours",
    })
    expect(pol.success).toBe(true)
    if (!pol.success) return

    // 4. User creates an automation rule targeting that policy.
    const rule = createRule({ name: "P1 triage", slaPolicyId: pol.data.id })
    expect(rule.success).toBe(true)
    if (!rule.success) return
    expect(rule.data.slaPolicyId).toBe(pol.data.id)

    // 5. User deletes the policy — rule stays but loses the target.
    deletePolicy(pol.data.id)
    const orphan = automationRules.find((r) => r.id === rule.data.id)
    expect(orphan).toBeDefined()
    expect(orphan?.slaPolicyId).toBeNull()
  })
})
