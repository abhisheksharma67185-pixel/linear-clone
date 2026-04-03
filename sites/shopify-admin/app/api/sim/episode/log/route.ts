import { NextRequest, NextResponse } from "next/server";
import "../../../../lib/init-sim";
import { logAction, hasActiveEpisode } from "@simbench/core";

export async function POST(request: NextRequest) {
  if (!hasActiveEpisode()) {
    return NextResponse.json({ error: "No active episode" }, { status: 400 });
  }

  const body = await request.json();
  logAction(
    body.action ?? "unknown",
    body.payload ?? {},
    body.reward ?? -0.01,
    body.success ?? true,
  );

  return NextResponse.json({ logged: true });
}
