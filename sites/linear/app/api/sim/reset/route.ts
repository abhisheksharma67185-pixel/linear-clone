// ---------------------------------------------------------------------------
// POST /api/sim/reset
//
// Resets the per-rollout session's state to the initial seed. Resolves the
// session id the same way the wrapped routes do (header → cookie → "default")
// so the orchestrator just sets `x-tbench-session: <rollout-id>` once and
// everything below targets the right store.
//
// Body (all optional):
//   { seed?: number, sessionId?: string }
//
// `sessionId` in the body wins over the header when set, so an orchestrator
// running outside the agent's HTTP namespace can reset arbitrary rollouts.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server"
import "../../../lib/init-sim"
import {
  getCurrentSessionId,
  resetSession,
  withSession,
} from "../../../lib/session"

export const POST = withSession(async (request: Request) => {
  let body: { seed?: number; sessionId?: string } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    // Empty body is fine — reset with no seed.
  }

  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.trim().length > 0
      ? body.sessionId.trim()
      : getCurrentSessionId()

  const seed =
    body.seed !== undefined && Number.isFinite(Number(body.seed))
      ? Number(body.seed)
      : undefined

  resetSession(sessionId, seed)

  return NextResponse.json({
    ok: true,
    session_id: sessionId,
    seed: seed ?? null,
  })
})
