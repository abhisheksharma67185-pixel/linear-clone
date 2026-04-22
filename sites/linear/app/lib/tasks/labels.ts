import type { TaskDefinition } from "@thetabench/core"

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

// Label reference (new CESS data):
//   label-1  frontend          (Area)
//   label-2  backend           (Area)
//   label-3  infra             (Area)
//   label-4  design-needed     (Area)
//   label-5  bug               (Type)
//   label-6  feature           (Type)
//   label-7  tech-debt         (Type)
//   label-8  improvement       (Type)
//   label-9  blocked           (Status)
//   label-10 customer-reported (Source)
//   label-11 p1-critical       (Severity)
//   label-12 p2-high           (Severity)

export const labelTasks: TaskDefinition[] = [
  {
    id: "linear-lbl-001",
    site: "linear",
    domain: "labels",
    type: "action",
    difficulty: "medium",
    curriculumStage: 3,
    title: "Create a label",
    goal: "Create a new label named 'critical' with color '#dc2626' in team Platform (team-1).",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "label_exists",
        expected: { name: "critical", color: "#dc2626", teamId: "team-1" },
        weight: 1.0,
        description: "Label 'critical' exists with correct color",
      },
    ],
    maxSteps: 10,
    rewardProfile: R5,
    tags: ["create", "label"],
  },
  {
    id: "linear-lbl-002",
    site: "linear",
    domain: "labels",
    type: "action",
    difficulty: "medium",
    curriculumStage: 3,
    title: "Update label color",
    goal: "Update the 'bug' label (label-5) color to '#b91c1c'.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "label_exists",
        expected: { name: "bug", color: "#b91c1c" },
        weight: 1.0,
        description: "Label 'bug' has updated color",
      },
    ],
    maxSteps: 10,
    rewardProfile: R5,
    tags: ["update", "label"],
  },
  {
    id: "linear-lbl-003",
    site: "linear",
    domain: "labels",
    type: "action",
    difficulty: "medium",
    curriculumStage: 5,
    title: "Add label to issue",
    goal: "Add the 'infra' label (label-3) to issue PLT-109 (iss-9). Current labelIds: ['label-2', 'label-3'] — wait, check current state first and add only what's missing. Final state must include label-3.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "issue_has_fields",
        id: "iss-9",
        expected: {
          labelIds: ["label-2", "label-3"],
        },
        weight: 1.0,
        description: "PLT-109 has both backend and infra labels",
      },
    ],
    maxSteps: 10,
    rewardProfile: R5,
    tags: ["label", "issue"],
  },
  {
    id: "linear-lbl-004",
    site: "linear",
    domain: "labels",
    type: "action",
    difficulty: "medium",
    curriculumStage: 5,
    title: "Create label in Frontend team",
    goal: "Create a new label named 'accessibility' with color '#059669' in the Frontend team (team-2).",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "label_exists",
        expected: { name: "accessibility", color: "#059669", teamId: "team-2" },
        weight: 1.0,
        description: "Label 'accessibility' exists in Frontend team",
      },
    ],
    maxSteps: 10,
    rewardProfile: R5,
    tags: ["create", "label"],
  },
  {
    id: "linear-lbl-005",
    site: "linear",
    domain: "labels",
    type: "action",
    difficulty: "hard",
    curriculumStage: 7,
    title: "Create label and assign to triage issues",
    goal: "Create a label 'needs-triage' with color '#6b7280' in Platform team (team-1). Then add this new label to issues PLT-301 (iss-51) and PLT-302 (iss-52).",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "label_exists",
        expected: { name: "needs-triage", color: "#6b7280", teamId: "team-1" },
        weight: 0.34,
        description: "Label 'needs-triage' exists",
      },
      {
        type: "state_predicate",
        predicate: "issue_has_fields",
        id: "iss-51",
        expected: { labelIds: ["label-13"] },
        weight: 0.33,
        description: "PLT-301 has new label",
      },
      {
        type: "state_predicate",
        predicate: "issue_has_fields",
        id: "iss-52",
        expected: { labelIds: ["label-13"] },
        weight: 0.33,
        description: "PLT-302 has new label",
      },
    ],
    maxSteps: 20,
    rewardProfile: R8,
    tags: ["create", "label", "multi-step"],
  },
  {
    id: "linear-lbl-006",
    site: "linear",
    domain: "labels",
    type: "action",
    difficulty: "medium",
    curriculumStage: 5,
    title: "Mark issue as blocked",
    goal: "Add the 'blocked' label (label-9) to issue PLT-108 (iss-8), which is currently waiting on PLT-107.",
    evalChecks: [
      {
        type: "state_predicate",
        predicate: "issue_has_fields",
        id: "iss-8",
        expected: { labelIds: ["label-2", "label-6", "label-9"] },
        weight: 1.0,
        description: "PLT-108 has blocked label added",
      },
    ],
    maxSteps: 10,
    rewardProfile: R5,
    tags: ["label", "issue"],
  },
]
