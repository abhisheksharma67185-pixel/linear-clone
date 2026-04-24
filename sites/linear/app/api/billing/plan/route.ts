import { NextResponse } from "next/server"
import { planState } from "@/lib/sla-mocks"

export async function GET() {
  return NextResponse.json(planState)
}
