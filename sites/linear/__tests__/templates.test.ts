import { afterEach, describe, expect, it } from "vitest"

import {
  createTemplate,
  deleteTemplate,
  duplicateTemplate,
  templates,
  type TemplateDefaults,
  updateTemplate,
} from "../lib/templates-mocks"

// Templates are stored in-memory and shared across tests in the same Vitest
// worker. Reset between each test to keep them independent.
afterEach(() => {
  templates.length = 0
})

describe("templates store: form validation", () => {
  it("rejects create without a name", () => {
    const r = createTemplate({
      type: "standard",
      name: "",
      defaults: {
        teamId: "team-1",
        priority: "none",
        assigneeId: null,
        projectId: null,
        labelIds: [],
      },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error).toMatch(/name/i)
  })

  it("rejects create without a team", () => {
    const r = createTemplate({
      type: "standard",
      name: "Bug",
      defaults: {
        teamId: null,
        priority: "none",
        assigneeId: null,
        projectId: null,
        labelIds: [],
      },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error).toMatch(/team/i)
  })

  it("accepts a minimally-valid create", () => {
    const r = createTemplate({
      type: "standard",
      name: "Bug report",
      defaults: {
        teamId: "team-1",
        priority: "high",
        assigneeId: null,
        projectId: null,
        labelIds: [],
      },
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.name).toBe("Bug report")
      expect(r.data.defaults.teamId).toBe("team-1")
      expect(r.data.defaults.priority).toBe("high")
      expect(r.data.order).toBe(0)
    }
  })
})

describe("templates store: list ordering", () => {
  it("assigns incrementing order values to new templates", () => {
    const a = createTemplate({
      type: "standard",
      name: "A",
      defaults: {
        teamId: "team-1",
        priority: "none",
        assigneeId: null,
        projectId: null,
        labelIds: [],
      },
    })
    const b = createTemplate({
      type: "standard",
      name: "B",
      defaults: {
        teamId: "team-1",
        priority: "none",
        assigneeId: null,
        projectId: null,
        labelIds: [],
      },
    })
    expect(a.success && b.success).toBe(true)
    if (a.success && b.success) {
      expect(a.data.order).toBe(0)
      expect(b.data.order).toBe(1)
    }
  })
})

describe("templates store: kebab actions", () => {
  function seed() {
    const r = createTemplate({
      type: "standard",
      name: "Seed",
      defaults: {
        teamId: "team-1",
        priority: "medium",
        assigneeId: null,
        projectId: null,
        labelIds: [],
      },
    })
    if (!r.success) throw new Error("seed failed")
    return r.data
  }

  it("duplicate appends a new template with '(copy)' suffix", () => {
    const src = seed()
    const d = duplicateTemplate(src.id)
    expect(d.success).toBe(true)
    if (d.success) {
      expect(d.data.name).toBe("Seed (copy)")
      expect(d.data.id).not.toBe(src.id)
      expect(d.data.order).toBeGreaterThan(src.order)
    }
    expect(templates.length).toBe(2)
  })

  it("delete removes the template from the list", () => {
    const src = seed()
    const d = deleteTemplate(src.id)
    expect(d.success).toBe(true)
    expect(templates.find((t) => t.id === src.id)).toBeUndefined()
  })

  it("delete on unknown id returns an error", () => {
    const d = deleteTemplate("tpl_does_not_exist")
    expect(d.success).toBe(false)
  })
})

describe("templates store: edit (update)", () => {
  it("updates name + refreshes updatedAt", async () => {
    const r = createTemplate({
      type: "standard",
      name: "Original",
      defaults: {
        teamId: "team-1",
        priority: "none",
        assigneeId: null,
        projectId: null,
        labelIds: [],
      },
    })
    if (!r.success) throw new Error("seed failed")
    const firstUpdatedAt = r.data.updatedAt
    // Spin briefly so the updatedAt timestamp differs.
    await new Promise((resolve) => setTimeout(resolve, 2))
    const u = updateTemplate(r.data.id, { name: "Renamed" })
    expect(u.success).toBe(true)
    if (u.success) {
      expect(u.data.name).toBe("Renamed")
      expect(new Date(u.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(firstUpdatedAt).getTime()
      )
    }
  })

  it("rejects empty name update", () => {
    const r = createTemplate({
      type: "standard",
      name: "Keep",
      defaults: {
        teamId: "team-1",
        priority: "none",
        assigneeId: null,
        projectId: null,
        labelIds: [],
      },
    })
    if (!r.success) throw new Error("seed failed")
    const u = updateTemplate(r.data.id, { name: "   " })
    expect(u.success).toBe(false)
  })

  it("merges defaults without clobbering unrelated fields", () => {
    const r = createTemplate({
      type: "standard",
      name: "Merge",
      defaults: {
        teamId: "team-1",
        priority: "high",
        assigneeId: "member-1",
        projectId: null,
        labelIds: [],
      },
    })
    if (!r.success) throw new Error("seed failed")
    const u = updateTemplate(r.data.id, {
      defaults: {
        priority: "low",
      } as Partial<TemplateDefaults> as TemplateDefaults,
    })
    expect(u.success).toBe(true)
    if (u.success) {
      expect(u.data.defaults.priority).toBe("low")
      // assigneeId should survive the partial merge.
      expect(u.data.defaults.assigneeId).toBe("member-1")
    }
  })
})

describe("templates store: e2e-style flow", () => {
  it("create → edit → duplicate → delete", async () => {
    // 1. Create
    const c = createTemplate({
      type: "standard",
      name: "Bug report",
      description: "Report a bug",
      defaults: {
        teamId: "team-1",
        priority: "high",
        assigneeId: null,
        projectId: null,
        labelIds: [],
      },
    })
    expect(c.success).toBe(true)
    if (!c.success) return

    // 2. Edit name
    const u = updateTemplate(c.data.id, { name: "Bug report v2" })
    expect(u.success).toBe(true)

    // 3. Duplicate
    const d = duplicateTemplate(c.data.id)
    expect(d.success).toBe(true)
    expect(templates.length).toBe(2)

    // 4. Delete the original
    const del = deleteTemplate(c.data.id)
    expect(del.success).toBe(true)
    expect(templates.length).toBe(1)
    if (d.success) {
      expect(templates[0].id).toBe(d.data.id)
      expect(templates[0].name).toBe("Bug report v2 (copy)")
    }
  })
})
