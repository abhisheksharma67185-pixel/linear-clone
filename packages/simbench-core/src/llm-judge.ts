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

/** Normalize whitespace: collapse internal runs, trim, lowercase. */
function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

export function judgeRetrieval(agentResponse: string, rubric: RetrievalRubric): JudgeResult {
  const normalizedResponse = normalize(agentResponse);
  const truth = normalize(rubric.groundTruth);

  // 1. Exact match (after normalization)
  if (normalizedResponse === truth) {
    return {
      passed: true,
      reasoning: `Exact match with ground truth: "${rubric.groundTruth}"`,
      matchType: "exact",
    };
  }

  // 2. Acceptable variations
  for (const variation of rubric.acceptableVariations) {
    if (normalizedResponse === normalize(variation)) {
      return {
        passed: true,
        reasoning: `Matched acceptable variation: "${variation}"`,
        matchType: "variation",
      };
    }
  }

  // 3. Semantic containment — response must contain the ground truth
  //    AND ground truth must be a significant portion of the response
  //    to prevent false positives from long rambling answers
  if (truth.length > 2 && normalizedResponse.includes(truth)) {
    const ratio = truth.length / normalizedResponse.length;
    if (ratio > 0.15) {
      return {
        passed: true,
        reasoning: `Response contains ground truth: "${rubric.groundTruth}"`,
        matchType: "semantic",
      };
    }
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

/** Phrases that unambiguously indicate the agent recognizes a task cannot be done. */
const IMPOSSIBILITY_INDICATORS = [
  "not possible",
  "cannot be done",
  "cannot be fulfilled",
  "cannot be refunded",
  "cannot be captured",
  "cannot be completed",
  "can't be done",
  "can't be fulfilled",
  "impossible",
  "unable to",
  "already fulfilled",
  "already refunded",
  "already captured",
  "already completed",
  "already been",
  "not available",
  "does not exist",
  "doesn't exist",
  "no such",
  "not found",
  "no action needed",
  "no action required",
  "should not",
  "shouldn't",
  "expired",
  "is not valid",
];

export function judgeImpossibleTask(agentResponse: string): JudgeResult {
  const normalized = normalize(agentResponse);
  const matchedIndicator = IMPOSSIBILITY_INDICATORS.find((ind) => normalized.includes(ind));

  return matchedIndicator
    ? {
        passed: true,
        reasoning: `Agent recognized impossibility (matched: "${matchedIndicator}")`,
        matchType: "semantic",
      }
    : {
        passed: false,
        reasoning: `Agent did not recognize impossibility. Response: "${agentResponse}"`,
        matchType: "failed",
      };
}
