"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "./api-client"
import { qk } from "./query-keys"
import type {
  SiteConnection,
  HealthResponse,
  TasksResponse,
  RLGetResponse,
} from "./types"

// ---------------------------------------------------------------------------
// React Query hooks. Each one is keyed by site so multiple sites can be
// inspected in parallel without state collisions.
// ---------------------------------------------------------------------------

export function useHealth(site: SiteConnection | undefined) {
  return useQuery({
    queryKey: site ? qk.health(site.id) : ["health", "none"],
    enabled: !!site,
    staleTime: 30_000,
    refetchInterval: 30_000,
    queryFn: () => api.get<HealthResponse>(site!, "/api/health"),
  })
}

export function useTasks(
  site: SiteConnection | undefined,
  params?: {
    domain?: string
    difficulty?: string
    type?: string
    stage?: string
  }
) {
  return useQuery({
    queryKey: site ? [...qk.tasks(site.id), params] : ["tasks", "none"],
    enabled: !!site,
    staleTime: 5 * 60_000,
    queryFn: () => api.get<TasksResponse>(site!, "/api/sim/tasks", params),
  })
}

export function useRLObservation(
  site: SiteConnection | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: site ? qk.rlObs(site.id) : ["rl-observation", "none"],
    enabled: !!site && enabled,
    staleTime: 0,
    queryFn: () => api.get<RLGetResponse>(site!, "/api/rl"),
  })
}

export function useSimState(site: SiteConnection | undefined, enabled = true) {
  return useQuery({
    queryKey: site ? qk.state(site.id) : ["state", "none"],
    enabled: !!site && enabled,
    staleTime: 0,
    queryFn: () => api.get<Record<string, unknown>>(site!, "/api/sim/state"),
  })
}

export function useEpisodeMeta(
  site: SiteConnection | undefined,
  enabled = true
) {
  return useQuery({
    queryKey: site ? qk.episode(site.id) : ["episode", "none"],
    enabled: !!site && enabled,
    staleTime: 0,
    queryFn: () => api.get<Record<string, unknown>>(site!, "/api/sim/episode"),
  })
}

export function useActionSpace(site: SiteConnection | undefined) {
  return useQuery({
    queryKey: site ? qk.actionSpace(site.id) : ["rl-action-space", "none"],
    enabled: !!site,
    staleTime: 5 * 60_000,
    queryFn: () =>
      api.get<Record<string, unknown>>(site!, "/api/rl/action-space"),
  })
}
