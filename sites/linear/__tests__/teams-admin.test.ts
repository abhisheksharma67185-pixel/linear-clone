import { afterEach, describe, expect, it } from "vitest"
import type { Team } from "../app/lib/mock-data"

import {
  archiveTeam,
  deleteTeam,
  filterTeamSummaries,
  getTeamStatus,
  hasLeftTeam,
  leaveTeam,
  resetTeamsAdminState,
  restoreTeam,
  sortTeamSummaries,
  summarizeTeams,
} from "../lib/teams-admin-mocks"

afterEach(() => {
  resetTeamsAdminState()
})

const TEAMS: Team[] = [
  {
    id: "t-1",
    name: "Platform",
    key: "PLT",
    description: "Backend platform",
    leadId: "usr-1",
    memberIds: ["usr-1", "usr-2", "usr-3"],
    createdAt: "2025-10-01T00:00:00Z",
  },
  {
    id: "t-2",
    name: "Frontend",
    key: "FE",
    description: "Frontend engineering",
    leadId: "usr-4",
    memberIds: ["usr-4", "usr-5"],
    createdAt: "2025-09-01T00:00:00Z",
  },
]

describe("team lifecycle", () => {
  it("defaults to active", () => {
    expect(getTeamStatus("t-1")).toBe("active")
  })

  it("archive → retired, restore → active", () => {
    archiveTeam("t-1")
    expect(getTeamStatus("t-1")).toBe("retired")
    restoreTeam("t-1")
    expect(getTeamStatus("t-1")).toBe("active")
  })

  it("delete → recently-deleted", () => {
    deleteTeam("t-1")
    expect(getTeamStatus("t-1")).toBe("recently-deleted")
  })

  it("leaveTeam marks as left for current user", () => {
    expect(hasLeftTeam("t-1")).toBe(false)
    leaveTeam("t-1")
    expect(hasLeftTeam("t-1")).toBe(true)
  })
})

describe("summarizeTeams", () => {
  it("returns real member + issue counts and status", () => {
    archiveTeam("t-2")
    const summaries = summarizeTeams({
      teams: TEAMS,
      issuesByTeamId: { "t-1": 12, "t-2": 3 },
      currentUserId: "usr-1",
    })
    expect(summaries).toHaveLength(2)
    const plt = summaries.find((s) => s.id === "t-1")!
    expect(plt.memberCount).toBe(3)
    expect(plt.issueCount).toBe(12)
    expect(plt.status).toBe("active")
    expect(plt.currentUserIsMember).toBe(true)
    const fe = summaries.find((s) => s.id === "t-2")!
    expect(fe.status).toBe("retired")
    expect(fe.currentUserIsMember).toBe(false)
  })

  it("decrements member count when current user has left", () => {
    leaveTeam("t-1")
    const summaries = summarizeTeams({
      teams: TEAMS,
      issuesByTeamId: {},
      currentUserId: "usr-1",
    })
    const plt = summaries.find((s) => s.id === "t-1")!
    expect(plt.memberCount).toBe(2)
    expect(plt.currentUserIsMember).toBe(false)
  })
})

describe("sortTeamSummaries", () => {
  const summaries = summarizeTeams({
    teams: TEAMS,
    issuesByTeamId: { "t-1": 12, "t-2": 3 },
    currentUserId: "usr-1",
  })

  it("sorts by name asc/desc", () => {
    const asc = sortTeamSummaries(summaries, "name", "asc").map((t) => t.name)
    expect(asc).toEqual(["Frontend", "Platform"])
    const desc = sortTeamSummaries(summaries, "name", "desc").map((t) => t.name)
    expect(desc).toEqual(["Platform", "Frontend"])
  })

  it("sorts numeric columns numerically", () => {
    const asc = sortTeamSummaries(summaries, "issueCount", "asc").map(
      (t) => t.issueCount
    )
    expect(asc).toEqual([3, 12])
  })
})

describe("filterTeamSummaries", () => {
  const summaries = summarizeTeams({
    teams: TEAMS,
    issuesByTeamId: {},
    currentUserId: "usr-1",
  })

  it("filters case-insensitively on name, key, description", () => {
    // Spec calls out these two edge cases — both must match "Platform".
    expect(
      filterTeamSummaries(summaries, "plat", "all").map((t) => t.name)
    ).toEqual(["Platform"])
    expect(
      filterTeamSummaries(summaries, "PLATFORM", "all").map((t) => t.name)
    ).toEqual(["Platform"])
    // Key match (uppercase in data, lowercase in query).
    expect(
      filterTeamSummaries(summaries, "fe", "all").map((t) => t.key)
    ).toEqual(["FE"])
    // Description match.
    expect(
      filterTeamSummaries(summaries, "engineering", "all").map((t) => t.name)
    ).toEqual(["Frontend"])
  })

  it("filters by status", () => {
    archiveTeam("t-1")
    const all = summarizeTeams({
      teams: TEAMS,
      issuesByTeamId: {},
      currentUserId: "usr-1",
    })
    expect(filterTeamSummaries(all, "", "active").map((t) => t.id)).toEqual([
      "t-2",
    ])
    expect(filterTeamSummaries(all, "", "retired").map((t) => t.id)).toEqual([
      "t-1",
    ])
  })
})
