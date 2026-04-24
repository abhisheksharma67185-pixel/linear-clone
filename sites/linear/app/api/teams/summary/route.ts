import { NextResponse } from "next/server"
import * as store from "@/app/lib/store"
import { summarizeTeams } from "@/lib/teams-admin-mocks"
import { CURRENT_USER } from "@/lib/view-filter"

export async function GET() {
  const teams = store.getTeams()
  const issues = store.getIssues()
  const issuesByTeamId: Record<string, number> = {}
  for (const issue of issues) {
    issuesByTeamId[issue.teamId] = (issuesByTeamId[issue.teamId] ?? 0) + 1
  }
  return NextResponse.json(
    summarizeTeams({
      teams,
      issuesByTeamId,
      currentUserId: CURRENT_USER,
    })
  )
}
