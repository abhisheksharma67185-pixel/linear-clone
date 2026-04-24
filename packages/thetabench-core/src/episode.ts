import type { GenericSnapshot } from "./snapshot"
import type { JudgeResult } from "./llm-judge"
import type { TaskDefinition } from "./tasks/types"
import type {
  StateDiff,
  EvalResult,
  EpisodeConfig,
  ActionLogEntry,
} from "./types"
import { defaultEngine } from "./sim-engine"

// ---------------------------------------------------------------------------
// Episode result
// ---------------------------------------------------------------------------

export interface EpisodeResult {
  score: number
  diff: StateDiff
  eval: EvalResult
  judgeResult?: JudgeResult
  totalReward: number
  wallTimeSeconds: number
}

// ---------------------------------------------------------------------------
// Episode
// ---------------------------------------------------------------------------

export interface Episode {
  id: string
  task: TaskDefinition
  config: EpisodeConfig
  initialSnapshot: GenericSnapshot
  startedAt: string
  status: "active" | "completed" | "failed" | "timeout"
  stepCount: number
  actionLog: ActionLogEntry[]
  result?: EpisodeResult
}

// ---------------------------------------------------------------------------
// Site adapter — each site provides these functions
// ---------------------------------------------------------------------------

export interface SiteAdapter {
  getState: () => Record<string, unknown>
  reset: (seed?: number) => void
  executeMutation: (name: string, args: unknown[]) => void
  collections: string[]
  singletons: string[]
  applyConfig?: (config: Record<string, unknown>) => void
  resetConfig?: () => void
}

// ---------------------------------------------------------------------------
// Free-function shims — proxy to the process-wide `defaultEngine` instance.
// Behavior is preserved for sites and the SDK contract; per-instance state
// now lives in SimEngine (see ./sim-engine.ts).
// ---------------------------------------------------------------------------

export function registerSiteAdapter(adapter: SiteAdapter): void {
  defaultEngine.registerSiteAdapter(adapter)
}

export function getActiveEpisode(): Episode | null {
  return defaultEngine.getActiveEpisode()
}

export function hasActiveEpisode(): boolean {
  return defaultEngine.hasActiveEpisode()
}

export function startEpisode(config: EpisodeConfig): Episode {
  return defaultEngine.startEpisode(config)
}

export function logAction(
  action: string,
  payload: Record<string, unknown>,
  reward: number,
  success: boolean
): void {
  defaultEngine.logAction(action, payload, reward, success)
}

export function evaluateEpisode(): EvalResult | null {
  return defaultEngine.evaluateEpisode()
}

export function finishEpisode(agentResponse?: string): Episode {
  return defaultEngine.finishEpisode(agentResponse)
}

export function getStepReward(actionValid: boolean): number {
  return defaultEngine.getStepReward(actionValid)
}
