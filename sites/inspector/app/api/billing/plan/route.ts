import { NextResponse } from "next/server"
import { planState } from "@/lib/sla-mocks"
import { route } from "@/app/lib/with-route"

// Wrapped with `route()` so the handler runs inside the per-session ALS
// context. Without this, the handler ran without a session bound and
// the `planState` Proxy fell back to a freshly-`getOrCreate`-d DEFAULT
// state on every request, so a `POST /api/billing/trial` followed by a
// `GET /api/billing/plan` would not see each other's mutations.
export const GET = route(async () => {
  return NextResponse.json({
    plan: planState.plan,
    trialDaysRemaining: planState.trialDaysRemaining,
  })
})
