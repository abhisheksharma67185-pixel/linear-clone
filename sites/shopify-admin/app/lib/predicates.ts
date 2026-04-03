import type { StoreSnapshot } from "./snapshot";
import { getNestedField } from "./snapshot";
import type { EvalCheck } from "./tasks/types";

// ---------------------------------------------------------------------------
// Predicate function type
// ---------------------------------------------------------------------------

type PredicateFn = (snapshot: StoreSnapshot, check: EvalCheck) => boolean;

// ---------------------------------------------------------------------------
// Registry — O(1) lookup by name
// ---------------------------------------------------------------------------

const registry = new Map<string, PredicateFn>();

export function registerPredicate(name: string, fn: PredicateFn): void {
  registry.set(name, fn);
}

export function getPredicate(name: string): PredicateFn | undefined {
  return registry.get(name);
}

// ---------------------------------------------------------------------------
// Built-in predicates
// ---------------------------------------------------------------------------

registerPredicate("product_has_fields", (snapshot, check) => {
  const expected = check.expected as Record<string, unknown> | undefined;
  if (!expected) return false;
  const product = snapshot.products.find((p) => p.id === check.id);
  if (!product) return false;
  return Object.entries(expected).every(
    ([key, val]) => JSON.stringify(getNestedField(product, key)) === JSON.stringify(val),
  );
});

registerPredicate("product_exists_with_title", (snapshot, check) => {
  const title = String(check.expected ?? "");
  return snapshot.products.some((p) => p.title.toLowerCase() === title.toLowerCase());
});

registerPredicate("order_has_note_containing", (snapshot, check) => {
  const order = snapshot.orders.find((o) => o.id === check.id);
  if (!order) return false;
  const needle = String(check.expected ?? "").toLowerCase();
  return order.timeline.some((t) => t.message.toLowerCase().includes(needle));
});

registerPredicate("order_has_fulfillment_status", (snapshot, check) => {
  const order = snapshot.orders.find((o) => o.id === check.id);
  if (!order) return false;
  return order.fulfillmentStatus === check.expected;
});

registerPredicate("order_has_payment_status", (snapshot, check) => {
  const order = snapshot.orders.find((o) => o.id === check.id);
  if (!order) return false;
  return order.paymentStatus === check.expected;
});

registerPredicate("customer_has_tag", (snapshot, check) => {
  const customer = snapshot.customers.find((c) => c.id === check.id);
  if (!customer) return false;
  const tag = String(check.expected ?? "");
  return customer.tags.includes(tag);
});

registerPredicate("discount_exists_with_code", (snapshot, check) => {
  const code = String(check.expected ?? "");
  return snapshot.discounts.some((d) => d.code?.toUpperCase() === code.toUpperCase());
});

registerPredicate("all_orders_fulfilled", (snapshot) => {
  return snapshot.orders.every((o) => o.fulfillmentStatus === "fulfilled");
});

registerPredicate("no_pending_payments", (snapshot) => {
  return snapshot.orders.every((o) => o.paymentStatus !== "pending");
});

registerPredicate("product_count_equals", (snapshot, check) => {
  return snapshot.products.length === Number(check.expected);
});

registerPredicate("active_product_count_equals", (snapshot, check) => {
  const active = snapshot.products.filter((p) => p.status === "active");
  return active.length === Number(check.expected);
});

registerPredicate("customer_exists_with_email", (snapshot, check) => {
  const email = String(check.expected ?? "").toLowerCase();
  return snapshot.customers.some((c) => c.email.toLowerCase() === email);
});

registerPredicate("settings_field_equals", (snapshot, check) => {
  const val = getNestedField(snapshot.settings, check.field ?? "");
  return JSON.stringify(val) === JSON.stringify(check.expected);
});
