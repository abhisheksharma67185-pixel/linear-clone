import type { TaskDefinition, EvalCheck } from "./tasks/types";
import type { GenericSnapshot } from "./snapshot";
import type { StateDiff, EvalResult, CheckResult } from "./types";
import { getNestedField } from "./snapshot";
import { getPredicate } from "./predicates";

// ---------------------------------------------------------------------------
// Evaluate a task against initial and final snapshots
// ---------------------------------------------------------------------------

export function evaluate(
  task: TaskDefinition,
  _initial: GenericSnapshot, // eslint-disable-line @typescript-eslint/no-unused-vars
  final: GenericSnapshot,
  _diff: StateDiff, // eslint-disable-line @typescript-eslint/no-unused-vars
): EvalResult {
  const results: CheckResult[] = [];

  for (const check of task.evalChecks) {
    results.push(evaluateCheck(check, final));
  }

  const totalWeight = results.reduce((sum, r) => sum + (r.weight ?? 1), 0);
  const earnedWeight = results.filter((r) => r.passed).reduce((sum, r) => sum + (r.weight ?? 1), 0);

  return {
    score: totalWeight > 0 ? earnedWeight / totalWeight : 0,
    checks: results,
    passed: results.filter((r) => r.passed).length,
    total: results.length,
  };
}

// ---------------------------------------------------------------------------
// Individual check evaluation
// ---------------------------------------------------------------------------

function evaluateCheck(check: EvalCheck, final: GenericSnapshot): CheckResult {
  switch (check.type) {
    case "state_diff":
      return evaluateStateDiff(check, final);
    case "state_exists":
      return evaluateStateExists(check, final);
    case "state_absent":
      return evaluateStateAbsent(check, final);
    case "state_count":
      return evaluateStateCount(check, final);
    case "state_predicate":
      return evaluateStatePredicate(check, final);
    case "retrieval":
      return {
        passed: false,
        message: "Retrieval checks evaluated separately via LLM judge",
        weight: check.weight,
      };
  }
}

function evaluateStateDiff(check: EvalCheck, final: GenericSnapshot): CheckResult {
  const collection = final[check.entity!];
  let actual: unknown;

  if (Array.isArray(collection)) {
    const item = (collection as { id: string }[]).find((e) => e.id === check.id);
    actual = item ? getNestedField(item, check.field!) : undefined;
  } else if (collection && typeof collection === "object") {
    actual = getNestedField(collection, check.field!);
  }

  const passed = JSON.stringify(actual) === JSON.stringify(check.expected);
  return {
    passed,
    actual,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: expected ${JSON.stringify(check.expected)}, got ${JSON.stringify(actual)}`,
    weight: check.weight,
  };
}

function evaluateStateExists(check: EvalCheck, final: GenericSnapshot): CheckResult {
  const collection = final[check.entity!];
  let passed = false;

  if (Array.isArray(collection)) {
    passed = (collection as Record<string, unknown>[]).some(
      (item) =>
        JSON.stringify(getNestedField(item, check.field!)) === JSON.stringify(check.expected),
    );
  }

  return {
    passed,
    message: passed ? `PASS: ${check.description}` : `FAIL: ${check.description}`,
    weight: check.weight,
  };
}

function evaluateStateAbsent(check: EvalCheck, final: GenericSnapshot): CheckResult {
  const collection = final[check.entity!];
  let passed = true;

  if (Array.isArray(collection)) {
    passed = !(collection as { id: string }[]).some((e) => e.id === check.id);
  }

  return {
    passed,
    message: passed ? `PASS: ${check.description}` : `FAIL: ${check.description}`,
    weight: check.weight,
  };
}

function evaluateStateCount(check: EvalCheck, final: GenericSnapshot): CheckResult {
  const collection = final[check.entity!];
  let actual: unknown;
  let passed = false;

  if (Array.isArray(collection)) {
    actual = collection.length;
    passed = collection.length === check.expected;
  }

  return {
    passed,
    actual,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: count=${String(actual)}, expected=${String(check.expected)}`,
    weight: check.weight,
  };
}

function evaluateStatePredicate(check: EvalCheck, final: GenericSnapshot): CheckResult {
  const fn = getPredicate(check.predicate!);
  const passed = fn ? fn(final, check) : false;

  return {
    passed,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: ${check.description} (predicate: ${check.predicate})`,
    weight: check.weight,
  };
}
