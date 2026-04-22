// ---------------------------------------------------------------------------
// Shared types for inspector UI + API shims.
// The engine types (TaskDefinition, StateDiff, …) are imported straight from
// @thetabench/core so we stay in lockstep with what the sites actually emit.
// ---------------------------------------------------------------------------

export type SiteId = string

export interface SiteConnection {
  id: SiteId // stable key used in URLs and localStorage
  name: string // display name
  url: string // base URL, no trailing slash (e.g. http://localhost:3000)
}

// Shape of GET /api/health across all sites.
export interface HealthResponse {
  status: "ok" | "error"
  version: string
  site: string
  tasks: number
  domains: number
  curriculum_stages: number
  domain_breakdown: Record<string, number>
  timestamp: string
}

// Shape of GET /api/sim/tasks response. The sites return a trimmed task
// projection rather than the full TaskDefinition; this matches that.
export interface TaskSummary {
  id: string
  site: string
  domain: string
  type: string
  difficulty: string
  curriculum_stage: number
  title: string
  goal: string
  max_steps: number
  tags: string[]
}

export interface TasksResponse {
  total: number
  filtered: number
  tasks: TaskSummary[]
}

// Shape of POST /api/sim/config.
export interface StartEpisodeResponse {
  episode_id: string
  task: {
    id: string
    title: string
    goal: string
    type: string
    difficulty: string
    max_steps: number
    curriculum_stage: number
  }
  status: string
  initial_snapshot: Record<string, unknown>
}

// Shape of POST /api/sim/finish.
export interface FinishEpisodeResponse {
  episode_id: string
  task_id: string
  status: string
  steps: number
  score: number
  total_reward: number
  wall_time_seconds: number
  eval?: unknown
  judge_result?: unknown
  diff?: unknown
  action_log?: unknown[]
}

// Shape of GET /api/rl.
export interface RLObservation {
  currentPage?: string
  stepCount?: number
  lastAction?: string | null
  availableActions?: string[]
  episode?: unknown
  summary?: Record<string, unknown>
  data?: Record<string, unknown>
  currentPageData?: unknown
  [key: string]: unknown
}

export interface RLGetResponse {
  observation: RLObservation
  info: Record<string, unknown>
}

// Shape of POST /api/rl.
export interface RLStepResponse {
  observation: RLObservation
  reward: number
  done: boolean
  truncated: boolean
  info: Record<string, unknown>
}

// Local history entry saved to localStorage.
export interface EpisodeHistoryEntry {
  siteId: SiteId
  episodeId: string
  taskId: string
  taskTitle: string
  startedAt: string // ISO
  status: "running" | "completed" | "failed" | "timeout" | "unknown"
  score?: number
}

// Per-step action timeline the inspector keeps in memory for the live runner.
export interface ActionHistoryEntry {
  at: string
  action: Record<string, unknown>
  reward: number
  done: boolean
  truncated: boolean
  info: Record<string, unknown>
  error?: string
}
