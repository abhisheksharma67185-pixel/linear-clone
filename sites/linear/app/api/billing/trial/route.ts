import { NextResponse } from "next/server"
import { planState, setPlan } from "@/lib/sla-mocks"

export async function POST() {
  // Only allow starting a trial from free/standard; idempotent on trial.
  if (planState.plan === "business" || planState.plan === "enterprise") {
    return NextResponse.json(
      { error: "Workspace is already on a paid plan" },
      { status: 400 }
    )
  }
  setPlan("trial", 30)
  return NextResponse.json(planState, { status: 201 })
}
