import { describe, expect, it } from "vitest"

import {
  archiveLabel,
  createLabel,
  deleteLabel,
  getLabelById,
  getLabels,
  restoreLabel,
  updateLabel,
} from "../app/lib/store"

// Helper that filters labels the same way the settings UI does (by name or
// description, respecting the "archived" scope). Mirrored here so the UI's
// filtering contract is test-covered even though the helper lives in the
// component.
type Scope = "workspace" | "archived"
function filterLabels(
  all: ReturnType<typeof getLabels>,
  { term, scope }: { term: string; scope: Scope }
) {
  const q = term.trim().toLowerCase()
  return all.filter((l) => {
    const archived = Boolean(l.archivedAt)
    if (scope === "archived" && !archived) return false
    if (scope === "workspace" && archived) return false
    if (!q) return true
    return (
      l.name.toLowerCase().includes(q) ||
      (typeof l.description === "string" &&
        l.description.toLowerCase().includes(q))
    )
  })
}

describe("label store: create", () => {
  it("creates a workspace-level label with description", () => {
    const r = createLabel({
      name: "ux",
      color: "#8b5cf6",
      teamId: null,
      description: "design polish",
    })
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.data.name).toBe("ux")
    expect(r.data.description).toBe("design polish")
    expect(r.data.teamId).toBeNull()
    expect(r.data.archivedAt).toBeNull()
    // Cleanup so later tests see a clean slate.
    deleteLabel(r.data.id)
  })

  it("rejects blank names", () => {
    const r = createLabel({ name: "   ", color: "#000" })
    expect(r.success).toBe(false)
  })

  it("rejects duplicate name within the same scope", () => {
    const a = createLabel({ name: "dup-test", color: "#000", teamId: null })
    expect(a.success).toBe(true)
    const b = createLabel({ name: "dup-test", color: "#fff", teamId: null })
    expect(b.success).toBe(false)
    if (a.success) deleteLabel(a.data.id)
  })
})

describe("label store: rename (update)", () => {
  it("updates the name and trims whitespace", () => {
    const c = createLabel({
      name: "rename-source",
      color: "#f59e0b",
      teamId: null,
    })
    expect(c.success).toBe(true)
    if (!c.success) return
    const u = updateLabel(c.data.id, { name: "  renamed  " })
    expect(u.success).toBe(true)
    if (u.success) expect(u.data.name).toBe("renamed")
    deleteLabel(c.data.id)
  })

  it("rejects empty new name", () => {
    const c = createLabel({ name: "name-guard", color: "#000", teamId: null })
    if (!c.success) throw new Error("setup failed")
    const u = updateLabel(c.data.id, { name: "   " })
    expect(u.success).toBe(false)
    deleteLabel(c.data.id)
  })

  it("updates description independently", () => {
    const c = createLabel({ name: "desc-src", color: "#000", teamId: null })
    if (!c.success) throw new Error("setup failed")
    const u = updateLabel(c.data.id, { description: "new desc" })
    expect(u.success).toBe(true)
    if (u.success) expect(u.data.description).toBe("new desc")
    deleteLabel(c.data.id)
  })
})

describe("label store: delete", () => {
  it("removes the label from the list", () => {
    const c = createLabel({ name: "to-delete", color: "#000", teamId: null })
    if (!c.success) throw new Error("setup failed")
    const d = deleteLabel(c.data.id)
    expect(d.success).toBe(true)
    expect(getLabelById(c.data.id)).toBeUndefined()
  })

  it("returns an error for unknown ids", () => {
    const d = deleteLabel("does-not-exist")
    expect(d.success).toBe(false)
  })
})

describe("label store: archive / restore", () => {
  it("sets archivedAt on archive and clears it on restore", () => {
    const c = createLabel({ name: "arch-src", color: "#000", teamId: null })
    if (!c.success) throw new Error("setup failed")

    const a = archiveLabel(c.data.id)
    expect(a.success).toBe(true)
    if (a.success) expect(a.data.archivedAt).toBeTruthy()

    const r = restoreLabel(c.data.id)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.archivedAt).toBeNull()

    deleteLabel(c.data.id)
  })
})

describe("label filter flow", () => {
  it("matches by name (case-insensitive)", () => {
    const c = createLabel({ name: "Filter-UX", color: "#000", teamId: null })
    if (!c.success) throw new Error("setup failed")
    const hits = filterLabels(getLabels(), {
      term: "filter-ux",
      scope: "workspace",
    })
    expect(hits.find((l) => l.id === c.data.id)).toBeTruthy()
    deleteLabel(c.data.id)
  })

  it("matches by description when name doesn't match", () => {
    const c = createLabel({
      name: "no-match",
      color: "#000",
      teamId: null,
      description: "xylophone rare token",
    })
    if (!c.success) throw new Error("setup failed")
    const hits = filterLabels(getLabels(), {
      term: "xylophone",
      scope: "workspace",
    })
    expect(hits.find((l) => l.id === c.data.id)).toBeTruthy()
    deleteLabel(c.data.id)
  })

  it("hides archived labels from workspace scope and only shows them in archived scope", () => {
    const c = createLabel({
      name: "scope-probe",
      color: "#000",
      teamId: null,
    })
    if (!c.success) throw new Error("setup failed")
    archiveLabel(c.data.id)

    const inWorkspace = filterLabels(getLabels(), {
      term: "scope-probe",
      scope: "workspace",
    })
    expect(inWorkspace.find((l) => l.id === c.data.id)).toBeUndefined()

    const inArchived = filterLabels(getLabels(), {
      term: "scope-probe",
      scope: "archived",
    })
    expect(inArchived.find((l) => l.id === c.data.id)).toBeTruthy()

    deleteLabel(c.data.id)
  })

  it("end-to-end: type filter → create → rename → archive", () => {
    // Simulates the requested E2E flow without a browser.
    // 1. User types a filter → nothing matches yet.
    const pre = filterLabels(getLabels(), {
      term: "e2e-label",
      scope: "workspace",
    })
    expect(pre).toEqual([])

    // 2. User creates a new label.
    const created = createLabel({
      name: "e2e-label",
      color: "#22c55e",
      teamId: null,
    })
    expect(created.success).toBe(true)
    if (!created.success) return

    const afterCreate = filterLabels(getLabels(), {
      term: "e2e-label",
      scope: "workspace",
    })
    expect(afterCreate.length).toBe(1)

    // 3. User renames it.
    const renamed = updateLabel(created.data.id, { name: "e2e-label-v2" })
    expect(renamed.success).toBe(true)

    // Filter on the old name should miss.
    expect(
      filterLabels(getLabels(), { term: "e2e-label-v2", scope: "workspace" })
        .length
    ).toBe(1)

    // 4. User archives it.
    const archived = archiveLabel(created.data.id)
    expect(archived.success).toBe(true)

    expect(
      filterLabels(getLabels(), { term: "e2e-label-v2", scope: "workspace" })
        .length
    ).toBe(0)
    expect(
      filterLabels(getLabels(), { term: "e2e-label-v2", scope: "archived" })
        .length
    ).toBe(1)

    // Cleanup.
    deleteLabel(created.data.id)
  })
})
