import * as store from "@/app/lib/store"
import { summarizeMembers, toCsv } from "@/lib/members-admin-mocks"
import { route } from "@/app/lib/with-route"

export const GET = route(async () => {
  const members = store.getMembers()
  const teams = store.getTeams()
  const teamMemberIdsByMember: Record<string, number> = {}
  for (const team of teams) {
    for (const mid of team.memberIds) {
      teamMemberIdsByMember[mid] = (teamMemberIdsByMember[mid] ?? 0) + 1
    }
  }
  const summaries = summarizeMembers({ members, teamMemberIdsByMember })
  const csv = toCsv(summaries)
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="members.csv"',
    },
  })
})
