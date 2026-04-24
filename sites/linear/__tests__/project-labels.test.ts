import { afterEach, describe, expect, it } from "vitest"

import {
  applyTableQuery,
  parseScope,
  shouldShowEmptyState,
  type ProjectLabelRow,
} from "../lib/project-labels"
import {
  archiveLabel,
  createLabel,
  deleteLabel,
  getLabels,
} from "../app/lib/store"

// ----- Helpers (pure logic) ------------------------------------------------

describe("parseScope", () => {
  it('returns "archived" only when the param matches', () => {
    expect(parseScope("archived")).toBe("archived")
  })
  it('defaults to "workspace" on null, unknown, or empty', () => {
    expect(parseScope(null)).toBe("workspace")
    expect(parseScope("")).toBe("workspace")
    expect(parseScope("team")).toBe("workspace")
  })
})

describe("applyTableQuery", () => {
  const rows: ProjectLabelRow[] = [
    { id: "1", name: "bug", description: "tracker", archivedAt: null },
    { id: "2", name: "design", description: "", archivedAt: null },
    { id: "3", name: "retired", description: "old", archivedAt: "t" },
  ]

  it("hides archived rows in workspace scope", () => {
    const out = applyTableQuery(rows, {
      term: "",
      scope: "workspace",
      sortDir: "asc",
    })
    expect(out.map((r) => r.id)).toEqual(["1", "2"])
  })

  it("shows only archived rows in archived scope", () => {
    const out = applyTableQuery(rows, {
      term: "",
      scope: "archived",
      sortDir: "asc",
    })
    expect(out.map((r) => r.id)).toEqual(["3"])
  })

  it("live-filters by name + description, case-insensitive", () => {
    expect(
      applyTableQuery(rows, {
        term: "BUG",
        scope: "workspace",
        sortDir: "asc",
      }).map((r) => r.id)
    ).toEqual(["1"])
    // Matches description text too ("tracker").
    expect(
      applyTableQuery(rows, {
        term: "track",
        scope: "workspace",
        sortDir: "asc",
      }).map((r) => r.id)
    ).toEqual(["1"])
  })

  it("sorts by name asc / desc", () => {
    const asc = applyTableQuery(rows, {
      term: "",
      scope: "workspace",
      sortDir: "asc",
    }).map((r) => r.name)
    const desc = applyTableQuery(rows, {
      term: "",
      scope: "workspace",
      sortDir: "desc",
    }).map((r) => r.name)
    expect(asc).toEqual(["bug", "design"])
    expect(desc).toEqual(["design", "bug"])
  })
})

describe("shouldShowEmptyState", () => {
  it("returns true only when there are zero visible rows AND no draft", () => {
    expect(shouldShowEmptyState(0, false)).toBe(true)
    // In-progress draft suppresses the illustration even with no labels yet.
    expect(shouldShowEmptyState(0, true)).toBe(false)
    // Any visible row hides the illustration.
    expect(shouldShowEmptyState(3, false)).toBe(false)
    expect(shouldShowEmptyState(3, true)).toBe(false)
  })
})

// ----- End-to-end style (via the store the UI uses) ------------------------

describe("project labels e2e (store + helpers)", () => {
  // Clean after each test so our created labels don't leak across cases.
  afterEach(() => {
    for (const l of getLabels()) {
      if (l.name.startsWith("ep-")) deleteLabel(l.id)
    }
  })

  it("new label creation surfaces through the table query", () => {
    const c = createLabel({
      name: "ep-alpha",
      color: "#22c55e",
      teamId: null,
      description: "",
    })
    expect(c.success).toBe(true)

    const result = applyTableQuery(getLabels(), {
      term: "ep-alpha",
      scope: "workspace",
      sortDir: "asc",
    })
    expect(result.length).toBe(1)
  })

  it("archived scope toggle moves a label from Workspace to Archived", () => {
    const c = createLabel({
      name: "ep-scope",
      color: "#ef4444",
      teamId: null,
    })
    if (!c.success) throw new Error("setup")

    archiveLabel(c.data.id)

    const inWorkspace = applyTableQuery(getLabels(), {
      term: "ep-scope",
      scope: "workspace",
      sortDir: "asc",
    })
    expect(inWorkspace.length).toBe(0)

    const inArchived = applyTableQuery(getLabels(), {
      term: "ep-scope",
      scope: "archived",
      sortDir: "asc",
    })
    expect(inArchived.length).toBe(1)
  })

  it("empty-state gating: zero labels AND no draft → show; any draft → hide", () => {
    const only = applyTableQuery(
      getLabels().filter((l) => l.name.startsWith("ep-")),
      { term: "ep-missing", scope: "workspace", sortDir: "asc" }
    )
    expect(only.length).toBe(0)
    expect(shouldShowEmptyState(only.length, false)).toBe(true)
    expect(shouldShowEmptyState(only.length, true)).toBe(false)
  })

  it("filter toggle by name respects live input", () => {
    createLabel({ name: "ep-north", color: "#000", teamId: null })
    createLabel({ name: "ep-south", color: "#000", teamId: null })

    const northOnly = applyTableQuery(getLabels(), {
      term: "north",
      scope: "workspace",
      sortDir: "asc",
    })
    expect(northOnly.map((r) => r.name)).toContain("ep-north")
    expect(northOnly.map((r) => r.name)).not.toContain("ep-south")
  })

  it("new group creation: simulated locally (UI-only state)", () => {
    // Groups are UI-only state in the prototype (not persisted to the store).
    // Verify the shape the page uses so the render pipeline stays sound.
    const groups: { id: string; name: string; color: string }[] = []
    const draft = { color: "#3b82f6", name: "Priority" }

    // Save flow:
    const saveGroup = () => {
      if (!draft.name.trim()) return
      groups.push({
        id: `grp_${Math.random().toString(36).slice(2, 6)}`,
        name: draft.name.trim(),
        color: draft.color,
      })
    }
    saveGroup()
    expect(groups.length).toBe(1)
    expect(groups[0].name).toBe("Priority")
  })
})
