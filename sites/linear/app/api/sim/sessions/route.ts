// ---------------------------------------------------------------------------
// /api/sim/sessions — orchestrator control plane for rollout state.
//
// GET    → list active session ids + size hints
// DELETE → drop a specific session (?id=...) or all sessions
//
// State isolation is best-effort: a session id is anything the orchestrator
// passes via `x-tbench-session`. Sessions are lazily created on first request
// and persist for the process lifetime unless dropped here.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server"
import "../../../lib/init-sim"
import {
  deleteSession,
  listSessions,
  snapshotSession,
  withSession,
} from "../../../lib/session"

export const GET = withSession(async () => {
  const ids = listSessions()
  const summary = ids.map((id) => {
    const snap = snapshotSession(id)
    return {
      id,
      issues: snap?.issues.length ?? 0,
      projects: snap?.projects.length ?? 0,
      cycles: snap?.cycles.length ?? 0,
      teams: snap?.teams.length ?? 0,
      members: snap?.members.length ?? 0,
      labels: snap?.labels.length ?? 0,
      views: snap?.views.length ?? 0,
      chaos: snap
        ? {
            latencyMs: snap.chaos.latencyMs,
            errorRate: snap.chaos.errorRate,
            rateLimitPerMinute: snap.chaos.rateLimitPerMinute,
          }
        : null,
    }
  })
  return NextResponse.json({ count: ids.length, sessions: summary })
})

export const DELETE = withSession(async (request: Request) => {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) {
    const all = listSessions()
    let dropped = 0
    for (const sid of all) {
      if (deleteSession(sid)) dropped++
    }
    return NextResponse.json({ ok: true, dropped })
  }
  const ok = deleteSession(id)
  if (!ok) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }
  return NextResponse.json({ ok: true, dropped: 1, id })
})
