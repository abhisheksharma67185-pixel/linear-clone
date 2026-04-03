import type { TaskDefinition, EvalCheck } from "./tasks/types";
import type { StoreSnapshot, StateDiff } from "./snapshot";
import { getNestedField } from "./snapshot";
import { getPredicate } from "./predicates";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface CheckResult {
  check: EvalCheck;
  passed: boolean;
  actual?: unknown;
  message: string;
}

export interface EvalResult {
  score: number;
  checks: CheckResult[];
  passed: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Evaluate a task against initial and final snapshots
// ---------------------------------------------------------------------------

export function evaluate(
  task: TaskDefinition,
  _initial: StoreSnapshot,
  final: StoreSnapshot,
  _diff: StateDiff, // eslint-disable-line @typescript-eslint/no-unused-vars -- reserved for future diff-based checks
): EvalResult {
  const results: CheckResult[] = [];

  for (const check of task.evalChecks) {
    const result = evaluateCheck(check, final);
    results.push(result);
  }

  const totalWeight = results.reduce((sum, r) => sum + r.check.weight, 0);
  const earnedWeight = results
    .filter((r) => r.passed)
    .reduce((sum, r) => sum + r.check.weight, 0);

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

function evaluateCheck(
  check: EvalCheck,
  final: StoreSnapshot,
): CheckResult {
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
        check,
        passed: false,
        message: "Retrieval checks evaluated separately via LLM judge",
      };
  }
}

function evaluateStateDiff(
  check: EvalCheck,
  final: StoreSnapshot,
): CheckResult {
  const collection = final[check.entity as keyof StoreSnapshot];
  let actual: unknown;

  if (Array.isArray(collection)) {
    const item = (collection as { id: string }[]).find(
      (e) => e.id === check.id,
    );
    actual = item ? getNestedField(item, check.field!) : undefined;
  } else if (check.entity === "settings") {
    actual = getNestedField(collection, check.field!);
  }

  const passed =
    JSON.stringify(actual) === JSON.stringify(check.expected);

  return {
    check,
    passed,
    actual,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: expected ${JSON.stringify(check.expected)}, got ${JSON.stringify(actual)}`,
  };
}

function evaluateStateExists(
  check: EvalCheck,
  final: StoreSnapshot,
): CheckResult {
  const collection = final[check.entity as keyof StoreSnapshot];
  let passed = false;

  if (Array.isArray(collection)) {
    passed = (collection as Record<string, unknown>[]).some((item) => {
      const val = getNestedField(item, check.field!);
      return JSON.stringify(val) === JSON.stringify(check.expected);
    });
  }

  return {
    check,
    passed,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: ${check.description}`,
  };
}

function evaluateStateAbsent(
  check: EvalCheck,
  final: StoreSnapshot,
): CheckResult {
  const collection = final[check.entity as keyof StoreSnapshot];
  let passed = true;

  if (Array.isArray(collection)) {
    const exists = (collection as { id: string }[]).some(
      (e) => e.id === check.id,
    );
    passed = !exists;
  }

  return {
    check,
    passed,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: ${check.description}`,
  };
}

function evaluateStateCount(
  check: EvalCheck,
  final: StoreSnapshot,
): CheckResult {
  const collection = final[check.entity as keyof StoreSnapshot];
  let actual: unknown;
  let passed = false;

  if (Array.isArray(collection)) {
    actual = collection.length;
    passed = collection.length === check.expected;
  }

  return {
    check,
    passed,
    actual,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: count=${actual}, expected=${check.expected}`,
  };
}

function evaluateStatePredicate(
  check: EvalCheck,
  final: StoreSnapshot,
): CheckResult {
  const fn = getPredicate(check.predicate!);
  const passed = fn ? fn(final, check) : false;

  return {
    check,
    passed,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: ${check.description} (predicate: ${check.predicate})`,
  };
}
