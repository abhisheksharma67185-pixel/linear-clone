"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { SiteConnection, SiteId, EpisodeHistoryEntry } from "./types"

// ---------------------------------------------------------------------------
// Default seed list — six conventional sites on their conventional ports
// (shopify-admin @ 3000, linear @ 3001, jira @ 3002, slack @ 3003,
// zendesk @ 3004, plain @ 3005). Inspector itself runs on 3010.
// NEXT_PUBLIC_SITE_URL_<ID> overrides per-site for deployed builds (set on
// Vercel so prod points at the corresponding theta-* URLs).
// ---------------------------------------------------------------------------

// Each NEXT_PUBLIC_* must be a static string literal — Next.js only inlines
// process.env.NEXT_PUBLIC_FOO at build time when accessed by exact key.
// Dynamic process.env[key] is NOT replaced and would always read undefined
// in the browser bundle.
const SITE_URL_OVERRIDES: Record<string, string | undefined> = {
  "shopify-admin": process.env.NEXT_PUBLIC_SITE_URL_SHOPIFY_ADMIN,
  linear: process.env.NEXT_PUBLIC_SITE_URL_LINEAR,
  jira: process.env.NEXT_PUBLIC_SITE_URL_JIRA,
  slack: process.env.NEXT_PUBLIC_SITE_URL_SLACK,
  zendesk: process.env.NEXT_PUBLIC_SITE_URL_ZENDESK,
  plain: process.env.NEXT_PUBLIC_SITE_URL_PLAIN,
}

function siteUrl(id: string, fallback: string): string {
  return SITE_URL_OVERRIDES[id] ?? fallback
}

export const DEFAULT_SITES: SiteConnection[] = [
  {
    id: "shopify-admin",
    name: "Shopify Admin",
    url: siteUrl("shopify-admin", "http://localhost:3000"),
  },
  {
    id: "linear",
    name: "Linear",
    url: siteUrl("linear", "http://localhost:3001"),
  },
  { id: "jira", name: "Jira", url: siteUrl("jira", "http://localhost:3002") },
  {
    id: "slack",
    name: "Slack",
    url: siteUrl("slack", "http://localhost:3003"),
  },
  {
    id: "zendesk",
    name: "Zendesk",
    url: siteUrl("zendesk", "http://localhost:3004"),
  },
  {
    id: "plain",
    name: "Plain",
    url: siteUrl("plain", "http://localhost:3005"),
  },
]

interface SitesState {
  sites: SiteConnection[]
  history: EpisodeHistoryEntry[]
  hydrated: boolean
  addSite: (site: Omit<SiteConnection, "id"> & { id?: string }) => void
  updateSite: (id: SiteId, patch: Partial<SiteConnection>) => void
  removeSite: (id: SiteId) => void
  resetDefaults: () => void
  pushHistory: (entry: EpisodeHistoryEntry) => void
  updateHistory: (
    episodeId: string,
    patch: Partial<EpisodeHistoryEntry>
  ) => void
  clearHistory: () => void
  setHydrated: (value: boolean) => void
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    `site-${Math.random().toString(36).slice(2, 7)}`
  )
}

// We keep up to this many episode rows around. History is cosmetic — the
// engine is the source of truth — so capping it keeps localStorage healthy.
const MAX_HISTORY = 50

export const useSitesStore = create<SitesState>()(
  persist(
    (set, get) => ({
      sites: DEFAULT_SITES,
      history: [],
      hydrated: false,
      addSite: (site) => {
        const id = site.id ?? slugify(site.name)
        if (get().sites.some((s) => s.id === id)) {
          // If ID collides, append a short suffix to avoid accidental overwrite.
          const suffixed = `${id}-${Math.random().toString(36).slice(2, 5)}`
          set((s) => ({
            sites: [
              ...s.sites,
              { id: suffixed, name: site.name, url: site.url },
            ],
          }))
          return
        }
        set((s) => ({
          sites: [...s.sites, { id, name: site.name, url: site.url }],
        }))
      },
      updateSite: (id, patch) =>
        set((s) => ({
          sites: s.sites.map((site) =>
            site.id === id ? { ...site, ...patch, id: site.id } : site
          ),
        })),
      removeSite: (id) =>
        set((s) => ({ sites: s.sites.filter((site) => site.id !== id) })),
      resetDefaults: () => set({ sites: DEFAULT_SITES }),
      pushHistory: (entry) =>
        set((s) => ({
          history: [
            entry,
            ...s.history.filter((h) => h.episodeId !== entry.episodeId),
          ].slice(0, MAX_HISTORY),
        })),
      updateHistory: (episodeId, patch) =>
        set((s) => ({
          history: s.history.map((h) =>
            h.episodeId === episodeId ? { ...h, ...patch } : h
          ),
        })),
      clearHistory: () => set({ history: [] }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "thetabench-inspector:sites",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sites: state.sites, history: state.history }),
      // v1 → v2: defaults grew from 4 → 6 (added zendesk, plain) and prod URLs
      // moved to env vars. Re-seed the default ids with current URLs while
      // preserving any user-added custom sites.
      migrate: (persisted, version) => {
        const state = (persisted as Partial<SitesState>) ?? {}
        if (version < 2) {
          const defaultIds = new Set(DEFAULT_SITES.map((s) => s.id))
          const userAdded = (state.sites ?? []).filter(
            (s) => !defaultIds.has(s.id)
          )
          return { ...state, sites: [...DEFAULT_SITES, ...userAdded] }
        }
        return state
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

export function useSiteById(id: SiteId): SiteConnection | undefined {
  return useSitesStore((s) => s.sites.find((site) => site.id === id))
}
