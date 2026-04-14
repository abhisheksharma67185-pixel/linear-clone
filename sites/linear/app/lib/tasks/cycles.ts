import type { TaskDefinition } from "@simbench/core";

const R5 = {
  completion: 5.0,
  partialPerCheck: true,
  stepPenalty: -0.01,
  invalidActionPenalty: -0.1,
};
const R8 = {
  completion: 8.0,
  partialPerCheck: true,
  stepPenalty: -0.02,
  invalidActionPenalty: -0.2,
};
const R10 = {
  completion: 10.0,
  partialPerCheck: true,
  stepPenalty: -0.02,
  invalidActionPenalty: -0.2,
};

// Cycle reference (new CESS data):
//   cycle-1  Sprint 8        Platform   completed
//   cycle-2  Sprint 9        Platform   completed
//   cycle-3  Sprint 10       Platform   completed
//   cycle-4  Sprint 11       Platform   completed
//   cycle-5  Sprint 12       Platform   completed
//   cycle-6  Sprint 13       Platform   active      (benchmark day)
//   cycle-7  FE Sprint 10    Frontend   completed
//   cycle-8  FE Sprint 11    Frontend   completed
//   cycle-9  FE Sprint 12    Frontend   completed
//   cycle-10 FE Sprint 13    Frontend   active
//   cycle-11 Infra Sprint 10 Infra      completed
//   cycle-12 Infra Sprint 11 Infra      completed
//   cycle-13 Infra Sprint 12 Infra      completed
//   cycle-14 Infra Sprint 13 Infra      active

export const cycleTasks: TaskDefinition[] = [
  // ---------------------------------------------------------------------------
  // Stage 3 — basic cycle operations
  // ---------------------------------------------------------------------------
  {
    id: "linear-cyc-001",
    site: "linear",
    domain: "cycles",
    type: "action",
    difficulty: "medium",
    curriculumStage: 3,
    title: "Create a cycle",
    goal: "Create a new cycle named 'Sprint 14' in team Platform (team-1) with description 'Post-release cleanup', starting 2026-04-14 and ending 2026-04-28.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "cycle_has_state",
        id: "cycle-15",
        expected: "upcoming",
        weight: 1.0,
        description: "Sprint 14 exists in upcoming state",
      },
    ],
    maxSteps: 15,
    rewardProfile: R5,
    tags: ["create", "cycle"],
  },
  {
    id: "linear-cyc-002",
    site: "linear",
    domain: "cycles",
    type: "action",
    difficulty: "medium",
    curriculumStage: 3,
    title: "Move issue to active cycle",
    goal: "Move issue PLT-109 (iss-9) into Sprint 13 (cycle-6), the active Platform cycle.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "issue_in_cycle",
        id: "iss-9",
        expected: "cycle-6",
        weight: 1.0,
        description: "PLT-109 is in cycle-6",
      },
    ],
    maxSteps: 10,
    rewardProfile: R5,
    tags: ["cycle", "move"],
  },

  // ---------------------------------------------------------------------------
  // Stage 5 — cycle lifecycle
  // ---------------------------------------------------------------------------
  {
    id: "linear-cyc-003",
    site: "linear",
    domain: "cycles",
    type: "action",
    difficulty: "medium",
    curriculumStage: 5,
    title: "Complete active Platform cycle",
    goal: "Complete Sprint 13 (cycle-6), the currently active Platform cycle.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "cycle_has_state",
        id: "cycle-6",
        expected: "completed",
        weight: 1.0,
        description: "Sprint 13 is completed",
      },
    ],
    maxSteps: 10,
    rewardProfile: R5,
    tags: ["cycle", "complete"],
  },
  {
    id: "linear-cyc-004",
    site: "linear",
    domain: "cycles",
    type: "action",
    difficulty: "medium",
    curriculumStage: 5,
    title: "Move multiple issues to cycle",
    goal: "Move issues PLT-106 (iss-6) and PLT-108 (iss-8) into Sprint 13 (cycle-6).",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "issue_in_cycle",
        id: "iss-6",
        expected: "cycle-6",
        weight: 0.5,
        description: "PLT-106 is in cycle-6",
      },
      {
        type: "state_predicate",
        predicate: "issue_in_cycle",
        id: "iss-8",
        expected: "cycle-6",
        weight: 0.5,
        description: "PLT-108 is in cycle-6",
      },
    ],
    maxSteps: 15,
    rewardProfile: R5,
    tags: ["cycle", "bulk"],
  },
  {
    id: "linear-cyc-005",
    site: "linear",
    domain: "cycles",
    type: "action",
    difficulty: "medium",
    curriculumStage: 5,
    title: "Remove issue from cycle",
    goal: "Remove issue PLT-114 (iss-14) from Sprint 13 (cycle-6) so it has no cycle.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "issue_in_cycle",
        id: "iss-14",
        expected: null,
        weight: 1.0,
        description: "PLT-114 has no cycle",
      },
    ],
    maxSteps: 10,
    rewardProfile: R5,
    tags: ["cycle", "move"],
  },

  // ---------------------------------------------------------------------------
  // Stage 7 — complex cycle workflows
  // ---------------------------------------------------------------------------
  {
    id: "linear-cyc-006",
    site: "linear",
    domain: "cycles",
    type: "action",
    difficulty: "hard",
    curriculumStage: 7,
    title: "Complete and start next cycle",
    goal: "Complete Sprint 13 (cycle-6). Then create a new cycle 'Sprint 14' in Platform team starting 2026-04-14 and immediately start it.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "cycle_has_state",
        id: "cycle-6",
        expected: "completed",
        weight: 0.5,
        description: "Sprint 13 is completed",
      },
      {
        type: "state_predicate",
        predicate: "cycle_has_state",
        id: "cycle-15",
        expected: "active",
        weight: 0.5,
        description: "Sprint 14 is active",
      },
    ],
    maxSteps: 20,
    rewardProfile: R8,
    tags: ["cycle", "lifecycle", "multi-step"],
  },
  {
    id: "linear-cyc-007",
    site: "linear",
    domain: "cycles",
    type: "action",
    difficulty: "hard",
    curriculumStage: 7,
    title: "Plan cycle with issues",
    goal: "Create a new cycle 'Sprint 14' in Platform team with description 'Bug fixes'. Then move issues PLT-106 (iss-6) and PLT-115 (iss-15) into it.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "cycle_has_state",
        id: "cycle-15",
        expected: "upcoming",
        weight: 0.34,
        description: "Sprint 14 exists",
      },
      {
        type: "state_predicate",
        predicate: "issue_in_cycle",
        id: "iss-6",
        expected: "cycle-15",
        weight: 0.33,
        description: "PLT-106 is in new cycle",
      },
      {
        type: "state_predicate",
        predicate: "issue_in_cycle",
        id: "iss-15",
        expected: "cycle-15",
        weight: 0.33,
        description: "PLT-115 is in new cycle",
      },
    ],
    maxSteps: 20,
    rewardProfile: R10,
    tags: ["cycle", "create", "multi-step"],
  },
  {
    id: "linear-cyc-008",
    site: "linear",
    domain: "cycles",
    type: "action",
    difficulty: "hard",
    curriculumStage: 7,
    title: "Close Sprint 13 and move incomplete",
    goal: "Complete Sprint 13 (cycle-6). Before that, move the in_progress issues from cycle-6 (PLT-102, PLT-103, PLT-107, PLT-112, PLT-118, PLT-202, PLT-204, PLT-205, PLT-211) out to no cycle so Sprint 13 only contains done work. Then complete Sprint 13.",
    evalChecks: [
      { type: "state_predicate", predicate: "cycle_has_state", id: "cycle-6", expected: "completed", weight: 0.3, description: "Sprint 13 completed" },
      { type: "state_predicate", predicate: "issue_in_cycle", id: "iss-2",  expected: null, weight: 0.08, description: "PLT-102 moved out" },
      { type: "state_predicate", predicate: "issue_in_cycle", id: "iss-3",  expected: null, weight: 0.08, description: "PLT-103 moved out" },
      { type: "state_predicate", predicate: "issue_in_cycle", id: "iss-7",  expected: null, weight: 0.08, description: "PLT-107 moved out" },
      { type: "state_predicate", predicate: "issue_in_cycle", id: "iss-12", expected: null, weight: 0.08, description: "PLT-112 moved out" },
      { type: "state_predicate", predicate: "issue_in_cycle", id: "iss-18", expected: null, weight: 0.08, description: "PLT-118 moved out" },
      { type: "state_predicate", predicate: "issue_in_cycle", id: "iss-40", expected: null, weight: 0.08, description: "PLT-202 moved out" },
      { type: "state_predicate", predicate: "issue_in_cycle", id: "iss-42", expected: null, weight: 0.08, description: "PLT-204 moved out" },
      { type: "state_predicate", predicate: "issue_in_cycle", id: "iss-43", expected: null, weight: 0.07, description: "PLT-205 moved out" },
      { type: "state_predicate", predicate: "issue_in_cycle", id: "iss-49", expected: null, weight: 0.07, description: "PLT-211 moved out" },
    ],
    maxSteps: 30,
    rewardProfile: R10,
    tags: ["cycle", "bulk", "lifecycle"],
  },
  {
    id: "linear-cyc-009",
    site: "linear",
    domain: "cycles",
    type: "action",
    difficulty: "hard",
    curriculumStage: 7,
    title: "Cycle scope adjustment",
    goal: "Remove PLT-114 (iss-14, est 13) from Sprint 13 (cycle-6) and replace it with PLT-113 (iss-13, est 5) to reduce cycle scope.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "issue_in_cycle",
        id: "iss-14",
        expected: null,
        weight: 0.5,
        description: "PLT-114 removed from cycle",
      },
      {
        type: "state_predicate",
        predicate: "issue_in_cycle",
        id: "iss-13",
        expected: "cycle-6",
        weight: 0.5,
        description: "PLT-113 added to cycle",
      },
    ],
    maxSteps: 15,
    rewardProfile: R8,
    tags: ["cycle", "move", "planning"],
  },
  {
    id: "linear-cyc-010",
    site: "linear",
    domain: "cycles",
    type: "action",
    difficulty: "hard",
    curriculumStage: 7,
    title: "Create and populate cycle",
    goal: "Create cycle 'Sprint 14' in Platform team with description 'Tech debt cleanup'. Add PLT-115 (iss-15), PLT-117 (iss-17), and PLT-121 (iss-21) to it. Set estimates: PLT-115 = 5, PLT-117 = 8, PLT-121 = 3.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "cycle_has_state",
        id: "cycle-15",
        expected: "upcoming",
        weight: 0.15,
        description: "Sprint 14 exists",
      },
      {
        type: "state_predicate",
        predicate: "issue_has_fields",
        id: "iss-15",
        expected: { cycleId: "cycle-15", estimate: 5 },
        weight: 0.28,
        description: "PLT-115 in cycle with est 5",
      },
      {
        type: "state_predicate",
        predicate: "issue_has_fields",
        id: "iss-17",
        expected: { cycleId: "cycle-15", estimate: 8 },
        weight: 0.28,
        description: "PLT-117 in cycle with est 8",
      },
      {
        type: "state_predicate",
        predicate: "issue_has_fields",
        id: "iss-21",
        expected: { cycleId: "cycle-15", estimate: 3 },
        weight: 0.29,
        description: "PLT-121 in cycle with est 3",
      },
    ],
    maxSteps: 25,
    rewardProfile: R10,
    tags: ["cycle", "create", "bulk", "estimation"],
  },
];
