import { describe, expect, it } from "vitest"

// Side-effect import: registers the site adapter, all tasks, and predicates
// with @thetabench/core. Must come before any core lookup.
import "../app/lib/init-sim"

import {
  getAllTasks,
  getTaskCount,
  getCurriculum,
  hasActiveEpisode,
} from "@thetabench/core"

describe("jira engine smoke", () => {
  it("registers a non-empty task catalog", () => {
    expect(getTaskCount()).toBeGreaterThan(0)
    expect(getAllTasks().length).toBe(getTaskCount())
  })

  it("all registered tasks share the same site tag", () => {
    const tasks = getAllTasks()
    const sites = new Set(tasks.map((t) => t.site))
    expect(sites.size).toBe(1)
    const site = [...sites][0]
    expect(typeof site).toBe("string")
    expect(site).toBeTruthy()
  })

  it("task IDs are unique within the registry", () => {
    const tasks = getAllTasks()
    const ids = new Set(tasks.map((t) => t.id))
    expect(ids.size).toBe(tasks.length)
  })

  it("every task has the required scoring fields", () => {
    for (const t of getAllTasks()) {
      expect(t.id, `task missing id`).toBeTruthy()
      expect(t.title, `${t.id} missing title`).toBeTruthy()
      expect(t.goal, `${t.id} missing goal`).toBeTruthy()
      expect(t.domain, `${t.id} missing domain`).toBeTruthy()
      expect([
        "action",
        "retrieval",
        "action_retrieval",
        "no_action",
      ]).toContain(t.type)
      expect(["easy", "medium", "hard", "expert"]).toContain(t.difficulty)
      expect(typeof t.curriculumStage).toBe("number")
      expect(t.curriculumStage).toBeGreaterThanOrEqual(1)
      expect(t.curriculumStage).toBeLessThanOrEqual(10)
      expect(typeof t.maxSteps).toBe("number")
      expect(t.maxSteps).toBeGreaterThan(0)
      expect(Array.isArray(t.evalChecks)).toBe(true)
    }
  })

  it("returns a 10-stage curriculum", () => {
    const stages = getCurriculum()
    expect(stages.length).toBe(10)
    for (const s of stages) {
      expect(s.stage).toBeGreaterThanOrEqual(1)
      expect(s.stage).toBeLessThanOrEqual(10)
      expect(typeof s.title).toBe("string")
    }
  })

  it("starts with no active episode (clean engine state)", () => {
    expect(hasActiveEpisode()).toBe(false)
  })
})
