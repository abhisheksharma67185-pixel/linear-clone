import { NextResponse } from "next/server"
import "../../../lib/init-sim"
import {
  captureSnapshot,
  computeDiff,
  getActiveEpisode,
} from "@thetabench/core"
import * as store from "../../../lib/store"
import { route } from "../../../lib/route"
import { _state } from "../../../lib/session"

const getState = () => {
  const s = _state()
  return {
    issues: store.getIssues(),
    projects: store.getProjects(),
    cycles: store.getCycles(),
    labels: store.getLabels(),
    teams: store.getTeams(),
    members: store.getMembers(),
    views: store.getViews(),
    workspace: { ...s.workspace },
    agent: {
      guidance: s.agent.guidance,
      skills: [...s.agent.skills],
      mcpServers: [...s.agent.mcpServers],
    },
  }
}

export const GET = route(async (request) => {
  const url = new URL(request.url)
  const wantDiff = url.searchParams.get("diff") === "true"

  const current = captureSnapshot(getState)

  if (wantDiff) {
    const episode = getActiveEpisode()
    if (!episode) {
      return NextResponse.json(
        { error: "No active episode for diff computation" },
        { status: 400 }
      )
    }
    const diff = computeDiff(
      episode.initialSnapshot,
      current,
      ["issues", "projects", "cycles", "labels", "teams", "members", "views"],
      ["workspace", "agent"]
    )
    return NextResponse.json({ state: current, diff })
  }

  return NextResponse.json(current)
})
