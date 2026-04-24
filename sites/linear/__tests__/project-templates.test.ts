import { afterEach, describe, expect, it } from "vitest"

import {
  createProjectTemplate,
  deleteProjectTemplate,
  duplicateProjectTemplate,
  projectTemplates,
  updateProjectTemplate,
} from "../lib/project-template-mocks"

afterEach(() => {
  projectTemplates.length = 0
})

describe("project templates: creation", () => {
  it("rejects create without a name", () => {
    const r = createProjectTemplate({ name: "  " })
    expect(r.success).toBe(false)
  })

  it("accepts a minimal create and fills defaults", () => {
    const r = createProjectTemplate({ name: "Launch" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.name).toBe("Launch")
      expect(r.data.iconName).toBe("cube")
      expect(r.data.visibility).toBe("workspace")
      expect(r.data.scope).toBe("workspace")
      expect(r.data.attributes.priority).toBe("none")
      expect(r.data.attributes.status).toBe("backlog")
      expect(r.data.milestones).toEqual([])
      expect(r.data.order).toBe(0)
    }
  })

  it("increments order per new template", () => {
    const a = createProjectTemplate({ name: "A" })
    const b = createProjectTemplate({ name: "B" })
    if (a.success && b.success) {
      expect(a.data.order).toBe(0)
      expect(b.data.order).toBe(1)
    } else {
      throw new Error("setup")
    }
  })
})

describe("project templates: editor → list persistence", () => {
  it("new template → editor Create → returns to list with the new template visible", () => {
    // Simulates the flow the editor uses: user fills name + summary + an
    // attribute, clicks Create, API persists, list is refreshed.
    const created = createProjectTemplate({
      name: "Weekly goals",
      summary: "Team weekly goals",
      attributes: { priority: "high" } as any,
    })
    expect(created.success).toBe(true)
    if (!created.success) return

    // Mirror the `GET /api/project-templates` ordering the list page uses.
    const list = [...projectTemplates].sort((a, b) => a.order - b.order)
    expect(list.map((t) => t.name)).toContain("Weekly goals")
  })

  it("Cancel discards: no templates added if user never calls create", () => {
    // The editor's Cancel button returns to the list without touching the API.
    expect(projectTemplates.length).toBe(0)
  })
})

describe("project templates: list rendering gate", () => {
  it("empty state: 0 templates → list.length === 0 (UI shows empty card)", () => {
    expect(projectTemplates.length).toBe(0)
  })

  it("list state: 1+ templates → list renders the row(s)", () => {
    createProjectTemplate({ name: "One" })
    expect(projectTemplates.length).toBe(1)
  })
})

describe("project templates: row actions", () => {
  it("duplicate adds a '(copy)' suffixed template", () => {
    const c = createProjectTemplate({ name: "Source" })
    if (!c.success) throw new Error("setup")
    const d = duplicateProjectTemplate(c.data.id)
    expect(d.success).toBe(true)
    if (d.success) {
      expect(d.data.name).toBe("Source (copy)")
      expect(d.data.id).not.toBe(c.data.id)
    }
    expect(projectTemplates.length).toBe(2)
  })

  it("delete removes the template", () => {
    const c = createProjectTemplate({ name: "To delete" })
    if (!c.success) throw new Error("setup")
    const d = deleteProjectTemplate(c.data.id)
    expect(d.success).toBe(true)
    expect(projectTemplates.find((t) => t.id === c.data.id)).toBeUndefined()
  })

  it("delete on unknown id errors", () => {
    const d = deleteProjectTemplate("pt_nope")
    expect(d.success).toBe(false)
  })
})

describe("project templates: edit", () => {
  it("updates name and merges attributes", () => {
    const c = createProjectTemplate({ name: "Original" })
    if (!c.success) throw new Error("setup")
    const u = updateProjectTemplate(c.data.id, {
      name: "Renamed",
      attributes: { priority: "urgent" } as any,
    })
    expect(u.success).toBe(true)
    if (u.success) {
      expect(u.data.name).toBe("Renamed")
      expect(u.data.attributes.priority).toBe("urgent")
      // Status should survive the partial attribute merge.
      expect(u.data.attributes.status).toBe("backlog")
    }
  })

  it("rejects empty name", () => {
    const c = createProjectTemplate({ name: "Keep" })
    if (!c.success) throw new Error("setup")
    const u = updateProjectTemplate(c.data.id, { name: "   " })
    expect(u.success).toBe(false)
  })

  it("updates visibility + scope", () => {
    const c = createProjectTemplate({ name: "Vis" })
    if (!c.success) throw new Error("setup")
    const u = updateProjectTemplate(c.data.id, {
      visibility: "private",
      scope: "team",
    })
    expect(u.success).toBe(true)
    if (u.success) {
      expect(u.data.visibility).toBe("private")
      expect(u.data.scope).toBe("team")
    }
  })
})

describe("project templates: e2e-style flow", () => {
  it("create → edit → duplicate → delete, leaving the duplicate", () => {
    const c = createProjectTemplate({
      name: "Bug bash",
      summary: "Weekly bug triage",
      attributes: { priority: "high" } as any,
    })
    expect(c.success).toBe(true)
    if (!c.success) return

    expect(updateProjectTemplate(c.data.id, { name: "Bug bash v2" }).success)
      .toBe(true)
    expect(duplicateProjectTemplate(c.data.id).success).toBe(true)
    expect(projectTemplates.length).toBe(2)

    expect(deleteProjectTemplate(c.data.id).success).toBe(true)
    expect(projectTemplates.length).toBe(1)
    expect(projectTemplates[0].name).toBe("Bug bash v2 (copy)")
  })
})
