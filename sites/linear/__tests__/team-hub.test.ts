import { describe, expect, it } from "vitest"
import {
  TEAM_DANGER_ACTIONS,
  TEAM_HUB_GROUPS,
  sectionValueLabel,
  validateTeamNameMatch,
  type TeamHubSectionSummary,
} from "../lib/team-hub"

describe("validateTeamNameMatch", () => {
  it("matches case- and whitespace-insensitively", () => {
    expect(validateTeamNameMatch("Platform", "Platform")).toBe(true)
    expect(validateTeamNameMatch("  platform  ", "Platform")).toBe(true)
    expect(validateTeamNameMatch("PLATFORM", "Platform")).toBe(true)
  })

  it("rejects partial matches and empty input", () => {
    expect(validateTeamNameMatch("", "Platform")).toBe(false)
    expect(validateTeamNameMatch("Plat", "Platform")).toBe(false)
    expect(validateTeamNameMatch("Platformz", "Platform")).toBe(false)
  })
})

describe("TEAM_HUB_GROUPS config", () => {
  const allSections = TEAM_HUB_GROUPS.flatMap((g) => g.sections)

  it("uses sentence-case section heading with Oxford comma", () => {
    const titles = TEAM_HUB_GROUPS.map((g) => g.title)
    expect(titles).toContain("Issues, projects, and docs")
  })

  it("has the expected subtitle copy", () => {
    const bySubtitle = Object.fromEntries(
      allSections.map((s) => [s.id, s.subtitle])
    )
    expect(bySubtitle.general).toBe(
      "Name, identifier, timezone, estimates, and broader settings"
    )
    expect(bySubtitle.members).toBe("Manage team members")
    expect(bySubtitle.notifications).toBe("Broadcast notifications to Slack")
    expect(bySubtitle["issue-labels"]).toBe(
      "Labels available to this team's issues"
    )
    expect(bySubtitle.templates).toBe(
      "Pre-filled templates for issues, documents, and projects"
    )
    expect(bySubtitle["recurring-issues"]).toBe(
      "Automatically create issues on a schedule"
    )
    expect(bySubtitle.agents).toBe(
      "Add guidance for how agents should operate within this team"
    )
    expect(bySubtitle["discussion-summaries"]).toBe(
      "Automatically generate summaries for issues and comments"
    )
  })

  it("has unique section ids", () => {
    const ids = allSections.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("sectionValueLabel snapshot", () => {
  const summary: TeamHubSectionSummary = {
    members: 1,
    slackOn: false,
    issueLabels: 3,
    templates: 0,
    recurringIssues: 0,
    statuses: 5,
  }
  const sections = Object.fromEntries(
    TEAM_HUB_GROUPS.flatMap((g) => g.sections).map((s) => [s.id, s])
  )

  it("renders '1 member' / 'Off' / '{n} labels' / 'None' / '5 statuses'", () => {
    expect(sectionValueLabel(sections.members, summary)).toBe("1 member")
    expect(sectionValueLabel(sections.notifications, summary)).toBe("Off")
    expect(sectionValueLabel(sections["issue-labels"], summary)).toBe("3 labels")
    expect(sectionValueLabel(sections.templates, summary)).toBe("None")
    expect(sectionValueLabel(sections["recurring-issues"], summary)).toBe(
      "None"
    )
    expect(sectionValueLabel(sections.statuses, summary)).toBe("5 statuses")
  })

  it("pluralises labels / members correctly", () => {
    const plural: TeamHubSectionSummary = { ...summary, members: 4, issueLabels: 1 }
    expect(sectionValueLabel(sections.members, plural)).toBe("4 members")
    expect(sectionValueLabel(sections["issue-labels"], plural)).toBe("1 label")
  })

  it("returns null when the summary has no value key for the row", () => {
    expect(sectionValueLabel(sections.general, summary)).toBeNull()
    expect(sectionValueLabel(sections.members, null)).toBeNull()
  })
})

describe("TEAM_DANGER_ACTIONS", () => {
  it("has trailing-ellipsis button labels", () => {
    const buttons = TEAM_DANGER_ACTIONS.map((a) => a.button)
    expect(buttons).toEqual(["Leave team…", "Retire…", "Delete…"])
  })

  it("maps retire → archive for the existing API", () => {
    const retire = TEAM_DANGER_ACTIONS.find((a) => a.id === "retire")!
    expect(retire.apiAction).toBe("archive")
  })

  it("uses the 30-day restoration copy for Delete", () => {
    const del = TEAM_DANGER_ACTIONS.find((a) => a.id === "delete")!
    expect(del.subtitle).toMatch(/30-day restoration/)
  })
})
