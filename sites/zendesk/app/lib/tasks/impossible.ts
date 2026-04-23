import type { TaskDefinition } from "@thetabench/core"

const R = {
  completion: 5.0,
  partialPerCheck: false,
  stepPenalty: -0.01,
  invalidActionPenalty: -0.1,
}

export const impossibleTasks: TaskDefinition[] = [
  {
    id: "zen-imp-001",
    site: "zendesk",
    domain: "impossible",
    type: "no_action",
    difficulty: "medium",
    curriculumStage: 8,
    title: "Reopen a closed ticket",
    goal: "Reopen ticket tic-1 (currently closed) and set its status back to 'open'.",
    impossibilityReason:
      "Ticket tic-1 is in 'closed' state. Closed tickets cannot be reopened in Zendesk — agents must create a follow-up ticket linked to the original instead.",
    evalChecks: [],
    maxSteps: 12,
    rewardProfile: R,
    tags: ["impossible", "error-recognition"],
  },
  {
    id: "zen-imp-002",
    site: "zendesk",
    domain: "impossible",
    type: "no_action",
    difficulty: "medium",
    curriculumStage: 8,
    title: "Refund a non-billing ticket",
    goal: "Issue a refund on ticket tic-5 (Mobile app crashes on iOS).",
    impossibilityReason:
      "Ticket tic-5 is a product bug report with no associated charge — there is nothing to refund. Refunds are only valid for tickets with billing transactions tied to the requester's account.",
    evalChecks: [],
    maxSteps: 12,
    rewardProfile: R,
    tags: ["impossible", "error-recognition", "billing"],
  },
]
