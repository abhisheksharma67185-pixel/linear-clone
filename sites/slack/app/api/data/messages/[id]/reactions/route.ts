import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../../../lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const message = store.getMessageById(id);
  if (!message) {
    return NextResponse.json({ error: `Message ${id} not found` }, { status: 404 });
  }
  return NextResponse.json(message.reactions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = store.addReaction(id, body.emoji, body.userId);
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
  const emoji = url.searchParams.get("emoji");
  const userId = url.searchParams.get("userId") ?? undefined;
  if (!emoji) {
    return NextResponse.json({ error: "emoji query param required" }, { status: 400 });
  }
  const result = store.removeReaction(id, emoji, userId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data);
}
