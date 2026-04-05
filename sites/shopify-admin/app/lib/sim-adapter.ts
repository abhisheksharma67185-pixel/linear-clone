/**
 * Shopify site adapter — wires @simbench/core engine to Shopify's store.
 * This file is the bridge between the generic engine and Shopify-specific data.
 *
 * Import this once at app startup to register the adapter + tasks + predicates.
 */

import {
  registerSiteAdapter,
  registerTasks,
  registerPredicate,
  getNestedField,
  type SiteAdapter,
  type GenericSnapshot,
  type EvalCheck,
} from "@simbench/core";

import * as store from "./store";

// Site-specific task definitions
import { navigationTasks } from "./tasks/navigation";
import { productTasks } from "./tasks/products";
import { orderTasks } from "./tasks/orders";
import { customerTasks } from "./tasks/customers";
import { discountTasks } from "./tasks/discounts";
import { settingsTasks } from "./tasks/settings";
import { searchTasks } from "./tasks/search";
import { multiDomainTasks } from "./tasks/multi-domain";
import { retrievalTasks } from "./tasks/retrieval";
import { impossibleTasks } from "./tasks/impossible";

// ---------------------------------------------------------------------------
// 1. Register site adapter
// ---------------------------------------------------------------------------

const shopifyAdapter: SiteAdapter = {
  getState: () => ({
    products: store.getProducts(),
    orders: store.getOrders(),
    customers: store.getCustomers(),
    discounts: store.getDiscounts(),
    settings: store.getSettings(),
  }),

  reset: (seed?: number) => store.reset(seed),

  executeMutation: (name: string, args: unknown[]) => {
    const MUTATION_ALLOWLIST = new Set([
      "createProduct",
      "updateProduct",
      "deleteProduct",
      "fulfillOrder",
      "capturePayment",
      "refundOrder",
      "addOrderNote",
      "createCustomer",
      "updateCustomer",
      "createDiscount",
      "updateDiscount",
      "deleteDiscount",
      "updateSettings",
    ]);
    if (!MUTATION_ALLOWLIST.has(name)) {
      return { success: false, error: `Unknown mutation: ${name}` };
    }
    const fn = (store as unknown as Record<string, (...a: unknown[]) => unknown>)[name];
    if (fn) return fn(...args);
    return { success: false, error: `Mutation not found: ${name}` };
  },

  collections: ["products", "orders", "customers", "discounts"],
  singletons: ["settings"],

  applyConfig: () => {
    // Site-specific config applied via config.ts
  },

  resetConfig: () => {
    // Reset site-specific config
  },
};

registerSiteAdapter(shopifyAdapter);

// ---------------------------------------------------------------------------
// 2. Register all tasks
// ---------------------------------------------------------------------------

registerTasks([
  ...navigationTasks,
  ...productTasks,
  ...orderTasks,
  ...customerTasks,
  ...discountTasks,
  ...settingsTasks,
  ...searchTasks,
  ...multiDomainTasks,
  ...retrievalTasks,
  ...impossibleTasks,
]);

// ---------------------------------------------------------------------------
// 3. Register Shopify-specific predicates
// ---------------------------------------------------------------------------

registerPredicate("product_has_fields", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const expected = check.expected as Record<string, unknown> | undefined;
  if (!expected) return false;
  const products = snapshot.products as { id: string; title?: string }[];
  // Find by ID first, then fall back to title match for newly created products
  let product = check.id ? products?.find((p) => p.id === check.id) : undefined;
  if (!product && expected.title) {
    product = products?.find(
      (p) => p.title?.toLowerCase() === String(expected.title).toLowerCase(),
    );
  }
  if (!product) return false;
  return Object.entries(expected).every(
    ([key, val]) => JSON.stringify(getNestedField(product, key)) === JSON.stringify(val),
  );
});

registerPredicate("product_exists_with_title", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const title = String(check.expected ?? "").toLowerCase();
  const products = snapshot.products as { title: string }[];
  return products?.some((p) => p.title.toLowerCase() === title) ?? false;
});

registerPredicate("order_has_note_containing", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const orders = snapshot.orders as { id: string; timeline: { message: string }[] }[];
  const order = orders?.find((o) => o.id === check.id);
  if (!order) return false;
  const needle = String(check.expected ?? "").toLowerCase();
  return order.timeline.some((t) => t.message.toLowerCase().includes(needle));
});

registerPredicate("order_has_fulfillment_status", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const orders = snapshot.orders as { id: string; fulfillmentStatus: string }[];
  const order = orders?.find((o) => o.id === check.id);
  return order?.fulfillmentStatus === check.expected;
});

registerPredicate("order_has_payment_status", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const orders = snapshot.orders as { id: string; paymentStatus: string }[];
  const order = orders?.find((o) => o.id === check.id);
  return order?.paymentStatus === check.expected;
});

registerPredicate("customer_has_tag", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const customers = snapshot.customers as { id: string; tags: string[] }[];
  const customer = customers?.find((c) => c.id === check.id);
  if (!customer) return false;
  return customer.tags.includes(String(check.expected ?? ""));
});

registerPredicate("discount_exists_with_code", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const code = String(check.expected ?? "").toUpperCase();
  const discounts = snapshot.discounts as { code?: string }[];
  return discounts?.some((d) => d.code?.toUpperCase() === code) ?? false;
});

registerPredicate("discount_has_fields", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const expected = check.expected as Record<string, unknown> | undefined;
  if (!expected) return false;
  const discounts = snapshot.discounts as { id: string; code?: string; title?: string }[];
  let discount = check.id ? discounts?.find((d) => d.id === check.id) : undefined;
  if (!discount && expected.code) {
    discount = discounts?.find(
      (d) => d.code?.toUpperCase() === String(expected.code).toUpperCase(),
    );
  }
  if (!discount && expected.title) {
    discount = discounts?.find(
      (d) => d.title?.toLowerCase() === String(expected.title).toLowerCase(),
    );
  }
  if (!discount) return false;
  return Object.entries(expected).every(
    ([key, val]) => JSON.stringify(getNestedField(discount, key)) === JSON.stringify(val),
  );
});

registerPredicate("all_orders_fulfilled", (snapshot: GenericSnapshot) => {
  const orders = snapshot.orders as { fulfillmentStatus: string }[];
  return orders?.every((o) => o.fulfillmentStatus === "fulfilled") ?? false;
});

registerPredicate("no_pending_payments", (snapshot: GenericSnapshot) => {
  const orders = snapshot.orders as { paymentStatus: string }[];
  return orders?.every((o) => o.paymentStatus !== "pending") ?? false;
});

registerPredicate("product_count_equals", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const products = snapshot.products as unknown[];
  return products?.length === Number(check.expected);
});

registerPredicate("active_product_count_equals", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const products = snapshot.products as { status: string }[];
  return products?.filter((p) => p.status === "active").length === Number(check.expected);
});

registerPredicate("customer_exists_with_email", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const email = String(check.expected ?? "").toLowerCase();
  const customers = snapshot.customers as { email: string }[];
  return customers?.some((c) => c.email.toLowerCase() === email) ?? false;
});

registerPredicate("settings_field_equals", (snapshot: GenericSnapshot, check: EvalCheck) => {
  const val = getNestedField(snapshot.settings, check.field ?? "");
  return JSON.stringify(val) === JSON.stringify(check.expected);
});

// ---------------------------------------------------------------------------
// Export for use in API routes
// ---------------------------------------------------------------------------

export { shopifyAdapter };
