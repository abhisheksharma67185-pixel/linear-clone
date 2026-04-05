// ---------------------------------------------------------------------------
// Core types for the SimBench simulation engine
// All site-agnostic — no Shopify/Linear/etc. specific types
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// SitePlugin — the interface every site implements
// ---------------------------------------------------------------------------

export interface MutationDefinition {
  name: string;
  description: string;
  params: Record<string, string>;
}

export interface MutationResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface ConfigSchema {
  universal: Record<string, { type: string; default: unknown; description: string }>;
  site: Record<string, { type: string; default: unknown; description: string }>;
}

export interface SitePlugin {
  id: string;
  name: string;
  category: string;
  version: string;

  getState(): Record<string, unknown>;
  setState(state: Record<string, unknown>): void;
  reset(seed?: number): void;

  getMutations(): MutationDefinition[];
  executeMutation(name: string, args: unknown[]): MutationResult;

  getConfigSchema(): ConfigSchema;
  applyConfig(config: Record<string, unknown>): void;
}

// ---------------------------------------------------------------------------
// Snapshot types
// ---------------------------------------------------------------------------

export interface FieldDiff {
  path: string;
  entity: string;
  id?: string;
  field: string;
  before: unknown;
  after: unknown;
}

export interface EntityRef {
  entity: string;
  id: string;
  item: Record<string, unknown>;
}

export interface StateDiff {
  added: EntityRef[];
  removed: { entity: string; id: string }[];
  modified: FieldDiff[];
}

// ---------------------------------------------------------------------------
// Episode types
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

// ---------------------------------------------------------------------------
// Evaluation types
// ---------------------------------------------------------------------------

export interface CheckResult {
  passed: boolean;
  actual?: unknown;
  message: string;
  weight?: number;
}

export interface EvalResult {
  score: number;
  checks: CheckResult[];
  passed: number;
  total: number;
}

export interface JudgeResult {
  passed: boolean;
  reasoning: string;
  matchType: "exact" | "variation" | "semantic" | "failed";
}

// ---------------------------------------------------------------------------
// Leaderboard types
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  id: string;
  agentName: string;
  modelName: string;
  mode: "rest" | "browser";
  submittedAt: string;
  results: {
    totalTasks: number;
    tasksPassed: number;
    avgScore: number;
    avgSteps: number;
    avgReward: number;
    highestStage: number;
    perDomain: Record<string, { attempted: number; passed: number; avgScore: number }>;
  };
}

// ---------------------------------------------------------------------------
// Curriculum types
// ---------------------------------------------------------------------------

export interface CurriculumStage {
  stage: number;
  title: string;
  description: string;
  domains: string[];
  difficultyRange: [string, string];
  taskIds: string[];
}
