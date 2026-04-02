import { NextRequest, NextResponse } from "next/server";
import * as store from "../../lib/store";

// ---------------------------------------------------------------------------
// Mutable RL session state
// ---------------------------------------------------------------------------

let currentPage = "/admin";
let selectedIds: string[] = [];
let lastAction: string | null = null;
let stepCount = 0;

// ---------------------------------------------------------------------------
// Observation
// ---------------------------------------------------------------------------

function getContextData(): Record<string, unknown> {
  // Return detailed data for the entity currently being viewed
  const match = currentPage.match(/^\/admin\/(products|orders|customers|discounts)\/(\d+)$/);
  if (match) {
    const [, entity, id] = match;
    switch (entity) {
      case "products":
        return { product: store.getProductById(id) ?? null };
      case "orders":
        return { order: store.getOrderById(id) ?? null };
      case "customers":
        return { customer: store.getCustomerById(id) ?? null };
      case "discounts":
        return { discount: store.getDiscountById(id) ?? null };
    }
  }
  return {};
}

function getAvailableActions(): string[] {
  const base = ["navigate", "search", "select"];

  if (currentPage === "/admin/products" || currentPage === "/admin/products/new") {
    return [...base, "create_product"];
  }
  if (currentPage.match(/^\/admin\/products\/\d+$/)) {
    return [...base, "update_product", "delete_product"];
  }
  if (currentPage.match(/^\/admin\/orders\/\d+$/)) {
    const id = currentPage.split("/").pop()!;
    const order = store.getOrderById(id);
    const actions = [...base, "add_order_note"];
    if (order?.fulfillmentStatus !== "fulfilled") actions.push("fulfill_order");
    if (order?.paymentStatus === "pending") actions.push("capture_payment");
    if (order?.paymentStatus === "paid") actions.push("refund_order");
    return actions;
  }
  if (currentPage === "/admin/customers" || currentPage === "/admin/customers/new") {
    return [...base, "create_customer"];
  }
  if (currentPage.match(/^\/admin\/customers\/\d+$/)) {
    return [...base, "update_customer"];
  }
  if (currentPage === "/admin/discounts" || currentPage === "/admin/discounts/new") {
    return [...base, "create_discount"];
  }
  if (currentPage === "/admin/settings") {
    return [...base, "update_settings"];
  }

  return base;
}

function getObservation() {
  const products = store.getProducts();
  const orders = store.getOrders();
  const customers = store.getCustomers();
  const discounts = store.getDiscounts();
  const settings = store.getSettings();

  return {
    currentPage,
    stepCount,
    lastAction,
    selectedIds,
    availableActions: getAvailableActions(),
    currentPageData: getContextData(),
    summary: {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.status === "active").length,
      totalOrders: orders.length,
      unfulfilledOrders: orders.filter((o) => o.fulfillmentStatus === "unfulfilled").length,
      pendingPayments: orders.filter((o) => o.paymentStatus === "pending").length,
      totalCustomers: customers.length,
      activeDiscounts: discounts.filter((d) => d.status === "active").length,
      storeName: settings.storeName,
    },
    data: {
      products: products.map((p) => ({
        id: p.id, title: p.title, status: p.status,
        inventory: p.inventory, price: p.price,
      })),
      orders: orders.map((o) => ({
        id: o.id, orderNumber: o.orderNumber, customer: o.customer,
        total: o.total, paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
      })),
      customers: customers.map((c) => ({
        id: c.id, name: c.name, orders: c.orders, totalSpent: c.totalSpent,
      })),
      discounts: discounts.map((d) => ({
        id: d.id, title: d.title, type: d.type, status: d.status,
        value: d.value, valueType: d.valueType,
      })),
    },
  };
}

// ---------------------------------------------------------------------------
// Reward computation
// ---------------------------------------------------------------------------

function computeReward(action: Record<string, unknown>): number {
  let reward = -0.01; // small step penalty

  switch (action.action) {
    // -- Navigation --
    case "navigate": {
      if (typeof action.target === "string" && action.target !== currentPage) {
        currentPage = action.target;
        reward = 0.0;
      }
      break;
    }

    // -- Search & Select --
    case "search":
      reward = 0.05;
      break;
    case "select":
      if (Array.isArray(action.ids)) {
        selectedIds = action.ids as string[];
        reward = 0.02;
      }
      break;

    // -- Products --
    case "create_product": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createProduct(fields as Parameters<typeof store.createProduct>[0]);
        reward = result.success ? 0.5 : -0.5;
      } else {
        reward = -0.5;
      }
      break;
    }
    case "update_product": {
      const result = store.updateProduct(
        action.productId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateProduct>[1],
      );
      reward = result.success ? 0.5 : -0.5;
      break;
    }
    case "delete_product": {
      const result = store.deleteProduct(action.productId as string);
      reward = result.success ? 0.3 : -0.5;
      break;
    }

    // -- Orders --
    case "fulfill_order": {
      const result = store.fulfillOrder(action.orderId as string);
      reward = result.success ? 1.0 : -0.5;
      break;
    }
    case "capture_payment": {
      const result = store.capturePayment(action.orderId as string);
      reward = result.success ? 1.0 : -0.5;
      break;
    }
    case "refund_order": {
      const result = store.refundOrder(action.orderId as string);
      reward = result.success ? 0.8 : -0.5;
      break;
    }
    case "add_order_note": {
      const result = store.addOrderNote(
        action.orderId as string,
        action.message as string,
      );
      reward = result.success ? 0.1 : -0.5;
      break;
    }

    // -- Customers --
    case "create_customer": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createCustomer(fields as Parameters<typeof store.createCustomer>[0]);
        reward = result.success ? 0.5 : -0.5;
      } else {
        reward = -0.5;
      }
      break;
    }
    case "update_customer": {
      const result = store.updateCustomer(
        action.customerId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateCustomer>[1],
      );
      reward = result.success ? 0.3 : -0.5;
      break;
    }

    // -- Discounts --
    case "create_discount": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createDiscount(fields as Parameters<typeof store.createDiscount>[0]);
        reward = result.success ? 0.5 : -0.5;
      } else {
        reward = -0.5;
      }
      break;
    }

    // -- Settings --
    case "update_settings": {
      const result = store.updateSettings(
        (action.fields ?? {}) as Parameters<typeof store.updateSettings>[0],
      );
      reward = result.success ? 0.3 : -0.5;
      break;
    }

    default:
      reward = -0.1;
  }

  return reward;
}

// ---------------------------------------------------------------------------
// HTTP handlers
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({
    observation: getObservation(),
    info: {
      description: "Shopify Admin RL Environment",
      version: "2.0",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = body as Record<string, unknown>;

  stepCount++;
  lastAction = action.action as string;
  const reward = computeReward(action);
  const observation = getObservation();

  // Episode done when all orders fulfilled and all payments captured
  const orders = store.getOrders();
  const done =
    orders.filter((o) => o.fulfillmentStatus === "unfulfilled").length === 0 &&
    orders.filter((o) => o.paymentStatus === "pending").length === 0;

  return NextResponse.json({
    observation,
    reward,
    done,
    info: { stepCount, lastAction: action.action },
  });
}
