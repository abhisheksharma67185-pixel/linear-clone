import * as store from "./store";
import { captureSnapshot, computeDiff } from "./snapshot";
import type { StoreSnapshot, StateDiff } from "./snapshot";
import { evaluate } from "./evaluator";
import type { EvalResult } from "./evaluator";
import { judgeRetrieval, judgeImpossibleTask } from "./llm-judge";
import type { JudgeResult } from "./llm-judge";
import { getTaskById } from "./tasks";
import type { TaskDefinition } from "./tasks/types";
import { applyConfig, resetConfig } from "./config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EpisodeConfig {
  taskId: string;
  seed?: number;
  mode: "rest" | "browser";
  configOverrides?: Record<string, unknown>;
}

export interface ActionLogEntry {
  step: number;
  timestamp: string;
  action: string;
  payload: Record<string, unknown>;
  reward: number;
  success: boolean;
}

export interface EpisodeResult {
  diff: StateDiff;
  eval: EvalResult;
  judgeResult?: JudgeResult;
  totalReward: number;
  wallTimeSeconds: number;
}

export interface Episode {
  id: string;
  task: TaskDefinition;
  config: EpisodeConfig;
  initialSnapshot: StoreSnapshot;
  startedAt: string;
  status: "active" | "completed" | "failed" | "timeout";
  stepCount: number;
  actionLog: ActionLogEntry[];
  result?: EpisodeResult;
}

// ---------------------------------------------------------------------------
// Singleton active episode
// ---------------------------------------------------------------------------

let _activeEpisode: Episode | null = null;

export function getActiveEpisode(): Episode | null {
  return _activeEpisode;
}

export function hasActiveEpisode(): boolean {
  return _activeEpisode !== null;
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

export function startEpisode(config: EpisodeConfig): Episode {
  const task = getTaskById(config.taskId);
  if (!task) {
    throw new Error(`Task not found: ${config.taskId}`);
  }

  // Reset everything
  store.reset();
  resetConfig();

  // Apply task config overrides
  if (task.configOverrides) {
    applyConfig(task.configOverrides as Parameters<typeof applyConfig>[0]);
  }
  if (config.configOverrides) {
    applyConfig(config.configOverrides as Parameters<typeof applyConfig>[0]);
  }

  // Run setup actions (pre-conditions)
  if (task.setup) {
    for (const action of task.setup) {
      const fn = (store as unknown as Record<string, (...args: unknown[]) => unknown>)[
        action.mutation
      ];
      if (fn) {
        fn(...action.args);
      }
    }
  }

  const initialSnapshot = captureSnapshot();

  _activeEpisode = {
    id: `ep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    task,
    config,
    initialSnapshot,
    startedAt: new Date().toISOString(),
    status: "active",
    stepCount: 0,
    actionLog: [],
  };

  return _activeEpisode;
}

// ---------------------------------------------------------------------------
// Log action
// ---------------------------------------------------------------------------

export function logAction(
  action: string,
  payload: Record<string, unknown>,
  reward: number,
  success: boolean,
): void {
  if (!_activeEpisode || _activeEpisode.status !== "active") return;

  _activeEpisode.stepCount++;
  _activeEpisode.actionLog.push({
    step: _activeEpisode.stepCount,
    timestamp: new Date().toISOString(),
    action,
    payload,
    reward,
    success,
  });

  // Check step budget
  if (_activeEpisode.stepCount >= _activeEpisode.task.maxSteps) {
    _activeEpisode.status = "timeout";
  }
}

// ---------------------------------------------------------------------------
// Mid-episode evaluate (non-destructive)
// ---------------------------------------------------------------------------

export function evaluateEpisode(): EvalResult | null {
  if (!_activeEpisode) return null;

  const currentSnapshot = captureSnapshot();
  const diff = computeDiff(_activeEpisode.initialSnapshot, currentSnapshot);
  return evaluate(_activeEpisode.task, _activeEpisode.initialSnapshot, currentSnapshot, diff);
}

// ---------------------------------------------------------------------------
// Finish
// ---------------------------------------------------------------------------

export function finishEpisode(agentResponse?: string): Episode {
  if (!_activeEpisode) {
    throw new Error("No active episode");
  }

  const finalSnapshot = captureSnapshot();
  const diff = computeDiff(_activeEpisode.initialSnapshot, finalSnapshot);
  const evalResult = evaluate(
    _activeEpisode.task,
    _activeEpisode.initialSnapshot,
    finalSnapshot,
    diff,
  );

  // LLM judge for retrieval / impossible tasks
  let judgeResult: JudgeResult | undefined;

  if (agentResponse && _activeEpisode.task.type === "no_action") {
    judgeResult = judgeImpossibleTask(agentResponse);
  } else if (
    agentResponse &&
    _activeEpisode.task.retrievalRubric &&
    (_activeEpisode.task.type === "retrieval" || _activeEpisode.task.type === "action_retrieval")
  ) {
    judgeResult = judgeRetrieval(agentResponse, _activeEpisode.task.retrievalRubric);
  }

  const wallTime = (Date.now() - new Date(_activeEpisode.startedAt).getTime()) / 1000;

  // Compute total reward from action log + completion bonus
  let totalReward = _activeEpisode.actionLog.reduce((sum, entry) => sum + entry.reward, 0);

  // Add completion reward based on eval score
  const completionBonus = evalResult.score * _activeEpisode.task.rewardProfile.completion;
  totalReward += completionBonus;

  // For retrieval/impossible tasks, factor in judge result
  if (judgeResult) {
    totalReward += judgeResult.passed ? _activeEpisode.task.rewardProfile.completion * 0.5 : 0;
  }

  // Determine final status
  let finalScore = evalResult.score;
  if (judgeResult) {
    // Combined score: eval checks + judge
    const evalWeight = _activeEpisode.task.type === "action_retrieval" ? 0.5 : 0;
    const judgeWeight = _activeEpisode.task.type === "action_retrieval" ? 0.5 : 1;
    finalScore = evalResult.score * evalWeight + (judgeResult.passed ? 1 : 0) * judgeWeight;
  }

  _activeEpisode.status = finalScore >= 1.0 ? "completed" : "failed";
  _activeEpisode.result = {
    diff,
    eval: evalResult,
    judgeResult,
    totalReward,
    wallTimeSeconds: wallTime,
  };

  const finished = _activeEpisode;
  _activeEpisode = null;
  return finished;
}

// ---------------------------------------------------------------------------
// Get shaped reward for a single action (used by /api/rl integration)
// ---------------------------------------------------------------------------

export function getStepReward(actionValid: boolean): number {
  if (!_activeEpisode) return 0;
  const profile = _activeEpisode.task.rewardProfile;

  if (!actionValid) return profile.invalidActionPenalty;
  return profile.stepPenalty;
}
