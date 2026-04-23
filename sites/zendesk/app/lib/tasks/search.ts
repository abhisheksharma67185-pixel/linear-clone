import type { TaskDefinition } from "@thetabench/core"

const R = {
  completion: 2.0,
  partialPerCheck: false,
  stepPenalty: -0.01,
  invalidActionPenalty: -0.1,
}

export const searchTasks: TaskDefinition[] = [
  {
    id: "zen-srch-001",
    site: "zendesk",
    domain: "search",
    type: "retrieval",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Find ticket by number",
    goal: "Look up ticket #5 and report its subject.",
    retrievalRubric: {
      question: "What is the subject of ticket #5?",
      groundTruth: "Mobile app crashes on startup (iOS 18)",
      acceptableVariations: [
        "Mobile app crashes on startup (iOS 18)",
        "Mobile app crashes",
      ],
      rubric: "Agent must locate ticket by number 5 and read its subject.",
    },
    evalChecks: [],
    maxSteps: 5,
    rewardProfile: R,
    tags: ["search"],
  },
  {
    id: "zen-srch-002",
    site: "zendesk",
    domain: "search",
    type: "retrieval",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Find ticket by requester email",
    goal: "Search for tickets requested by 'aisha.khan@example.com' and report the subjects.",
    retrievalRubric: {
      question: "Which tickets did aisha.khan@example.com request?",
      groundTruth:
        "Refund request — order #88421; Search returns no results for known keywords",
      acceptableVariations: [
        "tic-4, tic-18",
        "Refund request and Search returns no results",
      ],
      rubric:
        "Aisha Khan (usr-7) requested 2 tickets: tic-4 (refund) and tic-18 (search).",
    },
    evalChecks: [],
    maxSteps: 6,
    rewardProfile: R,
    tags: ["search", "filter"],
  },
  {
    id: "zen-srch-003",
    site: "zendesk",
    domain: "search",
    type: "retrieval",
    difficulty: "medium",
    curriculumStage: 4,
    title: "Find tickets with tag",
    goal: "Search for tickets tagged 'webhooks' and report their ticket numbers.",
    retrievalRubric: {
      question: "Which ticket numbers have the 'webhooks' tag?",
      groundTruth: "10, 29",
      acceptableVariations: ["10 and 29", "#10, #29"],
      rubric: "Tickets with tag 'webhooks' are tic-10 (#10) and tic-29 (#29).",
    },
    evalChecks: [],
    maxSteps: 6,
    rewardProfile: R,
    tags: ["search", "tags"],
  },
  {
    id: "zen-srch-004",
    site: "zendesk",
    domain: "search",
    type: "retrieval",
    difficulty: "medium",
    curriculumStage: 4,
    title: "Find tickets assigned to no one",
    goal: "Find all tickets that have no assignee and report how many there are.",
    retrievalRubric: {
      question: "How many tickets have no assignee?",
      groundTruth: "5",
      acceptableVariations: ["5", "5 tickets"],
      rubric:
        "Seed data has 5 unassigned tickets: tic-6, tic-14, tic-18, tic-20, tic-24.",
    },
    evalChecks: [],
    maxSteps: 6,
    rewardProfile: R,
    tags: ["search", "filter"],
  },
  {
    id: "zen-srch-005",
    site: "zendesk",
    domain: "search",
    type: "retrieval",
    difficulty: "medium",
    curriculumStage: 4,
    title: "Find ticket by subject keyword",
    goal: "Search the ticket list for 'webhook' and report the subjects of the matching tickets.",
    retrievalRubric: {
      question: "Which tickets mention 'webhook' in the subject?",
      groundTruth:
        "Webhook deliveries failing with 502; Webhook signature mismatch on staging",
      acceptableVariations: [
        "Webhook deliveries failing with 502; Webhook signature mismatch on staging",
        "tic-10, tic-29",
      ],
      rubric:
        "Two tickets contain 'webhook' in their subject: tic-10 and tic-29.",
    },
    evalChecks: [],
    maxSteps: 6,
    rewardProfile: R,
    tags: ["search"],
  },
]
