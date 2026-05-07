// Per-rollout state isolation — uses runWithSession() to drive the store
// from outside an HTTP request, then verifies that mutations in one session
// don't leak into another. This is the test gap the slack site was missing
// before the refactor (only smoke.test.ts existed).

import { afterEach, describe, expect, it } from "vitest"

import * as store from "../app/lib/store"
import {
  _state,
  deleteSession,
  listSessions,
  resetSession,
  runWithSession,
} from "../app/lib/session"

afterEach(() => {
  // Drop sessions created by the test so subsequent tests start clean.
  for (const id of listSessions()) {
    if (id.startsWith("test-")) deleteSession(id)
  }
  // Restore the default session in case any prior test mutated it.
  resetSession("default")
})

describe("session isolation", () => {
  it("createChannel in session A does not leak into session B", () => {
    const aBefore = runWithSession("test-A", () => store.getChannels().length)
    const bBefore = runWithSession("test-B", () => store.getChannels().length)
    expect(aBefore).toBe(bBefore) // both start from the same seed

    const created = runWithSession("test-A", () =>
      store.createChannel({ name: "iso-test-a", type: "public" })
    )
    expect(created.success).toBe(true)

    const aAfter = runWithSession("test-A", () => store.getChannels().length)
    const bAfter = runWithSession("test-B", () => store.getChannels().length)
    expect(aAfter).toBe(aBefore + 1)
    expect(bAfter).toBe(bBefore) // session B is unchanged
  })

  it("workspace + preferences singletons are per-session", () => {
    runWithSession("test-A", () => store.setPreference("theme", "midnight"))
    runWithSession("test-B", () => store.setPreference("theme", "default"))

    const aTheme = runWithSession(
      "test-A",
      () => (store.getPreferences() as Record<string, unknown>).theme
    )
    const bTheme = runWithSession(
      "test-B",
      () => (store.getPreferences() as Record<string, unknown>).theme
    )
    expect(aTheme).toBe("midnight")
    expect(bTheme).toBe("default")
  })

  it("RL state (currentPage, stepCount) is per-session", () => {
    runWithSession("test-A", () => {
      _state().rl.currentPage = "/c/random"
      _state().rl.stepCount = 5
    })
    runWithSession("test-B", () => {
      _state().rl.currentPage = "/dms"
      _state().rl.stepCount = 99
    })

    const a = runWithSession("test-A", () => ({ ..._state().rl }))
    const b = runWithSession("test-B", () => ({ ..._state().rl }))
    expect(a.currentPage).toBe("/c/random")
    expect(a.stepCount).toBe(5)
    expect(b.currentPage).toBe("/dms")
    expect(b.stepCount).toBe(99)
  })

  it("counters (nextChannelId etc) advance independently per session", () => {
    const aFirst = runWithSession("test-A", () => {
      const r = store.createChannel({ name: "counter-test", type: "public" })
      return r.success ? r.data.id : null
    })
    const bFirst = runWithSession("test-B", () => {
      const r = store.createChannel({ name: "counter-test", type: "public" })
      return r.success ? r.data.id : null
    })
    // Same id because each session has its own nextChannelId counter.
    expect(aFirst).not.toBeNull()
    expect(bFirst).toBe(aFirst)
  })

  it("resetSession wipes only the targeted session", () => {
    runWithSession("test-A", () => {
      store.createChannel({ name: "before-reset-a", type: "public" })
    })
    runWithSession("test-B", () => {
      store.createChannel({ name: "before-reset-b", type: "public" })
    })

    resetSession("test-A")

    const aHas = runWithSession("test-A", () =>
      store.getChannels().some((c) => c.name === "before-reset-a")
    )
    const bHas = runWithSession("test-B", () =>
      store.getChannels().some((c) => c.name === "before-reset-b")
    )
    expect(aHas).toBe(false) // A was reset
    expect(bHas).toBe(true) // B unaffected
  })

  it("chaos config writes via applyConfig land on the right session", () => {
    // Simulate what slackAdapter.applyConfig does for two parallel rollouts.
    runWithSession("test-A", () => {
      _state().chaos.latencyMs = 250
      _state().chaos.errorRate = 0.1
    })
    runWithSession("test-B", () => {
      _state().chaos.latencyMs = 0
      _state().chaos.errorRate = 0
    })

    const a = runWithSession("test-A", () => ({ ..._state().chaos }))
    const b = runWithSession("test-B", () => ({ ..._state().chaos }))
    expect(a.latencyMs).toBe(250)
    expect(a.errorRate).toBeCloseTo(0.1)
    expect(b.latencyMs).toBe(0)
    expect(b.errorRate).toBe(0)
  })

  it("default session continues to work outside withSession (vitest path)", () => {
    // Calls outside any runWithSession resolve to the "default" session.
    // This preserves behavior for RSC pages, vitest tests, and any
    // un-migrated callers.
    const channelsBefore = store.getChannels().length
    const result = store.createChannel({
      name: "default-session-test",
      type: "public",
    })
    expect(result.success).toBe(true)
    expect(store.getChannels().length).toBe(channelsBefore + 1)
  })
})
