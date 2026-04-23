import { NextRequest, NextResponse } from "next/server"
import "../../../lib/init-sim"
import {
  captureSnapshot,
  computeDiff,
  getActiveEpisode,
} from "@thetabench/core"
import * as store from "../../../lib/store"

const getState = () => ({
  threads: store.getThreads(),
  messages: store.getMessages(),
  customers: store.getCustomers(),
  tenants: store.getTenants(),
  labels: store.getLabels(),
  agents: store.getAgents(),
})

export async function GET(request: NextRequest) {
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
      ["threads", "messages", "customers", "tenants", "labels", "agents"],
      []
    )
    return NextResponse.json({ state: current, diff })
  }

  return NextResponse.json(current)
}
