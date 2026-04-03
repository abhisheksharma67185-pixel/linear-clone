import { captureSnapshot, computeDiff } from "./snapshot";
import type { GenericSnapshot } from "./snapshot";
import { evaluate } from "./evaluator";
import { judgeRetrieval, judgeImpossibleTask } from "./llm-judge";
import type { JudgeResult } from "./llm-judge";
import { getTaskById } from "./tasks/registry";
import type { TaskDefinition } from "./tasks/types";
import type { StateDiff, EvalResult, EpisodeConfig, ActionLogEntry } from "./types";
import { resetUniversalConfig } from "./config";

// ---------------------------------------------------------------------------
// Episode result
// ---------------------------------------------------------------------------

export interface EpisodeResult {
  diff: StateDiff;
  eval: EvalResult;
  judgeResult?: JudgeResult;
  totalReward: number;
  wallTimeSeconds: number;
}

// ---------------------------------------------------------------------------
// Episode
// ---------------------------------------------------------------------------

export interface Episode {
  id: string;
  task: TaskDefinition;
  config: EpisodeConfig;
  initialSnapshot: GenericSnapshot;
  startedAt: string;
  status: "active" | "completed" | "failed" | "timeout";
  stepCount: number;
  actionLog: ActionLogEntry[];
  result?: EpisodeResult;
}

// ---------------------------------------------------------------------------
// Site adapter — each site provides these functions
// ---------------------------------------------------------------------------

export interface SiteAdapter {
  getState: () => Record<string, unknown>;
  reset: (seed?: number) => void;
  executeMutation: (name: string, args: unknown[]) => void;
  collections: string[];
  singletons: string[];
  applyConfig?: (config: Record<string, unknown>) => void;
  resetConfig?: () => void;
}

// ---------------------------------------------------------------------------
// Singleton state
// ---------------------------------------------------------------------------

let _activeEpisode: Episode | null = null;
let _siteAdapter: SiteAdapter | null = null;

export function registerSiteAdapter(adapter: SiteAdapter): void {
  _siteAdapter = adapter;
}

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
  if (!_siteAdapter)
    throw new Error("No site adapter registered. Call registerSiteAdapter() first.");

  const task = getTaskById(config.taskId);
  if (!task) throw new Error(`Task not found: ${config.taskId}`);

  // Reset site + universal config
  _siteAdapter.reset(config.seed);
  resetUniversalConfig();

  // Apply task config overrides
  if (task.configOverrides && _siteAdapter.applyConfig) {
    _siteAdapter.applyConfig(task.configOverrides);
  }
  if (config.configOverrides && _siteAdapter.applyConfig) {
    _siteAdapter.applyConfig(config.configOverrides);
  }

  // Run setup mutations
  if (task.setup) {
    for (const action of task.setup) {
      _siteAdapter.executeMutation(action.mutation, action.args);
    }
  }

  const initialSnapshot = captureSnapshot(_siteAdapter.getState);

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

  if (_activeEpisode.stepCount >= _activeEpisode.task.maxSteps) {
    _activeEpisode.status = "timeout";
  } else if (
    _activeEpisode.task.timeLimitSeconds &&
    (Date.now() - new Date(_activeEpisode.startedAt).getTime()) / 1000 >=
      _activeEpisode.task.timeLimitSeconds
  ) {
    _activeEpisode.status = "timeout";
  }
}

// ---------------------------------------------------------------------------
// Mid-episode evaluate
// ---------------------------------------------------------------------------

export function evaluateEpisode(): EvalResult | null {
  if (!_activeEpisode || !_siteAdapter) return null;
  if (_activeEpisode.result) return _activeEpisode.result.eval;

  const current = captureSnapshot(_siteAdapter.getState);
  const diff = computeDiff(
    _activeEpisode.initialSnapshot,
    current,
    _siteAdapter.collections,
    _siteAdapter.singletons,
  );
  return evaluate(_activeEpisode.task, _activeEpisode.initialSnapshot, current, diff);
}

// ---------------------------------------------------------------------------
// Finish
// ---------------------------------------------------------------------------

export function finishEpisode(agentResponse?: string): Episode {
  if (!_activeEpisode || !_siteAdapter) throw new Error("No active episode");

  const finalSnapshot = captureSnapshot(_siteAdapter.getState);
  const diff = computeDiff(
    _activeEpisode.initialSnapshot,
    finalSnapshot,
    _siteAdapter.collections,
    _siteAdapter.singletons,
  );
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

  let totalReward = _activeEpisode.actionLog.reduce((sum, entry) => sum + entry.reward, 0);
  totalReward += evalResult.score * _activeEpisode.task.rewardProfile.completion;

  if (judgeResult) {
    totalReward += judgeResult.passed ? _activeEpisode.task.rewardProfile.completion * 0.5 : 0;
  }

  // Compute final score based on task type
  let finalScore: number;
  const taskType = _activeEpisode.task.type;
  if (judgeResult && (taskType === "retrieval" || taskType === "no_action")) {
    // Pure retrieval / impossible: score entirely from judge
    finalScore = judgeResult.passed ? 1 : 0;
  } else if (judgeResult && taskType === "action_retrieval") {
    // Combined: 50/50 eval + judge
    finalScore = evalResult.score * 0.5 + (judgeResult.passed ? 1 : 0) * 0.5;
  } else {
    // Action tasks: score from eval checks only
    finalScore = evalResult.score;
  }

  // Preserve timeout status — don't overwrite with completed/failed
  if (_activeEpisode.status !== "timeout") {
    _activeEpisode.status = finalScore >= 1.0 ? "completed" : "failed";
  }
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
// Shaped reward for RL integration
// ---------------------------------------------------------------------------

export function getStepReward(actionValid: boolean): number {
  if (!_activeEpisode) return 0;
  const profile = _activeEpisode.task.rewardProfile;
  return actionValid ? profile.stepPenalty : profile.invalidActionPenalty;
}
