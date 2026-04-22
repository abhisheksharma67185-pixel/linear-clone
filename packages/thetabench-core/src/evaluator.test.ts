import { describe, it, expect, beforeEach } from "vitest";
import { evaluate } from "./evaluator";
import { registerPredicate, clearPredicates } from "./predicates";
import type { TaskDefinition, EvalCheck } from "./tasks/types";
import type { GenericSnapshot } from "./snapshot";
import type { StateDiff } from "./types";

const emptyDiff: StateDiff = { added: [], removed: [], modified: [] };

const task = (evalChecks: EvalCheck[]): TaskDefinition => ({
  id: "t1",
  site: "test-site",
  domain: "products",
  type: "action",
  difficulty: "easy",
  curriculumStage: 1,
  title: "T",
  goal: "do thing",
  maxSteps: 10,
  tags: [],
  evalChecks,
});

const snap = (data: Record<string, unknown>): GenericSnapshot => ({
  capturedAt: new Date().toISOString(),
  ...data,
});

describe("evaluate (state_diff)", () => {
  it("passes when actual matches expected", () => {
    const t = task([
      {
        type: "state_diff",
        description: "price updated",
        entity: "products",
        id: "1",
        field: "price",
        expected: "34.99",
      },
    ]);
    const initial = snap({ products: [{ id: "1", price: "29.99" }] });
    const final = snap({ products: [{ id: "1", price: "34.99" }] });
    const result = evaluate(t, initial, final, emptyDiff);
    expect(result.passed).toBe(1);
    expect(result.score).toBe(1);
    expect(result.checks[0].passed).toBe(true);
  });

  it("fails and includes initial value in failure message", () => {
    const t = task([
      {
        type: "state_diff",
        description: "price updated",
        entity: "products",
        id: "1",
        field: "price",
        expected: "34.99",
      },
    ]);
    const initial = snap({ products: [{ id: "1", price: "29.99" }] });
    const final = snap({ products: [{ id: "1", price: "29.99" }] });
    const result = evaluate(t, initial, final, emptyDiff);
    expect(result.passed).toBe(0);
    expect(result.score).toBe(0);
    expect(result.checks[0].message).toContain("29.99");
  });

  it("uses deep equality for object expected values", () => {
    const t = task([
      {
        type: "state_diff",
        description: "tags match",
        entity: "products",
        id: "1",
        field: "tags",
        expected: ["a", "b"],
      },
    ]);
    const initial = snap({ products: [{ id: "1", tags: [] }] });
    const final = snap({ products: [{ id: "1", tags: ["a", "b"] }] });
    expect(evaluate(t, initial, final, emptyDiff).passed).toBe(1);
  });
});

describe("evaluate (state_exists)", () => {
  it("passes when an item with the matching field value exists", () => {
    const t = task([
      {
        type: "state_exists",
        description: "a tagged item exists",
        entity: "products",
        field: "status",
        expected: "active",
      },
    ]);
    const final = snap({
      products: [
        { id: "1", status: "draft" },
        { id: "2", status: "active" },
      ],
    });
    expect(evaluate(t, snap({}), final, emptyDiff).passed).toBe(1);
  });

  it("fails when no item matches", () => {
    const t = task([
      {
        type: "state_exists",
        description: "an active item exists",
        entity: "products",
        field: "status",
        expected: "active",
      },
    ]);
    const final = snap({ products: [{ id: "1", status: "draft" }] });
    expect(evaluate(t, snap({}), final, emptyDiff).passed).toBe(0);
  });
});

describe("evaluate (state_absent)", () => {
  it("passes when the id is not in the collection", () => {
    const t = task([
      {
        type: "state_absent",
        description: "product 99 deleted",
        entity: "products",
        id: "99",
      },
    ]);
    const final = snap({ products: [{ id: "1" }] });
    expect(evaluate(t, snap({}), final, emptyDiff).passed).toBe(1);
  });

  it("fails when the id is still present", () => {
    const t = task([
      {
        type: "state_absent",
        description: "product 1 deleted",
        entity: "products",
        id: "1",
      },
    ]);
    const final = snap({ products: [{ id: "1" }] });
    expect(evaluate(t, snap({}), final, emptyDiff).passed).toBe(0);
  });
});

describe("evaluate (state_count)", () => {
  it("passes when count matches", () => {
    const t = task([
      {
        type: "state_count",
        description: "exactly 3 products",
        entity: "products",
        expected: 3,
      },
    ]);
    const final = snap({ products: [{ id: "1" }, { id: "2" }, { id: "3" }] });
    expect(evaluate(t, snap({}), final, emptyDiff).passed).toBe(1);
  });

  it("fails when count differs", () => {
    const t = task([
      {
        type: "state_count",
        description: "exactly 3 products",
        entity: "products",
        expected: 3,
      },
    ]);
    const final = snap({ products: [{ id: "1" }] });
    expect(evaluate(t, snap({}), final, emptyDiff).passed).toBe(0);
  });
});

describe("evaluate (state_predicate)", () => {
  beforeEach(() => clearPredicates());

  it("uses registered predicate", () => {
    registerPredicate("hasActiveProduct", (state) => {
      const products = state.products as { status: string }[];
      return products.some((p) => p.status === "active");
    });
    const t = task([
      {
        type: "state_predicate",
        description: "at least one active product",
        predicate: "hasActiveProduct",
      },
    ]);
    const final = snap({ products: [{ id: "1", status: "active" }] });
    expect(evaluate(t, snap({}), final, emptyDiff).passed).toBe(1);
  });

  it("fails gracefully when predicate is not registered", () => {
    const t = task([
      {
        type: "state_predicate",
        description: "ghost predicate",
        predicate: "nonexistent",
      },
    ]);
    const result = evaluate(t, snap({}), snap({}), emptyDiff);
    expect(result.passed).toBe(0);
    expect(result.checks[0].message).toContain("not registered");
  });
});

describe("evaluate (weighted scoring)", () => {
  it("computes weighted average across mixed pass/fail checks", () => {
    const t = task([
      {
        type: "state_count",
        description: "weight 3",
        entity: "products",
        expected: 1,
        weight: 3,
      },
      {
        type: "state_count",
        description: "weight 1",
        entity: "products",
        expected: 99,
        weight: 1,
      },
    ]);
    const final = snap({ products: [{ id: "1" }] });
    const result = evaluate(t, snap({}), final, emptyDiff);
    // pass: weight 3 (out of 4) → score 0.75
    expect(result.score).toBeCloseTo(0.75);
    expect(result.passed).toBe(1);
    expect(result.total).toBe(2);
  });
});
