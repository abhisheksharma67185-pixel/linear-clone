import { NextResponse } from "next/server"
import { planState, setPlan } from "@/lib/sla-mocks"
import { route } from "@/app/lib/with-route"

// Wrapped with `route()` so the trial mutation lands on the same
// per-session state that subsequent `GET /api/billing/plan` reads.
// Without this both routes ran outside ALS and Next.js dev's module
// cache occasionally produced different DEFAULT-session objects per
// request, leading to "POST trial" being a no-op as observed by the
// next plan GET.
export const POST = route(async () => {
  if (planState.plan === "business" || planState.plan === "enterprise") {
    return NextResponse.json(
      { error: "Workspace is already on a paid plan" },
      { status: 400 }
    )
  }
  setPlan("trial", 30)
  return NextResponse.json(
    {
      plan: planState.plan,
      trialDaysRemaining: planState.trialDaysRemaining,
    },
    { status: 201 }
  )
})
