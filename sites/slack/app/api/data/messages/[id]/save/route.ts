import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../../../lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: { reminder?: string | null; userId?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body acceptable
  }
  const result = store.saveMessage(id, body.reminder, body.userId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? undefined;
  const result = store.unsaveMessage(id, userId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data);
}
