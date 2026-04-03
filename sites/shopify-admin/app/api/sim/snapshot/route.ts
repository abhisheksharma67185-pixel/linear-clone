import { NextResponse } from "next/server";
import { getActiveEpisode } from "../../../lib/episode";

export async function GET() {
  const episode = getActiveEpisode();
  if (!episode) {
    return NextResponse.json({ error: "No active episode" }, { status: 400 });
  }

  return NextResponse.json(episode.initialSnapshot);
}
