import * as store from "./store";

// ---------------------------------------------------------------------------
// SitePlugin interface implementation for Shopify Admin
//
// This is the contract that every SimBench site must implement.
// The core engine uses this to manage episodes, snapshots, and evaluation
// without knowing anything about Shopify-specific types.
// ---------------------------------------------------------------------------

export interface MutationDefinition {
  name: string;
  description: string;
  params: Record<string, string>;
}

export interface MutationResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface ConfigSchema {
  universal: Record<string, { type: string; default: unknown; description: string }>;
  site: Record<string, { type: string; default: unknown; description: string }>;
}

export interface SitePlugin {
  id: string;
  name: string;
  category: string;
  version: string;
  getState(): Record<string, unknown>;
  setState(state: Record<string, unknown>): void;
  reset(seed?: number): void;
  getMutations(): MutationDefinition[];
  executeMutation(name: string, args: unknown): MutationResult;
  getConfigSchema(): ConfigSchema;
  applyConfig(config: Record<string, unknown>): void;
}

// ---------------------------------------------------------------------------
// Shopify Admin plugin
// ---------------------------------------------------------------------------

export const shopifyAdminPlugin: SitePlugin = {
  id: "shopify-admin",
  name: "Shopify Admin Dashboard",
  category: "e-commerce-admin",
  version: "1.0.0",

  getState() {
    return {
      products: store.getProducts(),
      orders: store.getOrders(),
      customers: store.getCustomers(),
      discounts: store.getDiscounts(),
      settings: store.getSettings(),
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setState(_state: Record<string, unknown>) {
    // Not implemented — use mutations instead
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reset(_seed?: number) {
    store.reset();
  },

  getMutations(): MutationDefinition[] {
    return [
      {
        name: "createProduct",
        description: "Create a new product",
        params: { title: "string", price: "string", status: "string" },
      },
      {
        name: "updateProduct",
        description: "Update an existing product",
        params: { id: "string", fields: "object" },
      },
      { name: "deleteProduct", description: "Delete a product", params: { id: "string" } },
      { name: "fulfillOrder", description: "Fulfill an order", params: { id: "string" } },
      {
        name: "capturePayment",
        description: "Capture a pending payment",
        params: { id: "string" },
      },
      { name: "refundOrder", description: "Refund a paid order", params: { id: "string" } },
      {
        name: "addOrderNote",
        description: "Add a note to an order",
        params: { id: "string", message: "string" },
      },
      {
        name: "createCustomer",
        description: "Create a new customer",
        params: { firstName: "string", lastName: "string", email: "string" },
      },
      {
        name: "updateCustomer",
        description: "Update a customer",
        params: { id: "string", fields: "object" },
      },
      {
        name: "createDiscount",
        description: "Create a discount",
        params: { title: "string", type: "string", value: "string" },
      },
      {
        name: "updateDiscount",
        description: "Update a discount",
        params: { id: "string", fields: "object" },
      },
      { name: "deleteDiscount", description: "Delete a discount", params: { id: "string" } },
      {
        name: "updateSettings",
        description: "Update store settings",
        params: { fields: "object" },
      },
    ];
  },

  executeMutation(name: string, args: unknown): MutationResult {
    const a = args as Record<string, unknown>;

    switch (name) {
      case "createProduct":
        return store.createProduct(a as Parameters<typeof store.createProduct>[0]);
      case "updateProduct":
        return store.updateProduct(
          a.id as string,
          a.fields as Parameters<typeof store.updateProduct>[1],
        );
      case "deleteProduct":
        return store.deleteProduct(a.id as string);
      case "fulfillOrder":
        return store.fulfillOrder(a.id as string);
      case "capturePayment":
        return store.capturePayment(a.id as string);
      case "refundOrder":
        return store.refundOrder(a.id as string);
      case "addOrderNote":
        return store.addOrderNote(a.id as string, a.message as string);
      case "createCustomer":
        return store.createCustomer(a as Parameters<typeof store.createCustomer>[0]);
      case "updateCustomer":
        return store.updateCustomer(
          a.id as string,
          a.fields as Parameters<typeof store.updateCustomer>[1],
        );
      case "createDiscount":
        return store.createDiscount(a as Parameters<typeof store.createDiscount>[0]);
      case "updateDiscount":
        return store.updateDiscount(
          a.id as string,
          a.fields as Parameters<typeof store.updateDiscount>[1],
        );
      case "deleteDiscount":
        return store.deleteDiscount(a.id as string);
      case "updateSettings":
        return store.updateSettings(a.fields as Parameters<typeof store.updateSettings>[0]);
      default:
        return { success: false, error: `Unknown mutation: ${name}` };
    }
  },

  getConfigSchema(): ConfigSchema {
    return {
      universal: {
        latency: { type: "number", default: 0, description: "Simulated network delay (ms)" },
        hideAriaLabels: { type: "boolean", default: false, description: "Remove ARIA attributes" },
        errorRate: { type: "number", default: 0, description: "Random action failure rate (0-1)" },
        dateOverride: { type: "string", default: "", description: "Lock current date (ISO)" },
        locale: { type: "string", default: "en-US", description: "Locale" },
      },
      site: {
        outOfStockProducts: {
          type: "string[]",
          default: [],
          description: "Product IDs with zero inventory",
        },
        paymentFailureRate: {
          type: "number",
          default: 0,
          description: "Payment capture failure rate",
        },
        discountExpired: {
          type: "boolean",
          default: false,
          description: "Force all discounts expired",
        },
        highTrafficMode: {
          type: "boolean",
          default: false,
          description: "Show high traffic warnings",
        },
      },
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applyConfig(_config: Record<string, unknown>) {
    // Config is applied via the config.ts module
  },
};
