// ---------------------------------------------------------------------------
// @thetabench/core — Shared simulation engine for all ThetaBench sites
// ---------------------------------------------------------------------------

// Core types
export type {
  SitePlugin,
  MutationDefinition,
  MutationResult,
  ConfigSchema,
  FieldDiff,
  EntityRef,
  StateDiff,
  EpisodeConfig,
  ActionLogEntry,
  CheckResult,
  EvalResult,
  JudgeResult,
  LeaderboardEntry,
  CurriculumStage,
} from "./types";

// Snapshot
export type { GenericSnapshot } from "./snapshot";
export { captureSnapshot, computeDiff, getNestedField } from "./snapshot";

// Config
export type { UniversalConfig } from "./config";
export { getUniversalConfig, applyUniversalConfig, resetUniversalConfig } from "./config";

// Evaluator
export { evaluate } from "./evaluator";

// LLM Judge
export { judgeRetrieval, judgeImpossibleTask, judgeRetrievalLLM } from "./llm-judge";
export type { LLMJudgeOptions } from "./llm-judge";

// Predicates
export { registerPredicate, getPredicate, clearPredicates } from "./predicates";

// Episode
export type { Episode, EpisodeResult, SiteAdapter } from "./episode";
export {
  registerSiteAdapter,
  startEpisode,
  logAction,
  evaluateEpisode,
  finishEpisode,
  getActiveEpisode,
  hasActiveEpisode,
  getStepReward,
} from "./episode";

// Task types
export type {
  TaskDefinition,
  TaskDomain,
  TaskDifficulty,
  TaskType,
  EvalCheckType,
  EvalCheck,
  RetrievalRubric,
  RewardProfile,
  SetupAction,
} from "./tasks/types";

// Task registry
export {
  registerTasks,
  getTaskById,
  getAllTasks,
  getTasksByCriteria,
  getTaskCount,
  clearTasks,
} from "./tasks/registry";

// Curriculum
export { getCurriculum, getStageForTask } from "./tasks/curriculum";
