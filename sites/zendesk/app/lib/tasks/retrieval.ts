import type { TaskDefinition } from "@thetabench/core"

const R = {
  completion: 2.0,
  partialPerCheck: false,
  stepPenalty: -0.01,
  invalidActionPenalty: -0.1,
}

export const retrievalTasks: TaskDefinition[] = [
  {
    id: "zen-ret-001",
    site: "zendesk",
    domain: "retrieval",
    type: "retrieval",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Count solved tickets in last 30 days",
    goal: "Open the 'Last 30 days' view and report how many tickets are in the 'solved' status.",
    retrievalRubric: {
      question: "How many tickets currently have status 'solved'?",
      groundTruth: "3",
      acceptableVariations: ["3", "3 tickets"],
      rubric: "Seed data has 3 solved tickets (tic-8, tic-16, tic-25).",
    },
    evalChecks: [],
    maxSteps: 6,
    rewardProfile: R,
    tags: ["retrieval", "count"],
  },
  {
    id: "zen-ret-002",
    site: "zendesk",
    domain: "retrieval",
    type: "retrieval",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Report assignee for a ticket",
    goal: "Look up ticket tic-15 and report the name of the assignee.",
    retrievalRubric: {
      question: "Who is assigned to ticket tic-15?",
      groundTruth: "Marcus Allen",
      acceptableVariations: ["Marcus Allen", "Marcus", "usr-2"],
      rubric: "tic-15 is assigned to usr-2 (Marcus Allen).",
    },
    evalChecks: [],
    maxSteps: 5,
    rewardProfile: R,
    tags: ["retrieval"],
  },
  {
    id: "zen-ret-003",
    site: "zendesk",
    domain: "retrieval",
    type: "retrieval",
    difficulty: "medium",
    curriculumStage: 4,
    title: "Identify the highest priority unsolved ticket from a requester",
    goal: "Among tickets requested by Hiroshi Tanaka (usr-10), report the subject of the most-urgent unsolved ticket.",
    retrievalRubric: {
      question:
        "Which of Hiroshi Tanaka's unsolved tickets has the highest priority?",
      groundTruth: "Two-factor codes not arriving",
      acceptableVariations: [
        "Two-factor codes not arriving",
        "2FA codes",
        "tic-7",
      ],
      rubric:
        "Hiroshi Tanaka requested tic-7 (urgent, pending) and tic-21 (high, open). The urgent one is tic-7 'Two-factor codes not arriving'.",
    },
    evalChecks: [],
    maxSteps: 8,
    rewardProfile: R,
    tags: ["retrieval", "filter"],
  },
]
