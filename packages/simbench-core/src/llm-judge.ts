import type { RetrievalRubric } from "./tasks/types";

// ---------------------------------------------------------------------------
// LLM Judge result
// ---------------------------------------------------------------------------

export interface JudgeResult {
  passed: boolean;
  reasoning: string;
  matchType: "exact" | "variation" | "semantic" | "failed";
}

// ---------------------------------------------------------------------------
// Evaluate a retrieval response against a rubric
// ---------------------------------------------------------------------------

export function judgeRetrieval(agentResponse: string, rubric: RetrievalRubric): JudgeResult {
  const normalized = agentResponse.trim().toLowerCase();
  const truth = rubric.groundTruth.trim().toLowerCase();

  if (normalized === truth) {
    return {
      passed: true,
      reasoning: `Exact match with ground truth: "${rubric.groundTruth}"`,
      matchType: "exact",
    };
  }

  for (const variation of rubric.acceptableVariations) {
    if (normalized === variation.trim().toLowerCase()) {
      return {
        passed: true,
        reasoning: `Matched acceptable variation: "${variation}"`,
        matchType: "variation",
      };
    }
  }

  if (normalized.includes(truth) && truth.length > 2) {
    return {
      passed: true,
      reasoning: `Response contains ground truth: "${rubric.groundTruth}"`,
      matchType: "semantic",
    };
  }

  return {
    passed: false,
    reasoning: `Response "${agentResponse}" does not match ground truth "${rubric.groundTruth}"`,
    matchType: "failed",
  };
}

// ---------------------------------------------------------------------------
// Evaluate an impossible task response
// ---------------------------------------------------------------------------

const IMPOSSIBILITY_INDICATORS = [
  "not possible",
  "cannot",
  "can't",
  "impossible",
  "unable",
  "already",
  "not available",
  "does not exist",
  "doesn't exist",
  "no such",
  "not found",
  "failed",
  "error",
];

export function judgeImpossibleTask(agentResponse: string): JudgeResult {
  const normalized = agentResponse.trim().toLowerCase();
  const recognized = IMPOSSIBILITY_INDICATORS.some((ind) => normalized.includes(ind));

  return recognized
    ? {
        passed: true,
        reasoning: "Agent correctly recognized the task as impossible",
        matchType: "semantic",
      }
    : {
        passed: false,
        reasoning: `Agent did not recognize impossibility. Response: "${agentResponse}"`,
        matchType: "failed",
      };
}
