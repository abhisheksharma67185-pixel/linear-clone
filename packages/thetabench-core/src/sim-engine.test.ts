import { describe, it, expect, beforeEach } from "vitest"
import { SimEngine, defaultEngine } from "./sim-engine"
import type { SiteAdapter } from "./episode"
import type { TaskDefinition } from "./tasks/types"

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeAdapter(initialState: Record<string, unknown>): SiteAdapter {
  let state: Record<string, unknown> = structuredClone(initialState)
  let appliedConfig: Record<string, unknown> = {}
  return {
    getState: () => state,
    reset: () => {
      state = structuredClone(initialState)
      appliedConfig = {}
    },
    executeMutation: (name, args) => {
      if (name === "set") {
        const [key, value] = args as [string, unknown]
        state = { ...state, [key]: value }
      }
    },
    collections: ["items"],
    singletons: ["settings"],
    applyConfig: (cfg) => {
      appliedConfig = { ...appliedConfig, ...cfg }
    },
  }
}

const baseTask: TaskDefinition = {
  id: "t-iso",
  site: "test",
  domain: "products",
  type: "action",
  difficulty: "easy",
  curriculumStage: 1,
  title: "Iso task",
  goal: "isolation check",
  maxSteps: 5,
  tags: [],
  evalChecks: [],
  rewardProfile: {
    completion: 1,
    stepPenalty: -0.01,
    invalidActionPenalty: -0.1,
  },
}

// ---------------------------------------------------------------------------
// Per-instance isolation — the whole point of Phase 1
// ---------------------------------------------------------------------------

describe("SimEngine — per-instance isolation", () => {
  it("two engines hold independent task registries", () => {
    const a = new SimEngine()
    const b = new SimEngine()

    a.registerTasks([{ ...baseTask, id: "only-on-a" }])
    b.registerTasks([
      { ...baseTask, id: "only-on-b-1" },
      { ...baseTask, id: "only-on-b-2" },
    ])

    expect(a.getTaskCount()).toBe(1)
    expect(b.getTaskCount()).toBe(2)
    expect(a.getTaskById("only-on-a")).toBeDefined()
    expect(a.getTaskById("only-on-b-1")).toBeUndefined()
    expect(b.getTaskById("only-on-a")).toBeUndefined()
  })

  it("two engines hold independent universal config", () => {
    const a = new SimEngine()
    const b = new SimEngine()

    a.applyUniversalConfig({ latency: 250 })
    b.applyUniversalConfig({ latency: 50, locale: "fr-FR" })

    expect(a.getUniversalConfig().latency).toBe(250)
    expect(a.getUniversalConfig().locale).toBe("en-US")
    expect(b.getUniversalConfig().latency).toBe(50)
    expect(b.getUniversalConfig().locale).toBe("fr-FR")
  })

  it("two engines hold independent active episodes + adapters", () => {
    const a = new SimEngine()
    const b = new SimEngine()
    a.registerSiteAdapter(makeAdapter({ items: [] }))
    b.registerSiteAdapter(makeAdapter({ items: [] }))
    a.registerTasks([baseTask])
    b.registerTasks([baseTask])

    a.startEpisode({ taskId: "t-iso", seed: 1 })

    expect(a.hasActiveEpisode()).toBe(true)
    expect(b.hasActiveEpisode()).toBe(false)

    b.startEpisode({ taskId: "t-iso", seed: 99 })
    expect(a.getActiveEpisode()?.config.seed).toBe(1)
    expect(b.getActiveEpisode()?.config.seed).toBe(99)
  })

  it("predicates registered on one engine are not visible on the other", () => {
    const a = new SimEngine()
    const b = new SimEngine()

    a.registerPredicate("only_a", () => true)

    expect(a.getPredicate("only_a")).toBeDefined()
    expect(b.getPredicate("only_a")).toBeUndefined()
  })

  it("each engine starts with the three built-in predicates", () => {
    const a = new SimEngine()
    expect(a.getPredicate("field_equals")).toBeDefined()
    expect(a.getPredicate("entity_exists_with_field")).toBeDefined()
    expect(a.getPredicate("collection_count_equals")).toBeDefined()
  })

  it("clearPredicates wipes only this engine's registry", () => {
    const a = new SimEngine()
    const b = new SimEngine()

    a.registerPredicate("custom", () => true)
    b.registerPredicate("custom", () => true)
    a.clearPredicates()

    expect(a.getPredicate("custom")).toBeUndefined()
    expect(a.getPredicate("field_equals")).toBeUndefined()
    expect(b.getPredicate("custom")).toBeDefined()
    expect(b.getPredicate("field_equals")).toBeDefined()
  })

  it("registerTasks ignores duplicate IDs within a single engine", () => {
    const a = new SimEngine()
    a.registerTasks([baseTask, { ...baseTask, title: "Dupe" }])
    expect(a.getTaskCount()).toBe(1)
    expect(a.getTaskById("t-iso")?.title).toBe("Iso task")
  })

  it("getTasksByCriteria filters per engine", () => {
    const a = new SimEngine()
    a.registerTasks([
      { ...baseTask, id: "t1", domain: "products", difficulty: "easy" },
      { ...baseTask, id: "t2", domain: "products", difficulty: "hard" },
      { ...baseTask, id: "t3", domain: "orders", difficulty: "easy" },
    ])

    expect(a.getTasksByCriteria({ domain: "products" })).toHaveLength(2)
    expect(a.getTasksByCriteria({ difficulty: "easy" })).toHaveLength(2)
    expect(
      a.getTasksByCriteria({ domain: "products", difficulty: "hard" })
    ).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// Backward-compat shims — free-function exports must still proxy through
// `defaultEngine` so existing sites + the SDK contract are unchanged.
// ---------------------------------------------------------------------------

describe("SimEngine — defaultEngine proxy via free-function shims", () => {
  beforeEach(() => {
    // Universal config is shared across this test file; reset between cases.
    defaultEngine.resetUniversalConfig()
  })

  it("config.ts shims read/write defaultEngine.config", async () => {
    const cfg = await import("./config")
    cfg.applyUniversalConfig({ latency: 123 })
    expect(defaultEngine.getUniversalConfig().latency).toBe(123)
    expect(cfg.getUniversalConfig().latency).toBe(123)

    cfg.resetUniversalConfig()
    expect(cfg.getUniversalConfig().latency).toBe(0)
    expect(defaultEngine.getUniversalConfig().latency).toBe(0)
  })

  it("predicates.ts shims read/write defaultEngine.predicates", async () => {
    const p = await import("./predicates")
    p.registerPredicate("__shim_check", () => true)
    expect(defaultEngine.getPredicate("__shim_check")).toBeDefined()
    expect(p.getPredicate("__shim_check")).toBeDefined()
  })

  it("episode.ts adapter/episode shims target defaultEngine", async () => {
    const ep = await import("./episode")
    const adapter = makeAdapter({ items: [] })
    ep.registerSiteAdapter(adapter)
    expect(defaultEngine.hasActiveEpisode()).toBe(false)
  })
})
