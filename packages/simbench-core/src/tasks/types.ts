// ---------------------------------------------------------------------------
// Task domain and classification
// ---------------------------------------------------------------------------

export type TaskDomain =
  | "navigation"
  | "products"
  | "orders"
  | "customers"
  | "discounts"
  | "settings"
  | "search"
  | "multi-domain";

export type TaskDifficulty = "easy" | "medium" | "hard" | "expert";

export type TaskType = "action" | "retrieval" | "action_retrieval" | "no_action";

// ---------------------------------------------------------------------------
// Evaluation checks
// ---------------------------------------------------------------------------

export type EvalCheckType =
  | "state_diff"
  | "state_exists"
  | "state_absent"
  | "state_count"
  | "state_predicate"
  | "retrieval";

export interface EvalCheck {
  type: EvalCheckType;
  entity?: string;
  id?: string;
  field?: string;
  expected?: unknown;
  predicate?: string;
  weight: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Retrieval rubric (for LLM-judged tasks)
// ---------------------------------------------------------------------------

export interface RetrievalRubric {
  question: string;
  groundTruth: string;
  acceptableVariations: string[];
  rubric: string;
}

// ---------------------------------------------------------------------------
// Reward shaping
// ---------------------------------------------------------------------------

export interface RewardProfile {
  completion: number;
  partialPerCheck: boolean;
  stepPenalty: number;
  invalidActionPenalty: number;
}

// ---------------------------------------------------------------------------
// Setup action (pre-conditions applied before episode starts)
// ---------------------------------------------------------------------------

export interface SetupAction {
  mutation: string;
  args: unknown[];
}

// ---------------------------------------------------------------------------
// Main task definition
// ---------------------------------------------------------------------------

export interface TaskDefinition {
  id: string;
  site: string;
  domain: TaskDomain;
  type: TaskType;
  difficulty: TaskDifficulty;
  curriculumStage: number;

  title: string;
  goal: string;
  hint?: string;

  requires?: string[];
  setup?: SetupAction[];
  configOverrides?: Record<string, unknown>;

  retrievalRubric?: RetrievalRubric;
  impossibilityReason?: string;
  evalChecks: EvalCheck[];

  maxSteps: number;
  timeLimitSeconds?: number;

  rewardProfile: RewardProfile;
  tags: string[];
}
