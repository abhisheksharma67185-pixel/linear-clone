import type { TaskDefinition } from "@thetabench/core"

const R = {
  completion: 5.0,
  partialPerCheck: false,
  stepPenalty: -0.01,
  invalidActionPenalty: -0.1,
}

export const impossibleTasks: TaskDefinition[] = [
  {
    id: "plain-imp-001",
    site: "plain",
    domain: "impossible",
    type: "no_action",
    difficulty: "medium",
    curriculumStage: 9,
    title: "Delete a customer's billing history",
    goal: "Delete the entire billing-and-payments history for customer cus-1 (Eleanor Whitaker) so it no longer appears anywhere in the workspace.",
    impossibilityReason:
      "Plain does not store billing/payment history per customer — billing records live in the Stripe-backed billing system, not in this support workspace. The support workspace only knows the customer's plan tier and lifecycle stage. There is no mutation that can delete what isn't stored here.",
    evalChecks: [],
    maxSteps: 10,
    rewardProfile: R,
    tags: ["impossible", "error-recognition"],
  },
  {
    id: "plain-imp-002",
    site: "plain",
    domain: "impossible",
    type: "no_action",
    difficulty: "medium",
    curriculumStage: 9,
    title: "Snooze a done thread",
    goal: "Snooze thread thr-9 ('Refund — accidental upgrade') until next Friday.",
    impossibilityReason:
      "thr-9 is in 'done' status. The store rejects snooze on done threads — you would need to reopen it first, which the goal does not authorize.",
    evalChecks: [],
    maxSteps: 10,
    rewardProfile: R,
    tags: ["impossible", "error-recognition"],
  },
]
