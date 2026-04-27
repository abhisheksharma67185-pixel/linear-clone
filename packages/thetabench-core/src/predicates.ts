import type { GenericSnapshot } from "./snapshot"
import type { EvalCheck } from "./tasks/types"
import { defaultEngine } from "./sim-engine"

// ---------------------------------------------------------------------------
// Predicate system — thin shims around `defaultEngine`. Built-in predicates
// (`field_equals`, `entity_exists_with_field`, `collection_count_equals`) are
// registered by the SimEngine constructor.
// ---------------------------------------------------------------------------

type PredicateFn = (snapshot: GenericSnapshot, check: EvalCheck) => boolean

export function registerPredicate(name: string, fn: PredicateFn): void {
  defaultEngine.registerPredicate(name, fn)
}

export function getPredicate(name: string): PredicateFn | undefined {
  return defaultEngine.getPredicate(name)
}

export function clearPredicates(): void {
  defaultEngine.clearPredicates()
}
