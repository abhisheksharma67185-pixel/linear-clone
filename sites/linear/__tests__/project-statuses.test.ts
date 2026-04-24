import { beforeEach, describe, expect, it } from "vitest"

import {
  STATUS_CATEGORIES,
  createStatus,
  deleteStatus,
  duplicateStatus,
  projectStatuses,
  updateStatus,
  usageCountFor,
  type ProjectStatus,
  type StatusCategory,
} from "../lib/project-statuses-mocks"

// Reset to the seeded default for each test so order counts stay stable.
beforeEach(() => {
  projectStatuses.length = 0
  STATUS_CATEGORIES.forEach((category, idx) => {
    const defaults: Record<StatusCategory, string> = {
      backlog: "#9ca3af",
      planned: "#a78bfa",
      "in-progress": "#f59e0b",
      completed: "#10b981",
      canceled: "#6b7280",
    }
    projectStatuses.push({
      id: `ps_default_${category.replace("-", "_")}`,
      name:
        category === "in-progress"
          ? "In Progress"
          : category.charAt(0).toUpperCase() + category.slice(1),
      description: "",
      color: defaults[category],
      category,
      order: idx * 1000,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    })
  })
})

describe("project statuses: seed", () => {
  it("has one default per category", () => {
    for (const cat of STATUS_CATEGORIES) {
      expect(projectStatuses.find((s) => s.category === cat)).toBeDefined()
    }
  })
})

describe("project statuses: creation in each category", () => {
  it.each(STATUS_CATEGORIES)(
    "creates a status in category %s",
    (category) => {
      const r = createStatus({
        name: `New ${category}`,
        description: "desc",
        color: "#000",
        category,
      })
      expect(r.success).toBe(true)
      if (r.success) {
        expect(r.data.category).toBe(category)
        expect(r.data.name).toBe(`New ${category}`)
      }
    }
  )

  it("rejects create without a name", () => {
    const r = createStatus({ name: "  ", category: "in-progress" })
    expect(r.success).toBe(false)
  })

  it("rejects create without a valid category", () => {
    // @ts-expect-error intentionally invalid
    const r = createStatus({ name: "X", category: "bogus" })
    expect(r.success).toBe(false)
  })
})

describe("project statuses: inline rename", () => {
  it("updates name via updateStatus", () => {
    const s = projectStatuses.find((x) => x.category === "planned")!
    const u = updateStatus(s.id, { name: "Scheduled" })
    expect(u.success).toBe(true)
    if (u.success) expect(u.data.name).toBe("Scheduled")
  })

  it("rejects empty rename", () => {
    const s = projectStatuses[0]
    const u = updateStatus(s.id, { name: "   " })
    expect(u.success).toBe(false)
  })
})

describe("project statuses: delete (with confirmation in UI)", () => {
  it("removes a status from the list", () => {
    const s = createStatus({
      name: "Temp",
      category: "backlog",
    })
    if (!s.success) throw new Error("setup")
    const d = deleteStatus(s.data.id)
    expect(d.success).toBe(true)
    expect(projectStatuses.find((x) => x.id === s.data.id)).toBeUndefined()
  })

  it("errors on delete of unknown id", () => {
    expect(deleteStatus("ps_nope").success).toBe(false)
  })
})

describe("project statuses: reorder within a category (order field)", () => {
  it("assigns increasing order within the same category", () => {
    const a = createStatus({ name: "A", category: "in-progress" })
    const b = createStatus({ name: "B", category: "in-progress" })
    if (a.success && b.success) {
      expect(b.data.order).toBeGreaterThan(a.data.order)
      expect(a.data.category).toBe("in-progress")
      expect(b.data.category).toBe("in-progress")
    } else {
      throw new Error("setup")
    }
  })

  it("persists a new order via updateStatus", () => {
    const a = createStatus({ name: "First", category: "planned" })
    if (!a.success) throw new Error("setup")
    const u = updateStatus(a.data.id, { order: 9999 })
    expect(u.success).toBe(true)
    if (u.success) expect(u.data.order).toBe(9999)
  })
})

describe("project statuses: usage count rendering rule", () => {
  // Mirrors the UI's show/hide rule for the "N projects" line: shown only when
  // usageCount > 0, otherwise the description placeholder takes its place.
  function shouldRenderUsageLine(status: ProjectStatus): boolean {
    return usageCountFor(status) > 0
  }

  it("default In Progress status has usage count derived from projects mock data", () => {
    const s = projectStatuses.find((x) => x.category === "in-progress")!
    expect(usageCountFor(s)).toBeGreaterThan(0)
    expect(shouldRenderUsageLine(s)).toBe(true)
  })

  it("user-created status in the same category has usageCount = 0", () => {
    const r = createStatus({ name: "Code Review", category: "in-progress" })
    if (!r.success) throw new Error("setup")
    expect(usageCountFor(r.data)).toBe(0)
    expect(shouldRenderUsageLine(r.data)).toBe(false)
  })

  it("usageCount is 0 for categories with no mapped project enum (backlog)", () => {
    const s = projectStatuses.find((x) => x.category === "backlog")!
    expect(usageCountFor(s)).toBe(0)
  })
})

describe("project statuses: duplicate", () => {
  it('appends a new status with "(copy)" suffix in same category', () => {
    const src = projectStatuses.find((x) => x.category === "completed")!
    const d = duplicateStatus(src.id)
    expect(d.success).toBe(true)
    if (d.success) {
      expect(d.data.name).toBe(`${src.name} (copy)`)
      expect(d.data.category).toBe("completed")
      expect(d.data.order).toBeGreaterThan(src.order)
    }
  })
})

describe('project statuses: "+" inserts exactly one editor row', () => {
  // Simulates the UI's single-draft gate: setting draft replaces any previous
  // draft instead of appending a new one.
  it("draft state is a single slot (not an array)", () => {
    type Draft = {
      category: StatusCategory
      name: string
      description: string
      color: string
    }
    let draft: Draft | null = null

    const startDraft = (category: StatusCategory) => {
      draft = { category, name: "", description: "", color: "#000" }
    }

    startDraft("backlog")
    startDraft("in-progress")
    startDraft("completed")
    // After three "+" clicks, there is still exactly ONE draft: the latest.
    expect(draft).not.toBeNull()
    expect((draft as unknown as Draft).category).toBe("completed")
  })
})
