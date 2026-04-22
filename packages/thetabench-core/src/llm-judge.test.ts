import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { judgeRetrieval, judgeImpossibleTask, judgeRetrievalLLM } from "./llm-judge";
import type { RetrievalRubric } from "./tasks/types";

const rubric = (groundTruth: string, ...variations: string[]): RetrievalRubric => ({
  groundTruth,
  acceptableVariations: variations,
});

describe("judgeRetrieval (string matcher)", () => {
  it("passes on exact match", () => {
    const r = judgeRetrieval("29.99", rubric("29.99"));
    expect(r.passed).toBe(true);
    expect(r.matchType).toBe("exact");
  });

  it("passes after whitespace normalization", () => {
    const r = judgeRetrieval("  Hello   World  ", rubric("hello world"));
    expect(r.passed).toBe(true);
    expect(r.matchType).toBe("exact");
  });

  it("is case-insensitive", () => {
    const r = judgeRetrieval("PRODUCTS", rubric("products"));
    expect(r.passed).toBe(true);
  });

  it("passes on acceptable variation exact match", () => {
    const r = judgeRetrieval("$29.99", rubric("29.99", "$29.99", "29.99 USD"));
    expect(r.passed).toBe(true);
    expect(r.matchType).toBe("variation");
  });

  it("passes on substring containment for short ground truth", () => {
    const r = judgeRetrieval("The price is 29.99 dollars", rubric("29.99"));
    expect(r.passed).toBe(true);
    expect(r.matchType).toBe("semantic");
  });

  it("passes on substring containment for long ground truth", () => {
    const r = judgeRetrieval(
      "Yes, the answer is Classic Cotton T-Shirt as listed",
      rubric("Classic Cotton T-Shirt"),
    );
    expect(r.passed).toBe(true);
    expect(r.matchType).toBe("semantic");
  });

  it("passes on acceptable variation containment", () => {
    const r = judgeRetrieval(
      "There are roughly four unfulfilled orders pending",
      rubric("4", "four", "4 orders"),
    );
    expect(r.passed).toBe(true);
    expect(r.matchType).toBe("variation");
  });

  it("fails when response does not contain ground truth", () => {
    const r = judgeRetrieval("I don't know", rubric("29.99"));
    expect(r.passed).toBe(false);
    expect(r.matchType).toBe("failed");
  });

  it("fails when response is empty", () => {
    const r = judgeRetrieval("", rubric("29.99"));
    expect(r.passed).toBe(false);
  });

  it("rejects very-short ground truth (length <= 2) to avoid false positives", () => {
    // ground truth "ok" should not pass on response "broker okay" — length filter
    const r = judgeRetrieval("broker okay", rubric("ok"));
    expect(r.passed).toBe(false);
  });
});

describe("judgeImpossibleTask", () => {
  it.each([
    "This task is not possible",
    "The order cannot be refunded",
    "Already fulfilled",
    "Already been refunded — no action needed",
    "The product does not exist",
    "Unable to complete this request",
  ])("recognizes impossibility phrase: %s", (response) => {
    const r = judgeImpossibleTask(response);
    expect(r.passed).toBe(true);
  });

  it.each([
    "Sure, I'll do it",
    "Done",
    "I refunded the order successfully",
    "",
  ])("rejects positive response: %s", (response) => {
    const r = judgeImpossibleTask(response);
    expect(r.passed).toBe(false);
  });

  it("returns the matched indicator in reasoning", () => {
    const r = judgeImpossibleTask("Sorry — already refunded");
    expect(r.reasoning).toContain("already refunded");
  });
});

describe("judgeRetrievalLLM (fallback behavior)", () => {
  let originalKey: string | undefined;

  beforeEach(() => {
    originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    if (originalKey !== undefined) process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it("falls back to string matcher when ANTHROPIC_API_KEY is absent", async () => {
    const r = await judgeRetrievalLLM("29.99", rubric("29.99"));
    expect(r.passed).toBe(true);
    expect(r.matchType).toBe("exact");
  });

  it("throws when fallback disabled and no API key", async () => {
    await expect(
      judgeRetrievalLLM("29.99", rubric("29.99"), { fallbackToStringMatcher: false }),
    ).rejects.toThrow(/ANTHROPIC_API_KEY/);
  });
});
