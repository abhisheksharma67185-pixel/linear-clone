import { NextRequest, NextResponse } from "next/server";
import { captureSnapshot, computeDiff } from "../../../lib/snapshot";
import { getActiveEpisode } from "../../../lib/episode";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const wantDiff = url.searchParams.get("diff") === "true";

  const current = captureSnapshot();

  if (wantDiff) {
    const episode = getActiveEpisode();
    if (!episode) {
      return NextResponse.json(
        { error: "No active episode for diff computation" },
        { status: 400 },
      );
    }
    const diff = computeDiff(episode.initialSnapshot, current);
    return NextResponse.json({ state: current, diff });
  }

  return NextResponse.json(current);
}
