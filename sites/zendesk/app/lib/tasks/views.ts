import type { TaskDefinition } from "@thetabench/core"

const R = {
  completion: 2.0,
  partialPerCheck: false,
  stepPenalty: -0.01,
  invalidActionPenalty: -0.1,
}

// Filter / view tasks — judged via retrieval rubric since the UI filter
// state isn't persisted to the store.
export const viewTasks: TaskDefinition[] = [
  {
    id: "zen-vws-001",
    site: "zendesk",
    domain: "views",
    type: "retrieval",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Filter the queue by status: open",
    goal: "On the ticket list, filter to status 'open' and report how many tickets are shown.",
    retrievalRubric: {
      question: "How many tickets have status 'open' in the seed data?",
      groundTruth: "17",
      acceptableVariations: ["17", "17 tickets"],
      rubric:
        "Agent must apply the Status filter and count open tickets. Seed data contains 17 open tickets (tic-2/3/5/6/9/11/12/14/15/17/18/21/22/24/26/27/29).",
    },
    evalChecks: [],
    maxSteps: 6,
    rewardProfile: R,
    tags: ["filter", "status"],
  },
  {
    id: "zen-vws-002",
    site: "zendesk",
    domain: "views",
    type: "retrieval",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Filter by channel: email",
    goal: "Filter the ticket list by channel 'email' and report how many tickets are shown.",
    retrievalRubric: {
      question: "How many tickets came in via email?",
      groundTruth: "13",
      acceptableVariations: ["13", "13 tickets"],
      rubric:
        "Agent must apply the Channel filter to email. Seed data has 13 email tickets.",
    },
    evalChecks: [],
    maxSteps: 6,
    rewardProfile: R,
    tags: ["filter", "channel"],
  },
  {
    id: "zen-vws-003",
    site: "zendesk",
    domain: "views",
    type: "retrieval",
    difficulty: "easy",
    curriculumStage: 3,
    title: "Filter by priority: urgent",
    goal: "Filter to priority 'urgent' and report which subjects are shown.",
    retrievalRubric: {
      question: "Which tickets have urgent priority?",
      groundTruth:
        "Mobile app crashes on startup (iOS 18); Two-factor codes not arriving; Custom domain SSL renewal failed",
      acceptableVariations: [
        "3 tickets",
        "Mobile app crashes; 2FA codes; Custom domain SSL",
      ],
      rubric:
        "Agent must filter by priority urgent and report the 3 matching tickets.",
    },
    evalChecks: [],
    maxSteps: 6,
    rewardProfile: R,
    tags: ["filter", "priority"],
  },
  {
    id: "zen-vws-004",
    site: "zendesk",
    domain: "views",
    type: "retrieval",
    difficulty: "easy",
    curriculumStage: 3,
    title: "Switch to the CC'd view",
    goal: "Open the 'CC'd' view in the left sidebar and report which group it lives under.",
    retrievalRubric: {
      question: "Which sidebar group is the CC'd view in?",
      groundTruth: "Shared work",
      acceptableVariations: ["Shared work"],
      rubric: "Agent must locate CC'd view under the 'Shared work' section.",
    },
    evalChecks: [],
    maxSteps: 6,
    rewardProfile: R,
    tags: ["filter", "view"],
  },
  {
    id: "zen-vws-005",
    site: "zendesk",
    domain: "views",
    type: "retrieval",
    difficulty: "medium",
    curriculumStage: 4,
    title: "Find tickets in the Billing group",
    goal: "Open the queue and report how many tickets are currently routed to the Billing group (grp-2).",
    retrievalRubric: {
      question: "How many tickets are in the Billing group?",
      groundTruth: "6",
      acceptableVariations: ["6", "6 tickets"],
      rubric:
        "Seed data has 6 tickets in grp-2 (tic-4, tic-8, tic-11, tic-12, tic-21, tic-28).",
    },
    evalChecks: [],
    maxSteps: 6,
    rewardProfile: R,
    tags: ["filter", "group"],
  },
]
