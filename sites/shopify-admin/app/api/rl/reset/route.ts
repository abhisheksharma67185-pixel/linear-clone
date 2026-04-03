import { NextResponse } from "next/server";
import * as store from "../../../lib/store";
import { resetRLState } from "../route";

export async function POST() {
  store.reset();
  resetRLState();

  const orders = store.getOrders();
  return NextResponse.json({
    message: "Environment reset",
    observation: {
      currentPage: "/admin",
      stepCount: 0,
      totalProducts: store.getProducts().length,
      totalOrders: orders.length,
      unfulfilledOrders: orders.filter((o) => o.fulfillmentStatus === "unfulfilled").length,
      pendingPayments: orders.filter((o) => o.paymentStatus === "pending").length,
      totalCustomers: store.getCustomers().length,
      totalDiscounts: store.getDiscounts().length,
    },
  });
}
