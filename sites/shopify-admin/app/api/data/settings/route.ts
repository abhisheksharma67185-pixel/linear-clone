import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../lib/store";

export async function GET() {
  return NextResponse.json(store.getSettings());
}

export async function PUT(request: NextRequest) {
  const fields = await request.json();
  const result = store.updateSettings(fields);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data);
}
