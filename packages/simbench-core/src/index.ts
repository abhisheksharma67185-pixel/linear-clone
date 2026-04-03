// ---------------------------------------------------------------------------
// @simbench/core — Shared simulation engine for all SimBench sites
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
