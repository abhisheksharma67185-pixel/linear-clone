import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../lib/store";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? undefined;
  return NextResponse.json(store.getReadStates(userId));
}
