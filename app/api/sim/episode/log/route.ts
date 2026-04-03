import { NextRequest, NextResponse } from "next/server";
import { logAction, hasActiveEpisode } from "../../../../lib/episode";

export async function POST(request: NextRequest) {
  if (!hasActiveEpisode()) {
    return NextResponse.json({ error: "No active episode" }, { status: 400 });
  }

  const body = await request.json();
  const action = body.action ?? "unknown";
  const payload = body.payload ?? {};
  const reward = body.reward ?? -0.01;
  const success = body.success ?? true;

  logAction(action, payload, reward, success);

  return NextResponse.json({ logged: true });
}
