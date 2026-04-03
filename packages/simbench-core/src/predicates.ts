import type { GenericSnapshot } from "./snapshot";
import { getNestedField } from "./snapshot";
import type { EvalCheck } from "./tasks/types";

// ---------------------------------------------------------------------------
// Generic predicate system — sites register their own predicates
// ---------------------------------------------------------------------------

type PredicateFn = (snapshot: GenericSnapshot, check: EvalCheck) => boolean;

const registry = new Map<string, PredicateFn>();

export function registerPredicate(name: string, fn: PredicateFn): void {
  registry.set(name, fn);
}

export function getPredicate(name: string): PredicateFn | undefined {
  return registry.get(name);
}

export function clearPredicates(): void {
  registry.clear();
}

// ---------------------------------------------------------------------------
// Built-in generic predicates (work with any site)
// ---------------------------------------------------------------------------

registerPredicate("field_equals", (snapshot, check) => {
  if (!check.entity || !check.field) return false;
  const collection = snapshot[check.entity];

  if (Array.isArray(collection)) {
    const item = (collection as { id: string }[]).find((e) => e.id === check.id);
    if (!item) return false;
    const val = getNestedField(item, check.field);
    return JSON.stringify(val) === JSON.stringify(check.expected);
  }

  // Singleton entity (e.g. settings)
  const val = getNestedField(collection, check.field);
  return JSON.stringify(val) === JSON.stringify(check.expected);
});

registerPredicate("entity_exists_with_field", (snapshot, check) => {
  if (!check.entity || !check.field) return false;
  const collection = snapshot[check.entity];
  if (!Array.isArray(collection)) return false;
  return (collection as Record<string, unknown>[]).some(
    (item) => JSON.stringify(getNestedField(item, check.field!)) === JSON.stringify(check.expected),
  );
});

registerPredicate("collection_count_equals", (snapshot, check) => {
  if (!check.entity) return false;
  const collection = snapshot[check.entity];
  if (!Array.isArray(collection)) return false;
  return collection.length === Number(check.expected);
});
