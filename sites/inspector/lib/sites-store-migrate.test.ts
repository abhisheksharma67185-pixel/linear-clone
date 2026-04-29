// ---------------------------------------------------------------------------
// Persist-version migration tests for the inspector's site store.
//
// Earlier versions of the store seeded only 4 sites (shopify-admin, linear,
// jira, slack). v2 grew to 6 (added zendesk, plain) and switched URLs to
// env-driven overrides. Returning users must keep their custom-added sites
// while gaining the new defaults.
// ---------------------------------------------------------------------------

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { useSitesStore, DEFAULT_SITES } from "./sites-store"

const STORE_KEY = "thetabench-inspector:sites"

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

function seedV1(state: { sites: unknown[]; history?: unknown[] }) {
  localStorage.setItem(
    STORE_KEY,
    JSON.stringify({ state: { history: [], ...state }, version: 1 })
  )
}

async function rehydrate() {
  // Trigger a fresh rehydration from localStorage.
  await useSitesStore.persist.rehydrate()
  return useSitesStore.getState()
}

describe("v1 → v2 migration", () => {
  it("re-seeds the 6 default ids when the cache only has the original 4", async () => {
    seedV1({
      sites: [
        {
          id: "shopify-admin",
          name: "Shopify Admin",
          url: "http://localhost:3000",
        },
        { id: "linear", name: "Linear", url: "http://localhost:3001" },
        { id: "jira", name: "Jira", url: "http://localhost:3002" },
        { id: "slack", name: "Slack", url: "http://localhost:3003" },
      ],
    })

    const state = await rehydrate()

    expect(state.sites).toHaveLength(DEFAULT_SITES.length)
    expect(state.sites.map((s) => s.id)).toEqual(DEFAULT_SITES.map((s) => s.id))
    // The two new defaults are present
    expect(state.sites.find((s) => s.id === "zendesk")).toBeDefined()
    expect(state.sites.find((s) => s.id === "plain")).toBeDefined()
  })

  it("preserves user-added custom sites alongside the new defaults", async () => {
    seedV1({
      sites: [
        {
          id: "shopify-admin",
          name: "Shopify Admin",
          url: "http://localhost:3000",
        },
        { id: "linear", name: "Linear", url: "http://localhost:3001" },
        { id: "jira", name: "Jira", url: "http://localhost:3002" },
        { id: "slack", name: "Slack", url: "http://localhost:3003" },
        { id: "my-app", name: "My App", url: "https://my-app.example.com" },
      ],
    })

    const state = await rehydrate()

    // 6 defaults + 1 custom
    expect(state.sites).toHaveLength(DEFAULT_SITES.length + 1)
    const custom = state.sites.find((s) => s.id === "my-app")
    expect(custom).toEqual({
      id: "my-app",
      name: "My App",
      url: "https://my-app.example.com",
    })
  })

  it("preserves history through the migration", async () => {
    const oldEpisode = {
      episodeId: "ep_old",
      siteId: "jira",
      taskId: "t1",
      taskTitle: "Old episode",
      startedAt: "2026-04-20T00:00:00Z",
      status: "completed" as const,
    }
    seedV1({
      sites: [
        {
          id: "shopify-admin",
          name: "Shopify Admin",
          url: "http://localhost:3000",
        },
      ],
      history: [oldEpisode],
    })

    const state = await rehydrate()

    expect(state.history).toHaveLength(1)
    expect(state.history[0]).toMatchObject({ episodeId: "ep_old" })
  })

  it("handles a corrupted v1 cache by falling back to defaults", async () => {
    // Sites field missing entirely — migration should still produce 6 defaults.
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ state: { history: [] }, version: 1 })
    )

    const state = await rehydrate()

    expect(state.sites.map((s) => s.id)).toEqual(DEFAULT_SITES.map((s) => s.id))
  })
})
