import type { TaskDefinition } from "@thetabench/core"

const R2 = {
  completion: 2.0,
  partialPerCheck: false,
  stepPenalty: -0.01,
  invalidActionPenalty: -0.1,
}
const R5 = {
  completion: 5.0,
  partialPerCheck: true,
  stepPenalty: -0.01,
  invalidActionPenalty: -0.1,
}
const R8 = {
  completion: 8.0,
  partialPerCheck: true,
  stepPenalty: -0.02,
  invalidActionPenalty: -0.2,
}
const R10 = {
  completion: 10.0,
  partialPerCheck: true,
  stepPenalty: -0.02,
  invalidActionPenalty: -0.2,
}

// Reference threads:
//   thr-1   Webhook failing on org_megacorp     open       urgent   MegaCorp
//   thr-2   Question about API rate limits      open       normal   Lumen Labs
//   thr-4   Billing: invoice INV-12             open       high     MegaCorp
//   thr-7   Onboarding: SSO with Okta           snoozed    high     Halcyon
//   thr-9   Refund — accidental upgrade         done       normal   Lumen Labs
//   thr-15  Mobile push notifications           open       normal   Acme Robotics  (unassigned)
//   thr-25  Production webhook signature        open       urgent   Voltage Pay

export const threadTasks: TaskDefinition[] = [
  // ---------------------------------------------------------------------------
  // Stage 2 — single-field updates (easy)
  // ---------------------------------------------------------------------------
  {
    id: "plain-thr-001",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Mark a thread as done",
    goal: "Mark thread thr-2 ('Question about API rate limits') as done.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_status",
        id: "thr-2",
        expected: "done",
        weight: 1.0,
        description: "thr-2 has status done",
      },
    ],
    maxSteps: 8,
    rewardProfile: R2,
    tags: ["form-fill", "status"],
  },
  {
    id: "plain-thr-002",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Snooze a thread",
    goal: "Snooze thread thr-3 ('Feature request: bulk export of threads') until 2026-04-30T09:00:00.000Z.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_status",
        id: "thr-3",
        expected: "snoozed",
        weight: 1.0,
        description: "thr-3 is snoozed",
      },
    ],
    maxSteps: 8,
    rewardProfile: R2,
    tags: ["form-fill", "status"],
  },
  {
    id: "plain-thr-003",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Reopen a done thread",
    goal: "Reopen thread thr-9 ('Refund — accidental upgrade'). Customer wrote back.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_status",
        id: "thr-9",
        expected: "open",
        weight: 1.0,
        description: "thr-9 is open again",
      },
    ],
    maxSteps: 8,
    rewardProfile: R2,
    tags: ["form-fill", "status"],
  },
  {
    id: "plain-thr-004",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Assign an unassigned thread",
    goal: "Assign thread thr-15 ('Mobile push notifications not arriving') to Anika Iyer (agt-3).",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_assignee",
        id: "thr-15",
        expected: "agt-3",
        weight: 1.0,
        description: "thr-15 is assigned to agt-3",
      },
    ],
    maxSteps: 8,
    rewardProfile: R2,
    tags: ["form-fill", "assignment"],
  },
  {
    id: "plain-thr-005",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Bump priority to urgent",
    goal: "Change priority on thread thr-6 ('Slack integration disconnected overnight') to 'urgent'.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_priority",
        id: "thr-6",
        expected: "urgent",
        weight: 1.0,
        description: "thr-6 priority is urgent",
      },
    ],
    maxSteps: 8,
    rewardProfile: R2,
    tags: ["form-fill", "priority"],
  },

  // ---------------------------------------------------------------------------
  // Stage 3 — create / reply (medium)
  // ---------------------------------------------------------------------------
  {
    id: "plain-thr-006",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "medium",
    curriculumStage: 3,
    title: "Reply to a customer",
    goal: "Reply to thread thr-2 ('Question about API rate limits') with the message 'Bumped your trial workspace to 100/min, please retry.'.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_message",
        id: "thr-2",
        expected: "Bumped your trial workspace to 100/min, please retry.",
        weight: 1.0,
        description: "thr-2 has a new agent reply matching the body",
      },
    ],
    maxSteps: 12,
    rewardProfile: R5,
    tags: ["create", "reply"],
  },
  {
    id: "plain-thr-007",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "medium",
    curriculumStage: 3,
    title: "Create a new thread",
    goal: "Create a new thread on behalf of customer cus-7 (Mei Tanaka) titled 'Cannot upload avatar — getting 413 on POST'. Set priority to 'normal'.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_fields",
        expected: {
          title: "Cannot upload avatar — getting 413 on POST",
          customerId: "cus-7",
          priority: "normal",
        },
        weight: 1.0,
        description: "New thread exists with the right title and customer",
      },
    ],
    maxSteps: 15,
    rewardProfile: R5,
    tags: ["create"],
  },
  {
    id: "plain-thr-008",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "medium",
    curriculumStage: 3,
    title: "Reply and snooze",
    goal: "Reply to thread thr-10 ('API auth: rotating secret keys') with 'Use POST /workspace/keys/rotate — old key stays valid for 24h.' and snooze it until 2026-04-25T09:00:00.000Z.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_message",
        id: "thr-10",
        expected:
          "Use POST /workspace/keys/rotate — old key stays valid for 24h.",
        weight: 0.5,
        description: "thr-10 received the reply",
      },
      {
        type: "state_predicate",
        predicate: "thread_has_status",
        id: "thr-10",
        expected: "snoozed",
        weight: 0.5,
        description: "thr-10 is snoozed",
      },
    ],
    maxSteps: 15,
    rewardProfile: R5,
    tags: ["create", "reply", "status"],
  },
  {
    id: "plain-thr-009",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "medium",
    curriculumStage: 3,
    title: "Reply and mark done",
    goal: "Reply to thread thr-19 ('Onboarding webhook receiver setup') with 'Point your staging at https://api.thetabench.support/webhooks/staging — ping us if signing fails.' then mark it done.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_message",
        id: "thr-19",
        expected:
          "Point your staging at https://api.thetabench.support/webhooks/staging — ping us if signing fails.",
        weight: 0.5,
        description: "thr-19 received the reply",
      },
      {
        type: "state_predicate",
        predicate: "thread_has_status",
        id: "thr-19",
        expected: "done",
        weight: 0.5,
        description: "thr-19 is done",
      },
    ],
    maxSteps: 15,
    rewardProfile: R5,
    tags: ["create", "reply", "status"],
  },
  {
    id: "plain-thr-010",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "medium",
    curriculumStage: 3,
    title: "Add an internal note",
    goal: "Add an internal note to thread thr-11 ('Stripe webhook events deduped wrong'): 'Coordinating with platform to ship a hotfix in the next deploy window.'.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_message",
        id: "thr-11",
        expected:
          "Coordinating with platform to ship a hotfix in the next deploy window.",
        weight: 1.0,
        description: "thr-11 received an internal note containing the body",
      },
    ],
    maxSteps: 12,
    rewardProfile: R5,
    tags: ["create", "note"],
  },

  // ---------------------------------------------------------------------------
  // Stage 5 — multi-field updates (medium)
  // ---------------------------------------------------------------------------
  {
    id: "plain-thr-011",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "medium",
    curriculumStage: 5,
    title: "Triage a thread",
    goal: "Triage thread thr-13 ('Export: customer attributes missing in CSV'): set priority to 'high' and assign to Theo Hartmann (agt-2).",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_priority",
        id: "thr-13",
        expected: "high",
        weight: 0.5,
        description: "thr-13 priority is high",
      },
      {
        type: "state_predicate",
        predicate: "thread_has_assignee",
        id: "thr-13",
        expected: "agt-2",
        weight: 0.5,
        description: "thr-13 assigned to agt-2",
      },
    ],
    maxSteps: 12,
    rewardProfile: R5,
    tags: ["multi-field"],
  },
  {
    id: "plain-thr-012",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "medium",
    curriculumStage: 5,
    title: "Reassign and snooze",
    goal: "Reassign thread thr-7 ('Onboarding: SSO with Okta not working') to Theo Hartmann (agt-2) and extend the snooze until 2026-04-26T09:00:00.000Z.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_assignee",
        id: "thr-7",
        expected: "agt-2",
        weight: 0.5,
        description: "thr-7 assignee changed to agt-2",
      },
      {
        type: "state_predicate",
        predicate: "thread_has_status",
        id: "thr-7",
        expected: "snoozed",
        weight: 0.5,
        description: "thr-7 still snoozed",
      },
    ],
    maxSteps: 15,
    rewardProfile: R5,
    tags: ["multi-field"],
  },
  {
    id: "plain-thr-013",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "medium",
    curriculumStage: 5,
    title: "Rename and reprioritize",
    goal: "Update thread thr-22: change the title to 'Snooze: timezone math wrong on next-Monday preset' and set priority to 'normal'.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_fields",
        id: "thr-22",
        expected: {
          title: "Snooze: timezone math wrong on next-Monday preset",
          priority: "normal",
        },
        weight: 1.0,
        description: "thr-22 has new title and priority",
      },
    ],
    maxSteps: 12,
    rewardProfile: R5,
    tags: ["multi-field"],
  },
  {
    id: "plain-thr-014",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "medium",
    curriculumStage: 5,
    title: "Take ownership of urgent thread",
    goal: "Assign thread thr-25 ('Urgent: production webhook signature mismatch') to yourself (Marie Lefevre, agt-1) and confirm priority remains urgent.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_assignee",
        id: "thr-25",
        expected: "agt-1",
        weight: 0.5,
        description: "thr-25 assigned to agt-1",
      },
      {
        type: "state_predicate",
        predicate: "thread_has_priority",
        id: "thr-25",
        expected: "urgent",
        weight: 0.5,
        description: "thr-25 still urgent",
      },
    ],
    maxSteps: 10,
    rewardProfile: R5,
    tags: ["multi-field"],
  },
  {
    id: "plain-thr-015",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "hard",
    curriculumStage: 7,
    title: "Bulk done sweep",
    goal: "Mark all three of thr-2, thr-3, thr-18 as done — these have been resolved out-of-band.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_status",
        id: "thr-2",
        expected: "done",
        weight: 0.34,
        description: "thr-2 done",
      },
      {
        type: "state_predicate",
        predicate: "thread_has_status",
        id: "thr-3",
        expected: "done",
        weight: 0.33,
        description: "thr-3 done",
      },
      {
        type: "state_predicate",
        predicate: "thread_has_status",
        id: "thr-18",
        expected: "done",
        weight: 0.33,
        description: "thr-18 done",
      },
    ],
    maxSteps: 20,
    rewardProfile: R8,
    tags: ["bulk", "status"],
  },

  // ---------------------------------------------------------------------------
  // Stage 8 — complex multi-step (hard)
  // ---------------------------------------------------------------------------
  {
    id: "plain-thr-016",
    site: "plain",
    domain: "messages",
    type: "action",
    difficulty: "hard",
    curriculumStage: 8,
    title: "Full incident response",
    goal: "For thread thr-25: assign yourself (agt-1), add labels 'urgent' and 'webhook' (already present is fine), reply 'Rolling back the v2 signature change now — ETA 5 minutes to recovery.', and keep priority urgent.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "thread_has_assignee",
        id: "thr-25",
        expected: "agt-1",
        weight: 0.34,
        description: "thr-25 assigned to agt-1",
      },
      {
        type: "state_predicate",
        predicate: "thread_has_label",
        id: "thr-25",
        expected: "lbl-10",
        weight: 0.33,
        description: "thr-25 has webhook label",
      },
      {
        type: "state_predicate",
        predicate: "thread_has_message",
        id: "thr-25",
        expected:
          "Rolling back the v2 signature change now — ETA 5 minutes to recovery.",
        weight: 0.33,
        description: "thr-25 has the recovery reply",
      },
    ],
    maxSteps: 25,
    rewardProfile: R10,
    tags: ["multi-step", "complex"],
  },
]
