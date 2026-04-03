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
//
// This implementation uses exact/variation matching locally.
// For semantic matching, integrate an LLM API (Claude, GPT, etc.).
// ---------------------------------------------------------------------------

export function judgeRetrieval(
  agentResponse: string,
  rubric: RetrievalRubric,
): JudgeResult {
  const normalized = agentResponse.trim().toLowerCase();
  const truth = rubric.groundTruth.trim().toLowerCase();

  // Exact match
  if (normalized === truth) {
    return {
      passed: true,
      reasoning: `Exact match with ground truth: "${rubric.groundTruth}"`,
      matchType: "exact",
    };
  }

  // Acceptable variations
  for (const variation of rubric.acceptableVariations) {
    if (normalized === variation.trim().toLowerCase()) {
      return {
        passed: true,
        reasoning: `Matched acceptable variation: "${variation}"`,
        matchType: "variation",
      };
    }
  }

  // Containment check — agent response contains the ground truth
  if (normalized.includes(truth)) {
    return {
      passed: true,
      reasoning: `Response contains ground truth: "${rubric.groundTruth}"`,
      matchType: "semantic",
    };
  }

  // Ground truth contained in response (e.g., "$29.99" in "The price is $29.99")
  if (truth.length > 2 && normalized.includes(truth)) {
    return {
      passed: true,
      reasoning: `Ground truth found within response`,
      matchType: "semantic",
    };
  }

  return {
    passed: false,
    reasoning: `Response "${agentResponse}" does not match ground truth "${rubric.groundTruth}" or any acceptable variations`,
    matchType: "failed",
  };
}

// ---------------------------------------------------------------------------
// Evaluate an impossible task response
//
// Agent should indicate the task cannot be completed.
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

  const recognized = IMPOSSIBILITY_INDICATORS.some((indicator) =>
    normalized.includes(indicator),
  );

  if (recognized) {
    return {
      passed: true,
      reasoning: "Agent correctly recognized the task as impossible",
      matchType: "semantic",
    };
  }

  return {
    passed: false,
    reasoning: `Agent did not recognize impossibility. Response: "${agentResponse}"`,
    matchType: "failed",
  };
}
