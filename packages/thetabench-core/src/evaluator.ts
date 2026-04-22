import type { TaskDefinition, EvalCheck } from "./tasks/types"
import type { GenericSnapshot } from "./snapshot"
import type { StateDiff, EvalResult, CheckResult } from "./types"
import { getNestedField } from "./snapshot"
import { getPredicate } from "./predicates"

/** Order-independent deep equality using sorted JSON keys */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a !== "object") return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((v, i) => deepEqual(v, b[i]))
  }
  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const aKeys = Object.keys(aObj).sort()
  const bKeys = Object.keys(bObj).sort()
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every(
    (key, i) => key === bKeys[i] && deepEqual(aObj[key], bObj[key])
  )
}

// ---------------------------------------------------------------------------
// Evaluate a task against initial and final snapshots
// ---------------------------------------------------------------------------

export function evaluate(
  task: TaskDefinition,
  initial: GenericSnapshot,
  final: GenericSnapshot,
  diff: StateDiff
): EvalResult {
  const results: CheckResult[] = []

  for (const check of task.evalChecks) {
    results.push(evaluateCheck(check, final, initial, diff))
  }

  const totalWeight = results.reduce((sum, r) => sum + (r.weight ?? 1), 0)
  const earnedWeight = results
    .filter((r) => r.passed)
    .reduce((sum, r) => sum + (r.weight ?? 1), 0)

  return {
    score: totalWeight > 0 ? earnedWeight / totalWeight : 0,
    checks: results,
    passed: results.filter((r) => r.passed).length,
    total: results.length,
  }
}

// ---------------------------------------------------------------------------
// Individual check evaluation
// ---------------------------------------------------------------------------

function evaluateCheck(
  check: EvalCheck,
  final: GenericSnapshot,
  initial: GenericSnapshot,
  _diff: StateDiff
): CheckResult {
  switch (check.type) {
    case "state_diff":
      return evaluateStateDiff(check, final, initial)
    case "state_exists":
      return evaluateStateExists(check, final)
    case "state_absent":
      return evaluateStateAbsent(check, final)
    case "state_count":
      return evaluateStateCount(check, final)
    case "state_predicate":
      return evaluateStatePredicate(check, final)
    case "retrieval":
      return {
        passed: false,
        message: "Retrieval checks evaluated separately via LLM judge",
        weight: check.weight,
      }
  }
}

function evaluateStateDiff(
  check: EvalCheck,
  final: GenericSnapshot,
  initial: GenericSnapshot
): CheckResult {
  if (!check.entity || !check.field) {
    return {
      passed: false,
      message: `FAIL: state_diff check missing required entity or field: ${check.description}`,
      weight: check.weight,
    }
  }

  const collection = final[check.entity]
  let actual: unknown

  if (Array.isArray(collection)) {
    const item = (collection as { id: string }[]).find((e) => e.id === check.id)
    actual = item ? getNestedField(item, check.field) : undefined
  } else if (collection && typeof collection === "object") {
    actual = getNestedField(collection, check.field)
  }

  const passed = deepEqual(actual, check.expected)

  // Include initial value in message for debugging
  let initialValue: unknown
  if (check.id) {
    const initialCollection = initial[check.entity]
    if (Array.isArray(initialCollection)) {
      const initialItem = (initialCollection as { id: string }[]).find(
        (e) => e.id === check.id
      )
      initialValue = initialItem
        ? getNestedField(initialItem, check.field)
        : undefined
    } else if (initialCollection && typeof initialCollection === "object") {
      initialValue = getNestedField(initialCollection, check.field)
    }
  }

  return {
    passed,
    actual,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: expected ${JSON.stringify(check.expected)}, got ${JSON.stringify(actual)} (was ${JSON.stringify(initialValue)})`,
    weight: check.weight,
  }
}

function evaluateStateExists(
  check: EvalCheck,
  final: GenericSnapshot
): CheckResult {
  if (!check.entity || !check.field) {
    return {
      passed: false,
      message: `FAIL: state_exists check missing required entity or field: ${check.description}`,
      weight: check.weight,
    }
  }

  const collection = final[check.entity]
  let passed = false

  if (Array.isArray(collection)) {
    passed = (collection as Record<string, unknown>[]).some((item) =>
      deepEqual(getNestedField(item, check.field!), check.expected)
    )
  }

  return {
    passed,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: ${check.description}`,
    weight: check.weight,
  }
}

function evaluateStateAbsent(
  check: EvalCheck,
  final: GenericSnapshot
): CheckResult {
  if (!check.entity) {
    return {
      passed: false,
      message: `FAIL: state_absent check missing required entity: ${check.description}`,
      weight: check.weight,
    }
  }

  const collection = final[check.entity]

  if (!Array.isArray(collection)) {
    return {
      passed: false,
      message: `FAIL: collection "${check.entity}" not found or not an array`,
      weight: check.weight,
    }
  }

  const passed = !(collection as { id: string }[]).some(
    (e) => e.id === check.id
  )

  return {
    passed,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: ${check.description}`,
    weight: check.weight,
  }
}

function evaluateStateCount(
  check: EvalCheck,
  final: GenericSnapshot
): CheckResult {
  if (!check.entity) {
    return {
      passed: false,
      message: `FAIL: state_count check missing required entity: ${check.description}`,
      weight: check.weight,
    }
  }

  const collection = final[check.entity]
  let actual: unknown
  let passed = false

  if (Array.isArray(collection)) {
    actual = collection.length
    passed = collection.length === Number(check.expected)
  }

  return {
    passed,
    actual,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: count=${String(actual)}, expected=${String(check.expected)}`,
    weight: check.weight,
  }
}

function evaluateStatePredicate(
  check: EvalCheck,
  final: GenericSnapshot
): CheckResult {
  const fn = getPredicate(check.predicate!)
  if (!fn) {
    return {
      passed: false,
      message: `FAIL: predicate "${check.predicate}" not registered`,
      weight: check.weight,
    }
  }
  const passed = fn(final, check)

  return {
    passed,
    message: passed
      ? `PASS: ${check.description}`
      : `FAIL: ${check.description} (predicate: ${check.predicate})`,
    weight: check.weight,
  }
}
