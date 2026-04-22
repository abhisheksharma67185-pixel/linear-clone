// ---------------------------------------------------------------------------
// Strongly-typed wrappers around the standard ThetaBench HTTP API.
//
// These mirror the shapes returned by `sites/*/app/api/...` routes (see the
// jira site for the canonical version). Keep this file in sync when those
// routes change.
// ---------------------------------------------------------------------------

import type {
  CurriculumStage,
  EvalResult,
  GenericSnapshot,
  JudgeResult,
  LeaderboardEntry,
} from "@thetabench/core";
import { getJson, postJson } from "./http.js";

// ---------------------------------------------------------------------------
// /api/health
// ---------------------------------------------------------------------------

export interface HealthResponse {
  status: "ok" | "error";
  version: string;
  site: string;
  tasks: number;
  domains: number;
  curriculum_stages: number;
  domain_breakdown: Record<string, number>;
  timestamp: string;
}

export const fetchHealth = (baseUrl: string) => getJson<HealthResponse>(baseUrl, "api/health");

// ---------------------------------------------------------------------------
// /api/sim/tasks
// ---------------------------------------------------------------------------

export interface TaskListItem {
  id: string;
  site: string;
  domain: string;
  type: string;
  difficulty: string;
  curriculum_stage: number;
  title: string;
  goal: string;
  max_steps: number;
  tags: string[];
}

export interface TaskListResponse {
  total: number;
  filtered: number;
  tasks: TaskListItem[];
}

export interface TaskListFilters {
  site?: string;
  domain?: string;
  difficulty?: string;
  type?: string;
  stage?: number | string;
  limit?: number;
}

export const fetchTasks = (baseUrl: string, filters: TaskListFilters = {}) =>
  getJson<TaskListResponse>(baseUrl, "api/sim/tasks", filters as Record<string, string | number | undefined>);

// ---------------------------------------------------------------------------
// /api/sim/config (POST) — start episode
// ---------------------------------------------------------------------------

export interface StartEpisodeRequest {
  task_id: string;
  seed?: number;
  mode?: "rest" | "browser";
  config_overrides?: Record<string, unknown>;
}

export interface StartEpisodeResponse {
  episode_id: string;
  task: {
    id: string;
    title: string;
    goal: string;
    type: string;
    difficulty: string;
    max_steps: number;
    curriculum_stage: number;
  };
  status: string;
  initial_snapshot: GenericSnapshot;
}

export const startEpisodeRemote = (baseUrl: string, req: StartEpisodeRequest) =>
  postJson<StartEpisodeResponse>(baseUrl, "api/sim/config", req);

// ---------------------------------------------------------------------------
// /api/sim/episode (GET)
// ---------------------------------------------------------------------------

export type EpisodeStatusResponse =
  | { active: false }
  | {
      active: true;
      episode_id: string;
      task_id: string;
      task_title: string;
      task_goal: string;
      status: string;
      step_count: number;
      max_steps: number;
      elapsed_seconds: number;
      action_log_length: number;
    };

export const fetchEpisode = (baseUrl: string) =>
  getJson<EpisodeStatusResponse>(baseUrl, "api/sim/episode");

// ---------------------------------------------------------------------------
// /api/sim/finish (POST)
// ---------------------------------------------------------------------------

export interface FinishEpisodeResponse {
  episode_id: string;
  task_id: string;
  status: string;
  steps: number;
  score: number;
  total_reward: number;
  wall_time_seconds: number;
  eval?: EvalResult;
  judge_result?: JudgeResult;
  diff?: unknown;
  action_log?: unknown[];
}

export const finishEpisodeRemote = (baseUrl: string, agentResponse?: string) =>
  postJson<FinishEpisodeResponse>(
    baseUrl,
    "api/sim/finish",
    agentResponse !== undefined ? { agent_response: agentResponse } : {},
  );

// ---------------------------------------------------------------------------
// /api/sim/evaluate (POST)
// ---------------------------------------------------------------------------

export const evaluateEpisodeRemote = (baseUrl: string) =>
  postJson<EvalResult & { error?: string }>(baseUrl, "api/sim/evaluate", {});

// ---------------------------------------------------------------------------
// /api/sim/snapshot (GET)
// ---------------------------------------------------------------------------

export const fetchSnapshot = (baseUrl: string) =>
  getJson<GenericSnapshot>(baseUrl, "api/sim/snapshot");

// ---------------------------------------------------------------------------
// /api/sim/state (GET)
// ---------------------------------------------------------------------------

export const fetchState = (baseUrl: string) =>
  getJson<Record<string, unknown>>(baseUrl, "api/sim/state");

// ---------------------------------------------------------------------------
// /api/sim/leaderboard (GET)
// ---------------------------------------------------------------------------

export interface LeaderboardListResponse {
  total: number;
  entries: Array<{
    rank: number;
    id: string;
    agent_name: string;
    model_name: string;
    mode: string;
    submitted_at: string;
    score: number;
    tasks_passed: number;
    total_tasks: number;
    highest_stage: number;
  }>;
}

export const fetchLeaderboard = (baseUrl: string) =>
  getJson<LeaderboardListResponse>(baseUrl, "api/sim/leaderboard");

export const submitLeaderboard = (baseUrl: string, entry: Partial<LeaderboardEntry>) =>
  postJson<{ id: string; rank: number; message: string }>(baseUrl, "api/sim/leaderboard", entry);

// ---------------------------------------------------------------------------
// /api/rl (GET / POST), /api/rl/reset, /api/rl/action-space
// ---------------------------------------------------------------------------

export interface ObservationResponse {
  observation: Record<string, unknown> & { currentPage?: string; availableActions?: string[] };
  info?: Record<string, unknown>;
}

export interface StepResponse {
  observation: ObservationResponse["observation"];
  reward: number;
  done: boolean;
  truncated: boolean;
  info?: Record<string, unknown>;
}

export const fetchObservation = (baseUrl: string) =>
  getJson<ObservationResponse>(baseUrl, "api/rl");

export const stepEnvironment = (baseUrl: string, action: Record<string, unknown>) =>
  postJson<StepResponse>(baseUrl, "api/rl", action);

export const resetEnvironment = (baseUrl: string) =>
  postJson<{ message: string; observation: unknown }>(baseUrl, "api/rl/reset", {});

export interface ActionSpaceResponse {
  version: string;
  actions: Array<{
    name: string;
    description: string;
    params: Record<string, string>;
    reward: number;
    example: Record<string, unknown>;
  }>;
  rewards?: Record<string, number>;
  episodeEnd?: string;
}

export const fetchActionSpace = (baseUrl: string) =>
  getJson<ActionSpaceResponse>(baseUrl, "api/rl/action-space");

// Convenience: fetch full curriculum (re-uses tasks endpoint and stages from health).
// The site does not expose a `/api/sim/curriculum` route, so the CLI builds one
// by combining `/api/health` (stage count) with `/api/sim/tasks` (task list).
export const fetchAllTasks = (baseUrl: string) => fetchTasks(baseUrl);

export interface CurriculumView {
  stages: Array<{
    stage: number;
    taskCount: number;
    tasks: TaskListItem[];
  }>;
  totalStages: number;
  totalTasks: number;
}

export type { CurriculumStage };
