import { NextResponse } from "next/server"
import "../../../../lib/init-sim"
import { getCurriculum } from "@thetabench/core"
import { withSession } from "../../../../lib/session"

export const GET = withSession(async () => {
  const stages = getCurriculum()
  return NextResponse.json({ total_stages: stages.length, stages })
})
