// ---------------------------------------------------------------------------
// SimEngine — per-instance container for what used to live as module-level
// singletons across episode.ts / predicates.ts / config.ts / tasks/registry.ts
//
// Phase 1 of Option B (see docs/ARCHITECTURE-PROPOSAL.md):
//   - All current free-function exports continue to work; they delegate to
//     `defaultEngine` (the process-wide singleton instance).
//   - Test code (and, eventually, per-request handlers) can instantiate
//     additional SimEngine objects to get an isolated universe with its own
//     adapter / episode / predicates / config / tasks.
//
// No site or SDK contract changes in this phase.
// ---------------------------------------------------------------------------

import { captureSnapshot, computeDiff, getNestedField } from "./snapshot"
import type { GenericSnapshot } from "./snapshot"
import { evaluate } from "./evaluator"
import { judgeRetrieval, judgeImpossibleTask } from "./llm-judge"
import type { JudgeResult } from "./llm-judge"
import type {
  TaskDefinition,
  TaskDomain,
  TaskDifficulty,
  TaskType,
  EvalCheck,
} from "./tasks/types"
import type { EvalResult, EpisodeConfig, ActionLogEntry } from "./types"
import type { UniversalConfig } from "./config"
import type { Episode, EpisodeResult, SiteAdapter } from "./episode"

// ---------------------------------------------------------------------------
// Types re-used from the original modules
// ---------------------------------------------------------------------------

type PredicateFn = (snapshot: GenericSnapshot, check: EvalCheck) => boolean

const DEFAULT_UNIVERSAL_CONFIG: UniversalConfig = {
  latency: 0,
  hideAriaLabels: false,
  errorRate: 0,
  dateOverride: null,
  locale: "en-US",
}

// ---------------------------------------------------------------------------
// SimEngine
// ---------------------------------------------------------------------------

export class SimEngine {
  // --- Per-instance state (was module-level in the legacy modules) -------
  private adapter: SiteAdapter | null = null
  private episode: Episode | null = null
  private predicates = new Map<string, PredicateFn>()
  private config: UniversalConfig = { ...DEFAULT_UNIVERSAL_CONFIG }
  private tasks: TaskDefinition[] = []
  private taskById = new Map<string, TaskDefinition>()

  constructor() {
    this.registerBuiltinPredicates()
  }

  // -----------------------------------------------------------------------
  // Site adapter / episode lifecycle (mirrors episode.ts)
  // -----------------------------------------------------------------------

  registerSiteAdapter(adapter: SiteAdapter): void {
    this.adapter = adapter
  }

  getActiveEpisode(): Episode | null {
    return this.episode
  }

  hasActiveEpisode(): boolean {
    return this.episode !== null
  }

  startEpisode(config: EpisodeConfig): Episode {
    if (!this.adapter)
      throw new Error(
        "No site adapter registered. Call registerSiteAdapter() first."
      )

    const task = this.getTaskById(config.taskId)
    if (!task) throw new Error(`Task not found: ${config.taskId}`)

    // Reset site + universal config
    this.adapter.reset(config.seed)
    this.resetUniversalConfig()

    // Apply task config overrides
    if (task.configOverrides && this.adapter.applyConfig) {
      this.adapter.applyConfig(task.configOverrides)
    }
    if (config.configOverrides && this.adapter.applyConfig) {
      this.adapter.applyConfig(config.configOverrides)
    }

    // Run setup mutations
    if (task.setup) {
      for (const action of task.setup) {
        this.adapter.executeMutation(action.mutation, action.args)
      }
    }

    const initialSnapshot = captureSnapshot(this.adapter.getState)

    this.episode = {
      id: `ep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      task,
      config,
      initialSnapshot,
      startedAt: new Date().toISOString(),
      status: "active",
      stepCount: 0,
      actionLog: [],
    }

    return this.episode
  }

  logAction(
    action: string,
    payload: Record<string, unknown>,
    reward: number,
    success: boolean
  ): void {
    if (!this.episode || this.episode.status !== "active") return

    this.episode.stepCount++
    const entry: ActionLogEntry = {
      step: this.episode.stepCount,
      timestamp: new Date().toISOString(),
      action,
      payload,
      reward,
      success,
    }
    this.episode.actionLog.push(entry)

    if (this.episode.stepCount >= this.episode.task.maxSteps) {
      this.episode.status = "timeout"
    } else if (
      this.episode.task.timeLimitSeconds &&
      (Date.now() - new Date(this.episode.startedAt).getTime()) / 1000 >=
        this.episode.task.timeLimitSeconds
    ) {
      this.episode.status = "timeout"
    }
  }

  evaluateEpisode(): EvalResult | null {
    if (!this.episode || !this.adapter) return null
    if (this.episode.result) return this.episode.result.eval

    const current = captureSnapshot(this.adapter.getState)
    const diff = computeDiff(
      this.episode.initialSnapshot,
      current,
      this.adapter.collections,
      this.adapter.singletons
    )
    return evaluate(
      this.episode.task,
      this.episode.initialSnapshot,
      current,
      diff
    )
  }

  finishEpisode(agentResponse?: string): Episode {
    if (!this.episode || !this.adapter) throw new Error("No active episode")

    const finalSnapshot = captureSnapshot(this.adapter.getState)
    const diff = computeDiff(
      this.episode.initialSnapshot,
      finalSnapshot,
      this.adapter.collections,
      this.adapter.singletons
    )
    const evalResult = evaluate(
      this.episode.task,
      this.episode.initialSnapshot,
      finalSnapshot,
      diff
    )

    // LLM judge for retrieval / impossible tasks
    let judgeResult: JudgeResult | undefined
    if (agentResponse && this.episode.task.type === "no_action") {
      judgeResult = judgeImpossibleTask(agentResponse)
    } else if (
      agentResponse &&
      this.episode.task.retrievalRubric &&
      (this.episode.task.type === "retrieval" ||
        this.episode.task.type === "action_retrieval")
    ) {
      judgeResult = judgeRetrieval(
        agentResponse,
        this.episode.task.retrievalRubric
      )
    }

    const wallTime =
      (Date.now() - new Date(this.episode.startedAt).getTime()) / 1000

    let totalReward = this.episode.actionLog.reduce(
      (sum, entry) => sum + entry.reward,
      0
    )
    totalReward += evalResult.score * this.episode.task.rewardProfile.completion

    if (judgeResult) {
      totalReward += judgeResult.passed
        ? this.episode.task.rewardProfile.completion * 0.5
        : 0
    }

    // Compute final score based on task type
    let finalScore: number
    const taskType = this.episode.task.type
    if (judgeResult && (taskType === "retrieval" || taskType === "no_action")) {
      finalScore = judgeResult.passed ? 1 : 0
    } else if (judgeResult && taskType === "action_retrieval") {
      finalScore = evalResult.score * 0.5 + (judgeResult.passed ? 1 : 0) * 0.5
    } else {
      finalScore = evalResult.score
    }

    // Preserve timeout status — don't overwrite with completed/failed
    if (this.episode.status !== "timeout") {
      this.episode.status = finalScore >= 1.0 ? "completed" : "failed"
    }

    const result: EpisodeResult = {
      score: finalScore,
      diff,
      eval: evalResult,
      judgeResult,
      totalReward,
      wallTimeSeconds: wallTime,
    }
    this.episode.result = result

    const finished = this.episode
    this.episode = null
    return finished
  }

  getStepReward(actionValid: boolean): number {
    if (!this.episode) return 0
    const profile = this.episode.task.rewardProfile
    return actionValid ? profile.stepPenalty : profile.invalidActionPenalty
  }

  // -----------------------------------------------------------------------
  // Predicates (mirrors predicates.ts)
  // -----------------------------------------------------------------------

  registerPredicate(name: string, fn: PredicateFn): void {
    this.predicates.set(name, fn)
  }

  getPredicate(name: string): PredicateFn | undefined {
    return this.predicates.get(name)
  }

  clearPredicates(): void {
    this.predicates.clear()
  }

  private registerBuiltinPredicates(): void {
    this.registerPredicate("field_equals", (snapshot, check) => {
      if (!check.entity || !check.field) return false
      const collection = snapshot[check.entity]

      if (Array.isArray(collection)) {
        const item = (collection as { id: string }[]).find(
          (e) => e.id === check.id
        )
        if (!item) return false
        const val = getNestedField(item, check.field)
        return JSON.stringify(val) === JSON.stringify(check.expected)
      }

      // Singleton entity (e.g. settings)
      const val = getNestedField(collection, check.field)
      return JSON.stringify(val) === JSON.stringify(check.expected)
    })

    this.registerPredicate("entity_exists_with_field", (snapshot, check) => {
      if (!check.entity || !check.field) return false
      const collection = snapshot[check.entity]
      if (!Array.isArray(collection)) return false
      return (collection as Record<string, unknown>[]).some(
        (item) =>
          JSON.stringify(getNestedField(item, check.field!)) ===
          JSON.stringify(check.expected)
      )
    })

    this.registerPredicate("collection_count_equals", (snapshot, check) => {
      if (!check.entity) return false
      const collection = snapshot[check.entity]
      if (!Array.isArray(collection)) return false
      return collection.length === Number(check.expected)
    })
  }

  // -----------------------------------------------------------------------
  // Universal config (mirrors config.ts)
  // -----------------------------------------------------------------------

  getUniversalConfig(): UniversalConfig {
    return { ...this.config }
  }

  applyUniversalConfig(overrides: Partial<UniversalConfig>): UniversalConfig {
    this.config = { ...this.config, ...overrides }
    return this.config
  }

  resetUniversalConfig(): void {
    this.config = { ...DEFAULT_UNIVERSAL_CONFIG }
  }

  // -----------------------------------------------------------------------
  // Task registry (mirrors tasks/registry.ts)
  // -----------------------------------------------------------------------

  registerTasks(tasks: TaskDefinition[]): void {
    for (const task of tasks) {
      if (this.taskById.has(task.id)) {
        console.warn(`[thetabench] Duplicate task ID "${task.id}" — skipping`)
        continue
      }
      this.tasks.push(task)
      this.taskById.set(task.id, task)
    }
  }

  getTaskById(id: string): TaskDefinition | undefined {
    return this.taskById.get(id)
  }

  getAllTasks(): TaskDefinition[] {
    return this.tasks
  }

  getTasksByCriteria(criteria: {
    domain?: TaskDomain
    difficulty?: TaskDifficulty
    type?: TaskType
    stage?: number
    site?: string
  }): TaskDefinition[] {
    return this.tasks.filter((t) => {
      if (criteria.domain && t.domain !== criteria.domain) return false
      if (criteria.difficulty && t.difficulty !== criteria.difficulty)
        return false
      if (criteria.type && t.type !== criteria.type) return false
      if (criteria.stage !== undefined && t.curriculumStage !== criteria.stage)
        return false
      if (criteria.site && t.site !== criteria.site) return false
      return true
    })
  }

  getTaskCount(): number {
    return this.tasks.length
  }

  clearTasks(): void {
    this.tasks.length = 0
    this.taskById.clear()
  }
}

// ---------------------------------------------------------------------------
// Phase-1 default singleton.
// All free-function exports in episode.ts / predicates.ts / config.ts /
// tasks/registry.ts proxy to this instance, preserving the existing public API
// for sites and the SDK contract.
// ---------------------------------------------------------------------------

export const defaultEngine = new SimEngine()
