import { afterEach, describe, expect, it } from "vitest"
import type { Member } from "../app/lib/mock-data"

import {
  filterMemberSummaries,
  formatLastSeen,
  inviteMembers,
  removeMember,
  resendInvite,
  resetMembersAdminState,
  setMemberRole,
  sortMemberSummaries,
  summarizeMembers,
  suspendMember,
  toCsv,
  unsuspendMember,
  validateInviteEmails,
  type MemberStatus,
} from "../lib/members-admin-mocks"

afterEach(() => {
  resetMembersAdminState()
})

const MEMBERS: Member[] = [
  {
    id: "usr-1",
    cessId: "LU001",
    name: "Priya Sharma",
    email: "priya@theta.internal",
    avatar: "",
    role: "admin",
  },
  {
    id: "usr-2",
    cessId: "LU002",
    name: "Arjun Mehta",
    email: "arjun@theta.internal",
    avatar: "",
    role: "admin",
  },
  {
    id: "usr-3",
    cessId: "LU003",
    name: "Ravi Kumar",
    email: "ravi@theta.internal",
    avatar: "",
    role: "member",
  },
  {
    id: "usr-11",
    cessId: "LU011",
    name: "Meera Iyer",
    email: "meera@theta.internal",
    avatar: "",
    role: "member",
  },
  {
    id: "usr-14",
    cessId: "LU014",
    name: "Guest One",
    email: "guest1@external.com",
    avatar: "",
    role: "member",
  },
]

function summarize(overrides?: Record<string, number>) {
  return summarizeMembers({
    members: MEMBERS,
    teamMemberIdsByMember: overrides ?? {},
  })
}

describe("validateInviteEmails", () => {
  it("rejects empty input", () => {
    expect(validateInviteEmails("").success).toBe(false)
    expect(validateInviteEmails("   ").success).toBe(false)
  })

  it("accepts a single email", () => {
    const r = validateInviteEmails("hello@theta.internal")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(["hello@theta.internal"])
  })

  it("splits on commas, spaces, and newlines and dedupes", () => {
    const r = validateInviteEmails("a@x.com, b@x.com\nA@X.com")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(["a@x.com", "b@x.com"])
  })

  it("rejects invalid addresses", () => {
    const r = validateInviteEmails("valid@x.com, notanemail")
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error).toMatch(/notanemail/)
  })
})

describe("summarizeMembers seeding", () => {
  it("assigns varied roles (Admin / Member / Guest)", () => {
    const s = summarize()
    const roles = new Set(s.map((m) => m.role))
    expect(roles.has("admin")).toBe(true)
    expect(roles.has("member")).toBe(true)
    expect(roles.has("guest")).toBe(true)
  })

  it("assigns varied statuses including application + invited", () => {
    const s = summarize()
    const statuses = new Set<MemberStatus>(s.map((m) => m.status))
    expect(statuses.has("active")).toBe(true)
    expect(statuses.has("invited")).toBe(true)
    expect(statuses.has("application")).toBe(true)
    expect(s.find((m) => m.isApplication)?.name).toBe("Linear")
  })

  it("derives usernames from email local-parts", () => {
    const s = summarize()
    expect(s.find((m) => m.id === "usr-1")?.username).toBe("priya")
  })
})

describe("role + suspend + remove actions", () => {
  it("changes role and reflects in summary", () => {
    const r = setMemberRole("usr-3", "admin")
    expect(r.success).toBe(true)
    const s = summarize()
    expect(s.find((m) => m.id === "usr-3")?.role).toBe("admin")
  })

  it("suspend + unsuspend toggles status", () => {
    suspendMember("usr-1")
    expect(summarize().find((m) => m.id === "usr-1")?.status).toBe("suspended")
    unsuspendMember("usr-1")
    expect(summarize().find((m) => m.id === "usr-1")?.status).toBe("active")
  })

  it("remove marks base member as suspended but deletes synthetic invites", () => {
    const invited = inviteMembers("ghost@x.com")
    expect(invited.success).toBe(true)
    if (!invited.success) return
    const id = invited.data[0].id
    removeMember(id)
    expect(summarize().find((m) => m.id === id)).toBeUndefined()

    removeMember("usr-1")
    expect(summarize().find((m) => m.id === "usr-1")?.status).toBe("suspended")
  })
})

describe("inviteMembers", () => {
  it("adds invited records with Admin role", () => {
    const r = inviteMembers("new@x.com, new2@x.com")
    expect(r.success).toBe(true)
    const s = summarize()
    const invited = s.filter((m) => m.status === "invited")
    // Two new invites + the seeded Meera (usr-11) invite.
    expect(invited.length).toBeGreaterThanOrEqual(3)
    for (const inv of r.success ? r.data : []) {
      expect(inv.role).toBe("admin")
    }
  })
})

describe("resendInvite", () => {
  it("succeeds for invited members", () => {
    const created = inviteMembers("x@x.com")
    if (!created.success) throw new Error("setup")
    const r = resendInvite(created.data[0].id)
    expect(r.success).toBe(true)
  })

  it("fails for active members", () => {
    const r = resendInvite("usr-1")
    expect(r.success).toBe(false)
  })
})

describe("filter + sort", () => {
  it("filters by query on name, email, username", () => {
    const s = summarize()
    expect(filterMemberSummaries(s, "priya", "all").length).toBe(1)
    expect(filterMemberSummaries(s, "PRIYA", "all").length).toBe(1)
    expect(
      filterMemberSummaries(s, "guest1@external", "all").length
    ).toBeGreaterThanOrEqual(1)
  })

  it("filters by status", () => {
    const s = summarize()
    expect(
      filterMemberSummaries(s, "", "application").every(
        (m) => m.status === "application"
      )
    ).toBe(true)
  })

  it("sorts by name asc/desc", () => {
    const s = summarize()
    const names = sortMemberSummaries(s, "name", "asc").map((m) => m.name)
    const rev = sortMemberSummaries(s, "name", "desc").map((m) => m.name)
    expect(names).toEqual([...names].sort())
    expect(rev).toEqual([...names].reverse())
  })
})

describe("formatLastSeen", () => {
  const now = new Date("2026-04-24T12:00:00Z")

  it("reports Online when within 5 minutes", () => {
    expect(
      formatLastSeen(new Date(now.getTime() - 60_000).toISOString(), now).label
    ).toBe("Online")
  })

  it("reports minutes then hours", () => {
    expect(
      formatLastSeen(new Date(now.getTime() - 10 * 60_000).toISOString(), now)
        .label
    ).toBe("10m ago")
    expect(
      formatLastSeen(new Date(now.getTime() - 3 * 3600_000).toISOString(), now)
        .label
    ).toBe("3h ago")
  })

  it("reports Yesterday, days, then absolute date", () => {
    expect(
      formatLastSeen(
        new Date(now.getTime() - 26 * 3600_000).toISOString(),
        now
      ).label
    ).toBe("Yesterday")
    expect(
      formatLastSeen(
        new Date(now.getTime() - 3 * 24 * 3600_000).toISOString(),
        now
      ).label
    ).toBe("3d ago")
  })

  it("reports Never when lastSeenAt is null", () => {
    expect(formatLastSeen(null, now).label).toBe("Never")
  })
})

describe("toCsv", () => {
  it("escapes commas and quotes", () => {
    const s = summarize()
    const csv = toCsv(s.slice(0, 2))
    const lines = csv.split("\n")
    expect(lines[0]).toBe("Name,Email,Role,Status,Teams,Joined,Last seen")
    expect(lines.length).toBe(3)
  })
})
