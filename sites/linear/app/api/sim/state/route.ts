import { NextRequest, NextResponse } from "next/server";
import "../../../lib/init-sim";
import { captureSnapshot, computeDiff, getActiveEpisode } from "@simbench/core";
import * as store from "../../../lib/store";

const getState = () => ({
  issues: store.getIssues(),
  projects: store.getProjects(),
  cycles: store.getCycles(),
  labels: store.getLabels(),
  teams: store.getTeams(),
  members: store.getMembers(),
  views: store.getViews(),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const wantDiff = url.searchParams.get("diff") === "true";

  const current = captureSnapshot(getState);

  if (wantDiff) {
    const episode = getActiveEpisode();
    if (!episode) {
      return NextResponse.json(
        { error: "No active episode for diff computation" },
        { status: 400 },
      );
    }
    const diff = computeDiff(
      episode.initialSnapshot,
      current,
      ["issues", "projects", "cycles", "labels", "teams", "members", "views"],
      [],
    );
    return NextResponse.json({ state: current, diff });
  }

  return NextResponse.json(current);
}
