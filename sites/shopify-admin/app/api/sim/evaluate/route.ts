import { NextResponse } from "next/server";
import "../../../lib/init-sim";
import { evaluateEpisode, hasActiveEpisode } from "@simbench/core";

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
