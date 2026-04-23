import { NextResponse } from "next/server"
import "../../../../lib/init-sim"
import { getCurriculum } from "@thetabench/core"

export async function GET() {
  const stages = getCurriculum()
  return NextResponse.json({ total_stages: stages.length, stages })
}
