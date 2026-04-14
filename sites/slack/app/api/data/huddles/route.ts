import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../lib/store";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const activeOnly = url.searchParams.get("active") === "true";
  return NextResponse.json(store.getHuddles(activeOnly));
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = store.startHuddle(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data, { status: 201 });
}
