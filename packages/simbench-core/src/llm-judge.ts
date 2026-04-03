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
  //    Use a tiered threshold: short answers need higher ratio, long answers are more lenient
  if (truth.length > 2 && normalizedResponse.includes(truth)) {
    const ratio = truth.length / normalizedResponse.length;
    // Short ground truths (numbers, names) need only be present in the response
    // Long ground truths need a reasonable ratio to avoid false positives
    const threshold = truth.length < 10 ? 0.05 : 0.1;
    if (ratio > threshold) {
      return {
        passed: true,
        reasoning: `Response contains ground truth: "${rubric.groundTruth}"`,
        matchType: "semantic",
      };
    }
  }

  // 4. Check acceptable variations with containment (not just exact match)
  for (const variation of rubric.acceptableVariations) {
    const normVariation = normalize(variation);
    if (normVariation.length > 2 && normalizedResponse.includes(normVariation)) {
      return {
        passed: true,
        reasoning: `Response contains acceptable variation: "${variation}"`,
        matchType: "variation",
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

/**
 * Multi-word phrases that unambiguously indicate the agent recognizes a task cannot be done.
 * Each phrase must be 2+ words to reduce false positives from coincidental substring matches.
 */
const IMPOSSIBILITY_INDICATORS = [
  "not possible",
  "cannot be done",
  "cannot be fulfilled",
  "cannot be refunded",
  "cannot be captured",
  "cannot be completed",
  "can't be done",
  "can't be fulfilled",
  "can't be refunded",
  "can't be captured",
  "unable to complete",
  "unable to fulfill",
  "unable to refund",
  "unable to capture",
  "unable to process",
  "already fulfilled",
  "already refunded",
  "already captured",
  "already completed",
  "already been fulfilled",
  "already been refunded",
  "already been captured",
  "already paid",
  "does not exist",
  "doesn't exist",
  "not found",
  "no such product",
  "no such order",
  "no such customer",
  "no action needed",
  "no action required",
  "task is impossible",
  "this is impossible",
  "not a valid",
  "has expired",
  "is expired",
  "payment is pending",
  "payment pending",
];

export function judgeImpossibleTask(agentResponse: string): JudgeResult {
  const normalized = normalize(agentResponse);

  // Require matching at least one multi-word indicator phrase
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
