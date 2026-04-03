import { NextResponse } from "next/server";
import { evaluateEpisode, hasActiveEpisode } from "../../../lib/episode";

export async function POST() {
  if (!hasActiveEpisode()) {
    return NextResponse.json({ error: "No active episode" }, { status: 400 });
  }

  const result = evaluateEpisode();
  if (!result) {
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }

  return NextResponse.json(result);
}
