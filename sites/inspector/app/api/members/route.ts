import { NextResponse } from "next/server"
import * as store from "@/app/lib/store"
import { summarizeMembers } from "@/lib/members-admin-mocks"
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
  return NextResponse.json(summarizeMembers({ members, teamMemberIdsByMember }))
})
