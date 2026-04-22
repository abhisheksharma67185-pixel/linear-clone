import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  evaluateEpisodeRemote,
  fetchActionSpace,
  fetchAllTasks,
  fetchEpisode,
  fetchHealth,
  fetchLeaderboard,
  fetchObservation,
  fetchSnapshot,
  fetchState,
  fetchTasks,
  finishEpisodeRemote,
  resetEnvironment,
  startEpisodeRemote,
  stepEnvironment,
  submitLeaderboard,
} from "./api.js"

function jsonResponse(body: unknown, init?: { status?: number }): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: { "content-type": "application/json" },
  })
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const BASE = "http://api.local"

describe("typed API wrappers — URL/method/body construction", () => {
  it("fetchHealth → GET /api/health", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: "ok" }))
    const out = await fetchHealth(BASE)
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/health`)
    expect(fetchMock.mock.calls[0]![1]!.method).toBe("GET")
    expect(out).toEqual({ status: "ok" })
  })

  it("fetchTasks → GET /api/sim/tasks with no query when filters are empty", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ total: 0, filtered: 0, tasks: [] })
    )
    await fetchTasks(BASE)
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/sim/tasks`)
  })

  it("fetchTasks forwards filters as query params", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ total: 0, filtered: 0, tasks: [] })
    )
    await fetchTasks(BASE, { site: "shopify", limit: 5, difficulty: "hard" })
    const url = fetchMock.mock.calls[0]![0] as string
    expect(url).toContain("site=shopify")
    expect(url).toContain("limit=5")
    expect(url).toContain("difficulty=hard")
  })

  it("startEpisodeRemote → POST /api/sim/config with the payload", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        episode_id: "ep1",
        task: {
          id: "t1",
          title: "x",
          goal: "y",
          type: "action",
          difficulty: "easy",
          max_steps: 10,
          curriculum_stage: 1,
        },
        status: "running",
        initial_snapshot: {},
      })
    )
    const res = await startEpisodeRemote(BASE, { task_id: "t1", seed: 42 })
    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/sim/config`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({ task_id: "t1", seed: 42 })
    expect(res.episode_id).toBe("ep1")
  })

  it("fetchEpisode → GET /api/sim/episode (active=false shape)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ active: false }))
    const res = await fetchEpisode(BASE)
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/sim/episode`)
    expect(res).toEqual({ active: false })
  })

  it("finishEpisodeRemote omits agent_response when not provided (sends '{}')", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        episode_id: "e",
        task_id: "t",
        status: "complete",
        steps: 1,
        score: 0,
        total_reward: 0,
        wall_time_seconds: 0,
      })
    )
    await finishEpisodeRemote(BASE)
    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/sim/finish`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({})
  })

  it("finishEpisodeRemote forwards agent_response when provided", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        episode_id: "e",
        task_id: "t",
        status: "complete",
        steps: 1,
        score: 1,
        total_reward: 0,
        wall_time_seconds: 0,
      })
    )
    await finishEpisodeRemote(BASE, "29.99")
    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body as string)).toEqual({
      agent_response: "29.99",
    })
  })

  it("evaluateEpisodeRemote → POST /api/sim/evaluate with empty body", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ passed: 1, total: 1, checks: [] })
    )
    await evaluateEpisodeRemote(BASE)
    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/sim/evaluate`)
    expect(init.method).toBe("POST")
    expect(init.body).toBe(JSON.stringify({}))
  })

  it("fetchSnapshot → GET /api/sim/snapshot", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: {} }))
    await fetchSnapshot(BASE)
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/sim/snapshot`)
  })

  it("fetchState → GET /api/sim/state", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    await fetchState(BASE)
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/sim/state`)
  })

  it("fetchLeaderboard → GET /api/sim/leaderboard", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ total: 0, entries: [] }))
    const res = await fetchLeaderboard(BASE)
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/sim/leaderboard`)
    expect(res.entries).toEqual([])
  })

  it("submitLeaderboard → POST /api/sim/leaderboard with the entry payload", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: "x", rank: 1, message: "ok" })
    )
    await submitLeaderboard(BASE, {
      agentName: "a",
      modelName: "m",
      mode: "rest",
    })
    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/sim/leaderboard`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      agentName: "a",
      modelName: "m",
      mode: "rest",
    })
  })

  it("fetchObservation → GET /api/rl", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ observation: { currentPage: "/" }, info: {} })
    )
    const res = await fetchObservation(BASE)
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/rl`)
    expect(res.observation.currentPage).toBe("/")
  })

  it("stepEnvironment → POST /api/rl with the action object", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        observation: {},
        reward: 0.5,
        done: false,
        truncated: false,
      })
    )
    await stepEnvironment(BASE, { action: "navigate", target: "/board" })
    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/rl`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      action: "navigate",
      target: "/board",
    })
  })

  it("resetEnvironment → POST /api/rl/reset with empty body", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: "ok", observation: {} })
    )
    await resetEnvironment(BASE)
    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/rl/reset`)
    expect(init.method).toBe("POST")
    expect(init.body).toBe(JSON.stringify({}))
  })

  it("fetchActionSpace → GET /api/rl/action-space", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ version: "1", actions: [] }))
    await fetchActionSpace(BASE)
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/rl/action-space`)
  })

  it("fetchAllTasks aliases fetchTasks (no filters)", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ total: 0, filtered: 0, tasks: [] })
    )
    await fetchAllTasks(BASE)
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASE}/api/sim/tasks`)
  })
})
