// ---------------------------------------------------------------------------
// In-memory leaderboard (production would use a database)
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  id: string
  agentName: string
  modelName: string
  mode: "rest" | "browser"
  submittedAt: string
  results: {
    totalTasks: number
    tasksPassed: number
    avgScore: number
    avgSteps: number
    avgReward: number
    highestStage: number
    perDomain: Record<
      string,
      { attempted: number; passed: number; avgScore: number }
    >
  }
}

const MAX_ENTRIES = 1000
const _entries: LeaderboardEntry[] = []

export function submitToLeaderboard(
  entry: Omit<LeaderboardEntry, "id" | "submittedAt">
): LeaderboardEntry {
  const full: LeaderboardEntry = {
    ...entry,
    id: `lb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    submittedAt: new Date().toISOString(),
  }
  _entries.push(full)
  _entries.sort((a, b) => b.results.avgScore - a.results.avgScore)

  // Cap entries to prevent unbounded memory growth
  while (_entries.length > MAX_ENTRIES) {
    _entries.pop()
  }

  return full
}

export function getLeaderboard(): LeaderboardEntry[] {
  return _entries
}

export function getLeaderboardEntry(id: string): LeaderboardEntry | undefined {
  return _entries.find((e) => e.id === id)
}
