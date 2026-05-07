// ---------------------------------------------------------------------------
// Chaos middleware — injects latency, simulated 5xx errors, and rate-limit
// 429 responses into API routes. Reads its config from the per-session store
// so episodes can configure failure modes via SimEngine's applyConfig.
//
// `withChaos` composes with `withSession` in the route's exported handler —
// see app/lib/route.ts for the convenience composition.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server"

import { _state } from "./session"

type RouteHandler<TCtx = unknown> = (
  request: Request,
  context: TCtx
) => Response | Promise<Response>

const RATE_LIMIT_WINDOW_MS = 60_000

function shouldInjectError(rate: number): boolean {
  if (rate <= 0) return false
  if (rate >= 1) return true
  return Math.random() < rate
}

function checkRateLimit(): boolean {
  const chaos = _state().chaos
  if (chaos.rateLimitPerMinute === null) return false
  const now = Date.now()
  if (
    chaos.rateLimitWindowStartMs === 0 ||
    now - chaos.rateLimitWindowStartMs >= RATE_LIMIT_WINDOW_MS
  ) {
    chaos.rateLimitWindowStartMs = now
    chaos.rateLimitCount = 0
  }
  chaos.rateLimitCount++
  return chaos.rateLimitCount > chaos.rateLimitPerMinute
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function withChaos<TCtx = unknown>(
  handler: RouteHandler<TCtx>
): RouteHandler<TCtx> {
  return async (request, context) => {
    const chaos = _state().chaos

    // Latency: applied before the handler runs. Cap at 30s to avoid hanging
    // the test suite if someone passes a runaway value.
    if (chaos.latencyMs > 0) {
      await delay(Math.min(chaos.latencyMs, 30_000))
    }

    // Rate limit: 429 with Retry-After when bucket exhausted.
    if (checkRateLimit()) {
      const retryAfter = Math.ceil(
        (RATE_LIMIT_WINDOW_MS -
          (Date.now() - _state().chaos.rateLimitWindowStartMs)) /
          1000
      )
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.max(1, retryAfter)) },
        }
      )
    }

    // Error injection: random 503 to simulate transient backend failures.
    if (shouldInjectError(chaos.errorRate)) {
      return NextResponse.json(
        { error: "Simulated upstream error" },
        { status: 503, headers: { "x-tbench-injected-error": "1" } }
      )
    }

    return handler(request, context)
  }
}
