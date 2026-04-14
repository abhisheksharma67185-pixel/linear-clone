import { NextRequest, NextResponse } from "next/server";
import * as store from "../../../lib/store";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const channelId = url.searchParams.get("channelId");
  const dmId = url.searchParams.get("dmId");
  const threadRootId = url.searchParams.get("threadRootId");

  if (threadRootId) {
    return NextResponse.json(store.getThreadReplies(threadRootId));
  }
  if (channelId) {
    return NextResponse.json(store.getMessagesByChannel(channelId));
  }
  if (dmId) {
    return NextResponse.json(store.getMessagesByDm(dmId));
  }
  return NextResponse.json(store.getMessages());
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = store.createMessage(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data, { status: 201 });
}
