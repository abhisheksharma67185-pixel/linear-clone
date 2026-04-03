import { NextRequest, NextResponse } from "next/server";
import "../../../lib/init-sim";
import { captureSnapshot, computeDiff, getActiveEpisode } from "@simbench/core";
import * as store from "../../../lib/store";

const getState = () => ({
  products: store.getProducts(),
  orders: store.getOrders(),
  customers: store.getCustomers(),
  discounts: store.getDiscounts(),
  settings: store.getSettings(),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const wantDiff = url.searchParams.get("diff") === "true";

  const current = captureSnapshot(getState);

  if (wantDiff) {
    const episode = getActiveEpisode();
    if (!episode) {
      return NextResponse.json(
        { error: "No active episode for diff computation" },
        { status: 400 },
      );
    }
    const diff = computeDiff(
      episode.initialSnapshot,
      current,
      ["products", "orders", "customers", "discounts"],
      ["settings"],
    );
    return NextResponse.json({ state: current, diff });
  }

  return NextResponse.json(current);
}
