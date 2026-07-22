import { NextResponse } from "next/server"
import * as store from "@/app/lib/store"
import { templates } from "@/lib/templates-mocks"

// Default Linear workflow states per team.
const DEFAULT_TEAM_STATUS_COUNT = 5

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // `id` in the URL is either the team's canonical id (team-1) or its key
  // (PLT). Accept both so older links keep resolving.
  const teams = store.getTeams()
  const team =
    teams.find((t) => t.id === id) ??
    teams.find((t) => t.key.toUpperCase() === id.toUpperCase())
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  const labels = store.getLabels()
  const issueLabels = labels.filter(
    (l) => l.teamId === team.id && !l.archivedAt
  ).length
  const teamTemplates = templates.filter(
    // templates may or may not carry a teamId; only count those scoped to
    // this team.
    (t) => t.defaults?.teamId === team.id
  ).length

  return NextResponse.json({
    members: team.memberIds.length,
    slackOn: false,
    issueLabels,
    templates: teamTemplates,
    recurringIssues: 0,
    statuses: DEFAULT_TEAM_STATUS_COUNT,
  })
}
