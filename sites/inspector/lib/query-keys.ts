// ---------------------------------------------------------------------------
// Centralized query keys so invalidation stays consistent.
// ---------------------------------------------------------------------------

export const qk = {
  health: (siteId: string) => ["health", siteId] as const,
  tasks: (siteId: string) => ["tasks", siteId] as const,
  task: (siteId: string, taskId: string) => ["task", siteId, taskId] as const,
  rlObs: (siteId: string) => ["rl-observation", siteId] as const,
  actionSpace: (siteId: string) => ["rl-action-space", siteId] as const,
  episode: (siteId: string) => ["episode", siteId] as const,
  snapshot: (siteId: string) => ["snapshot", siteId] as const,
  state: (siteId: string) => ["state", siteId] as const,
}
