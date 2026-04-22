import { NextResponse } from "next/server"
import * as store from "../../../lib/store"
import { resetRLState } from "../route"

export async function POST() {
  store.reset()
  resetRLState()

  const issues = store.getIssues()
  return NextResponse.json({
    message: "Environment reset",
    observation: {
      currentPage: "/board",
      stepCount: 0,
      totalIssues: issues.length,
      todoIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "to_do"
      ).length,
      inProgressIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "in_progress"
      ).length,
      doneIssues: issues.filter(
        (i: Record<string, unknown>) => i.status === "done"
      ).length,
      totalProjects: store.getProjects().length,
      totalSprints: store.getSprints().length,
      totalEpics: store.getEpics().length,
    },
  })
}
