// AUTH: Intentionally omitted — this route is designed for local benchmark/sim use only.
import { NextRequest, NextResponse } from "next/server";
import * as store from "../../lib/store";
import "../../lib/init-sim";
import { getActiveEpisode, hasActiveEpisode, logAction, getStepReward } from "@thetabench/core";

// ---------------------------------------------------------------------------
// Per-episode RL session state (isolated by episode, not module-level)
// ---------------------------------------------------------------------------

interface RLSessionState {
  currentPage: string;
  selectedIds: string[];
  lastAction: string | null;
  stepCount: number;
}

let _rlState: RLSessionState = {
  currentPage: "/admin",
  selectedIds: [],
  lastAction: null,
  stepCount: 0,
};

export function resetRLState(): void {
  _rlState = {
    currentPage: "/admin",
    selectedIds: [],
    lastAction: null,
    stepCount: 0,
  };
}

// ---------------------------------------------------------------------------
// Observation
// ---------------------------------------------------------------------------

function getContextData(): Record<string, unknown> {
  const match = _rlState.currentPage.match(/^\/admin\/(products|orders|customers|discounts)\/(\d+)$/);
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

  if (_rlState.currentPage === "/admin/products" || _rlState.currentPage === "/admin/products/new") {
    return [...base, "create_product"];
  }
  if (_rlState.currentPage.match(/^\/admin\/products\/\d+$/)) {
    return [...base, "update_product", "delete_product"];
  }
  if (_rlState.currentPage.match(/^\/admin\/orders\/\d+$/)) {
    const id = _rlState.currentPage.split("/").pop()!;
    const order = store.getOrderById(id);
    const actions = [...base, "add_order_note"];
    if (order?.fulfillmentStatus !== "fulfilled") actions.push("fulfill_order");
    if (order?.paymentStatus === "pending") actions.push("capture_payment");
    if (order?.paymentStatus === "paid") actions.push("refund_order");
    return actions;
  }
  if (_rlState.currentPage === "/admin/customers" || _rlState.currentPage === "/admin/customers/new") {
    return [...base, "create_customer"];
  }
  if (_rlState.currentPage.match(/^\/admin\/customers\/\d+$/)) {
    return [...base, "update_customer"];
  }
  if (_rlState.currentPage === "/admin/discounts" || _rlState.currentPage === "/admin/discounts/new") {
    return [...base, "create_discount"];
  }
  if (_rlState.currentPage.match(/^\/admin\/discounts\/\d+$/)) {
    return [...base, "update_discount", "delete_discount"];
  }
  if (_rlState.currentPage === "/admin/settings") {
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

  const episode = getActiveEpisode();

  return {
    currentPage: _rlState.currentPage,
    stepCount: _rlState.stepCount,
    lastAction: _rlState.lastAction,
    selectedIds: _rlState.selectedIds,
    availableActions: getAvailableActions(),
    currentPageData: getContextData(),
    episode: episode
      ? {
          id: episode.id,
          taskId: episode.task.id,
          taskGoal: episode.task.goal,
          status: episode.status,
          stepsRemaining: episode.task.maxSteps - episode.stepCount,
        }
      : null,
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
        id: p.id,
        title: p.title,
        status: p.status,
        inventory: p.inventory,
        price: p.price,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.customer,
        total: o.total,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
      })),
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name,
        orders: c.orders,
        totalSpent: c.totalSpent,
      })),
      discounts: discounts.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        status: d.status,
        value: d.value,
        valueType: d.valueType,
      })),
    },
  };
}

// ---------------------------------------------------------------------------
// Execute action and compute reward
// ---------------------------------------------------------------------------

function executeAction(action: Record<string, unknown>): {
  reward: number;
  success: boolean;
} {
  let reward = -0.01;
  let success = true;

  switch (action.action) {
    case "navigate": {
      if (typeof action.target === "string" && action.target !== _rlState.currentPage) {
        _rlState.currentPage = action.target;
        reward = 0.0;
      }
      break;
    }
    case "search":
      reward = 0.05;
      break;
    case "select":
      if (Array.isArray(action.ids)) {
        _rlState.selectedIds = action.ids as string[];
        reward = 0.02;
      }
      break;
    case "create_product": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createProduct(fields as Parameters<typeof store.createProduct>[0]);
        reward = result.success ? 0.5 : -0.5;
        success = result.success;
      } else {
        reward = -0.5;
        success = false;
      }
      break;
    }
    case "update_product": {
      const result = store.updateProduct(
        action.productId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateProduct>[1],
      );
      reward = result.success ? 0.5 : -0.5;
      success = result.success;
      break;
    }
    case "delete_product": {
      const result = store.deleteProduct(action.productId as string);
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "fulfill_order": {
      const result = store.fulfillOrder(action.orderId as string);
      reward = result.success ? 1.0 : -0.5;
      success = result.success;
      break;
    }
    case "capture_payment": {
      const result = store.capturePayment(action.orderId as string);
      reward = result.success ? 1.0 : -0.5;
      success = result.success;
      break;
    }
    case "refund_order": {
      const result = store.refundOrder(action.orderId as string);
      reward = result.success ? 0.8 : -0.5;
      success = result.success;
      break;
    }
    case "add_order_note": {
      const result = store.addOrderNote(action.orderId as string, action.message as string);
      reward = result.success ? 0.1 : -0.5;
      success = result.success;
      break;
    }
    case "create_customer": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createCustomer(fields as Parameters<typeof store.createCustomer>[0]);
        reward = result.success ? 0.5 : -0.5;
        success = result.success;
      } else {
        reward = -0.5;
        success = false;
      }
      break;
    }
    case "update_customer": {
      const result = store.updateCustomer(
        action.customerId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateCustomer>[1],
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "create_discount": {
      const fields = action.fields as Record<string, unknown> | undefined;
      if (fields) {
        const result = store.createDiscount(fields as Parameters<typeof store.createDiscount>[0]);
        reward = result.success ? 0.5 : -0.5;
        success = result.success;
      } else {
        reward = -0.5;
        success = false;
      }
      break;
    }
    case "update_discount": {
      const result = store.updateDiscount(
        action.discountId as string,
        (action.fields ?? {}) as Parameters<typeof store.updateDiscount>[1],
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "delete_discount": {
      const result = store.deleteDiscount(action.discountId as string);
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    case "update_settings": {
      const result = store.updateSettings(
        (action.fields ?? {}) as Parameters<typeof store.updateSettings>[0],
      );
      reward = result.success ? 0.3 : -0.5;
      success = result.success;
      break;
    }
    default:
      reward = -0.1;
      success = false;
  }

  return { reward, success };
}

// ---------------------------------------------------------------------------
// HTTP handlers
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({
    observation: getObservation(),
    info: {
      description: "ThetaBench Shopify Admin RL Environment",
      version: "3.0",
      episodeActive: hasActiveEpisode(),
    },
  });
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  const action = body as Record<string, unknown>;
  const actionName = action.action as string;

  _rlState.lastAction = actionName;

  // Execute the action
  const { reward: baseReward, success } = executeAction(action);

  _rlState.stepCount++;

  // If episode is active, use shaped rewards and log action
  let finalReward = baseReward;
  const episode = getActiveEpisode();

  if (episode && episode.status === "active") {
    // Shape reward using task's reward profile
    const stepReward = getStepReward(success);
    finalReward = success ? baseReward + stepReward : stepReward;

    // Log action to episode
    logAction(actionName, action as Record<string, unknown>, finalReward, success);
  }

  const observation = getObservation();

  // Determine if done
  let done = false;
  if (episode) {
    // Episode mode: done when episode status changes
    done =
      episode.status === "timeout" || episode.status === "completed" || episode.status === "failed";
  } else {
    // Legacy mode: done when all orders fulfilled + payments captured
    const orders = store.getOrders();
    done =
      orders.filter((o) => o.fulfillmentStatus === "unfulfilled").length === 0 &&
      orders.filter((o) => o.paymentStatus === "pending").length === 0;
  }

  return NextResponse.json({
    observation,
    reward: finalReward,
    done,
    truncated: episode ? episode.status === "timeout" : false,
    info: {
      stepCount: _rlState.stepCount,
      lastAction: actionName,
      success,
      episodeActive: hasActiveEpisode(),
      episodeStepsRemaining: episode ? episode.task.maxSteps - episode.stepCount : null,
    },
  });
}
