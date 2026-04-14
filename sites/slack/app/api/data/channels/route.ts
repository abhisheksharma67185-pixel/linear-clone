import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../lib/store";

export async function GET() {
  return NextResponse.json(store.getChannels());
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = store.createChannel(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data, { status: 201 });
}
