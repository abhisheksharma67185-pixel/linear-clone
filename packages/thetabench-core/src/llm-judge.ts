import type { RetrievalRubric } from "./tasks/types"
import type { JudgeResult } from "./types"

export type { JudgeResult }

// ---------------------------------------------------------------------------
// Evaluate a retrieval response against a rubric
// ---------------------------------------------------------------------------

/** Normalize whitespace: collapse internal runs, trim, lowercase. */
function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, " ")
}

export function judgeRetrieval(
  agentResponse: string,
  rubric: RetrievalRubric
): JudgeResult {
  const normalizedResponse = normalize(agentResponse)
  const truth = normalize(rubric.groundTruth)

  // 1. Exact match (after normalization)
  if (normalizedResponse === truth) {
    return {
      passed: true,
      reasoning: `Exact match with ground truth: "${rubric.groundTruth}"`,
      matchType: "exact",
    }
  }

  // 2. Acceptable variations
  for (const variation of rubric.acceptableVariations) {
    if (normalizedResponse === normalize(variation)) {
      return {
        passed: true,
        reasoning: `Matched acceptable variation: "${variation}"`,
        matchType: "variation",
      }
    }
  }

  // 3. Semantic containment — response must contain the ground truth
  //    Use a tiered threshold: short answers need higher ratio, long answers are more lenient
  if (truth.length > 2 && normalizedResponse.includes(truth)) {
    const ratio = truth.length / normalizedResponse.length
    // Short ground truths (numbers, names) need only be present in the response
    // Long ground truths need a reasonable ratio to avoid false positives
    const threshold = truth.length < 10 ? 0.05 : 0.1
    if (ratio > threshold) {
      return {
        passed: true,
        reasoning: `Response contains ground truth: "${rubric.groundTruth}"`,
        matchType: "semantic",
      }
    }
  }

  // 4. Check acceptable variations with containment (not just exact match)
  for (const variation of rubric.acceptableVariations) {
    const normVariation = normalize(variation)
    if (
      normVariation.length > 2 &&
      normalizedResponse.includes(normVariation)
    ) {
      return {
        passed: true,
        reasoning: `Response contains acceptable variation: "${variation}"`,
        matchType: "variation",
      }
    }
  }

  return {
    passed: false,
    reasoning: `Response "${agentResponse}" does not match ground truth "${rubric.groundTruth}"`,
    matchType: "failed",
  }
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
]

export function judgeImpossibleTask(agentResponse: string): JudgeResult {
  const normalized = normalize(agentResponse)

  // Require matching at least one multi-word indicator phrase
  const matchedIndicator = IMPOSSIBILITY_INDICATORS.find((ind) =>
    normalized.includes(ind)
  )

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
      }
}

// ---------------------------------------------------------------------------
// Real LLM judge (Vercel ai-sdk + Anthropic)
//
// Opt-in: requires ANTHROPIC_API_KEY in env. Falls back to deterministic
// `judgeRetrieval` string matcher when no key is set, so default behavior
// stays reproducible.
//
// Use this for retrieval tasks where the string matcher's keyword check
// systematically under-credits semantically correct answers (e.g. paraphrases,
// equivalent units, abbreviations).
// ---------------------------------------------------------------------------

export type LLMJudgeOptions = {
  /** Anthropic model ID. Default: claude-haiku-4-5-20251001 (fast + cheap). */
  model?: string
  /** 0 = deterministic. Default 0. */
  temperature?: number
  /** When no API key or LLM call fails, fall back to string matcher. Default true. */
  fallbackToStringMatcher?: boolean
}

const DEFAULT_LLM_MODEL = "claude-haiku-4-5-20251001"

export async function judgeRetrievalLLM(
  agentResponse: string,
  rubric: RetrievalRubric,
  options: LLMJudgeOptions = {}
): Promise<JudgeResult> {
  const fallback = options.fallbackToStringMatcher !== false

  if (!process.env.ANTHROPIC_API_KEY) {
    if (fallback) return judgeRetrieval(agentResponse, rubric)
    throw new Error(
      "judgeRetrievalLLM requires ANTHROPIC_API_KEY (or set fallbackToStringMatcher: true)"
    )
  }

  // Lazy import so callers without ai-sdk installed at runtime aren't penalized.
  const [{ generateObject }, { anthropic }, { z }] = await Promise.all([
    import("ai"),
    import("@ai-sdk/anthropic"),
    import("zod"),
  ])

  const variations = rubric.acceptableVariations.length
    ? `\nAcceptable variations: ${rubric.acceptableVariations.map((v) => JSON.stringify(v)).join(", ")}`
    : ""

  const prompt = `You are an evaluator for a web-agent benchmark. Judge whether the agent's response correctly answers the retrieval question against the ground truth.

Ground truth: ${JSON.stringify(rubric.groundTruth)}${variations}

Agent response: ${JSON.stringify(agentResponse)}

Pass when the response semantically matches the ground truth or any acceptable variation. Be strict about factual accuracy (numbers, names, identifiers must match), lenient about phrasing (units, abbreviations, surrounding text are fine).`

  try {
    const { object } = await generateObject({
      model: anthropic(options.model ?? DEFAULT_LLM_MODEL),
      temperature: options.temperature ?? 0,
      schema: z.object({
        passed: z.boolean(),
        reasoning: z.string(),
      }),
      prompt,
    })

    return {
      passed: object.passed,
      reasoning: object.reasoning,
      matchType: object.passed ? "semantic" : "failed",
    }
  } catch (err) {
    if (fallback) return judgeRetrieval(agentResponse, rubric)
    throw err
  }
}
