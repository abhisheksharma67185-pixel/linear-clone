"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { SiteConnection, SiteId, EpisodeHistoryEntry } from "./types"

// ---------------------------------------------------------------------------
// Default seed list — matches the port convention in each site's README.
// (shopify-admin @ 3000, linear @ 3001, jira @ 3002, slack @ 3003.)
// Inspector itself runs on 3010.
// ---------------------------------------------------------------------------

export const DEFAULT_SITES: SiteConnection[] = [
  { id: "shopify-admin", name: "Shopify Admin", url: "http://localhost:3000" },
  { id: "linear", name: "Linear", url: "http://localhost:3001" },
  { id: "jira", name: "Jira", url: "http://localhost:3002" },
  { id: "slack", name: "Slack", url: "http://localhost:3003" },
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sites: state.sites, history: state.history }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

export function useSiteById(id: SiteId): SiteConnection | undefined {
  return useSitesStore((s) => s.sites.find((site) => site.id === id))
}
