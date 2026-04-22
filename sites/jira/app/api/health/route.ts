import { NextResponse } from "next/server"
import "../../lib/init-sim"
import { getTaskCount, getAllTasks, getCurriculum } from "@thetabench/core"

export async function GET() {
  try {
    const tasks = getAllTasks()
    const domains = [...new Set(tasks.map((t) => t.domain))]
    const stages = getCurriculum()

    return NextResponse.json({
      status: "ok",
      version: "0.1.0",
      site: "jira",
      tasks: getTaskCount(),
      domains: domains.length,
      curriculum_stages: stages.length,
      domain_breakdown: Object.fromEntries(
        domains.map((d) => [d, tasks.filter((t) => t.domain === d).length])
      ),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json(
      { status: "error", error: message },
      { status: 500 }
    )
  }
}
