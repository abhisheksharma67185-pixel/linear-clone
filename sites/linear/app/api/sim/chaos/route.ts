// ---------------------------------------------------------------------------
// /api/sim/chaos — read or update the per-session chaos config.
//
// Lets the orchestrator inject latency, simulated errors, and rate limits
// without going through the full episode lifecycle. Useful for stress-testing
// agents and for ad-hoc fault-injection experiments.
//
// PATCH body (all optional):
//   { latencyMs?: number, errorRate?: number (0..1),
//     rateLimitPerMinute?: number | null }
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server"
import "../../../lib/init-sim"
import { _state } from "../../../lib/session"
import { withSession } from "../../../lib/session"

export const GET = withSession(async () => {
  const chaos = _state().chaos
  return NextResponse.json({
    latencyMs: chaos.latencyMs,
    errorRate: chaos.errorRate,
    rateLimitPerMinute: chaos.rateLimitPerMinute,
  })
})

export const PATCH = withSession(async (request: Request) => {
  let body: {
    latencyMs?: unknown
    errorRate?: unknown
    rateLimitPerMinute?: unknown
  } = {}
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const chaos = _state().chaos

  if (typeof body.latencyMs === "number" && Number.isFinite(body.latencyMs)) {
    chaos.latencyMs = Math.max(0, body.latencyMs)
  }

  if (typeof body.errorRate === "number" && Number.isFinite(body.errorRate)) {
    if (body.errorRate < 0 || body.errorRate > 1) {
      return NextResponse.json(
        { error: "errorRate must be in [0, 1]" },
        { status: 400 }
      )
    }
    chaos.errorRate = body.errorRate
  }

  if (body.rateLimitPerMinute === null) {
    chaos.rateLimitPerMinute = null
    chaos.rateLimitWindowStartMs = 0
    chaos.rateLimitCount = 0
  } else if (
    typeof body.rateLimitPerMinute === "number" &&
    Number.isFinite(body.rateLimitPerMinute) &&
    body.rateLimitPerMinute > 0
  ) {
    chaos.rateLimitPerMinute = Math.floor(body.rateLimitPerMinute)
    chaos.rateLimitWindowStartMs = Date.now()
    chaos.rateLimitCount = 0
  }

  return NextResponse.json({
    ok: true,
    chaos: {
      latencyMs: chaos.latencyMs,
      errorRate: chaos.errorRate,
      rateLimitPerMinute: chaos.rateLimitPerMinute,
    },
  })
})
