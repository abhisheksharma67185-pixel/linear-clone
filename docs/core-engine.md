# Core Engine Reference

The `@simbench/core` package (`packages/simbench-core/`) is the shared simulation engine that all sites plug into. It is site-agnostic -- it knows nothing about products, orders, issues, or sprints. It operates on generic state snapshots and task definitions.

**Package:** `@simbench/core` v0.1.0
**Source:** `packages/simbench-core/src/`
**Build:** `vp pack` (vite-plus)

## Exports

```typescript
// Types
SitePlugin, MutationDefinition, MutationResult, ConfigSchema,
FieldDiff, EntityRef, StateDiff,
EpisodeConfig, ActionLogEntry,
CheckResult, EvalResult, JudgeResult,
LeaderboardEntry, CurriculumStage

// Snapshot
GenericSnapshot, captureSnapshot, computeDiff, getNestedField

// Config
UniversalConfig, getUniversalConfig, applyUniversalConfig, resetUniversalConfig

// Evaluator
evaluate

// LLM Judge
judgeRetrieval, judgeImpossibleTask

// Predicates
registerPredicate, getPredicate, clearPredicates

// Episode
Episode, EpisodeResult, SiteAdapter,
registerSiteAdapter, startEpisode, logAction, evaluateEpisode,
finishEpisode, getActiveEpisode, hasActiveEpisode, getStepReward

// Tasks
TaskDefinition, TaskDomain, TaskDifficulty, TaskType,
EvalCheckType, EvalCheck, RetrievalRubric, RewardProfile, SetupAction,
registerTasks, getTaskById, getAllTasks, getTasksByCriteria,
getTaskCount, clearTasks

// Curriculum
getCurriculum, getStageForTask
```

---

## SitePlugin Interface

Every site must implement this interface to integrate with the engine:

```typescript
interface SitePlugin {
  id: string;           // "shopify-admin", "linear", "jira"
  name: string;         // "Shopify Admin Dashboard"
  category: string;     // "e-commerce-admin"
  version: string;

  getState(): Record<string, unknown>;
  setState(state: Record<string, unknown>): void;
  reset(seed?: number): void;

  getMutations(): MutationDefinition[];
  executeMutation(name: string, args: unknown[]): MutationResult;

  getConfigSchema(): ConfigSchema;
  applyConfig(config: Record<string, unknown>): void;
}
```

## SiteAdapter

The simplified runtime adapter that each site registers:

```typescript
interface SiteAdapter {
  getState: () => Record<string, unknown>;
  reset: (seed?: number) => void;
  executeMutation: (name: string, args: unknown[]) => void;
  collections: string[];      // e.g., ["products", "orders", "customers", "discounts"]
  singletons: string[];       // e.g., ["settings"]
  applyConfig?: (config: Record<string, unknown>) => void;
  resetConfig?: () => void;
}
```

Register with:

```typescript
import { registerSiteAdapter } from "@simbench/core";

registerSiteAdapter({
  getState: () => ({ products: getProducts(), orders: getOrders(), ... }),
  reset: (seed) => store.reset(seed),
  executeMutation: (name, args) => { /* dispatch to store functions */ },
  collections: ["products", "orders", "customers", "discounts"],
  singletons: ["settings"],
});
```

---

## Episode Manager

**Source:** `src/episode.ts`

Manages the full lifecycle of an agent-task interaction.

### `startEpisode(config: EpisodeConfig): Episode`

1. Validates the site adapter is registered
2. Looks up the task by ID from the registry
3. Resets site state (with optional seed for determinism)
4. Resets universal config to defaults
5. Applies task-level config overrides, then episode-level overrides
6. Runs setup mutations (pre-conditions for the task)
7. Captures initial state snapshot
8. Returns the new `Episode` object

```typescript
interface EpisodeConfig {
  taskId: string;
  seed?: number;
  mode: "rest" | "browser";
  configOverrides?: Record<string, unknown>;
}

interface Episode {
  id: string;                    // "ep_<timestamp>_<random>"
  task: TaskDefinition;
  config: EpisodeConfig;
  initialSnapshot: GenericSnapshot;
  startedAt: string;             // ISO timestamp
  status: "active" | "completed" | "failed" | "timeout";
  stepCount: number;
  actionLog: ActionLogEntry[];
  result?: EpisodeResult;
}
```

### `logAction(action, payload, reward, success): void`

Records a step in the action log. Increments `stepCount`. Auto-transitions to `"timeout"` if `maxSteps` or `timeLimitSeconds` are exceeded.

```typescript
interface ActionLogEntry {
  step: number;
  timestamp: string;
  action: string;
  payload: Record<string, unknown>;
  reward: number;
  success: boolean;
}
```

### `evaluateEpisode(): EvalResult | null`

Non-destructive mid-episode evaluation. Captures current snapshot, computes diff against initial, runs eval checks. Does not end the episode.

### `finishEpisode(agentResponse?: string): Episode`

1. Captures final state snapshot
2. Computes state diff (initial vs final)
3. Runs all eval checks
4. Runs LLM judge if task is retrieval (`judgeRetrieval`) or impossible (`judgeImpossibleTask`)
5. Computes final score:
   - **Action tasks**: Weighted average of eval checks
   - **Retrieval / impossible tasks**: Judge result only (pass = 1.0, fail = 0.0)
   - **Combined tasks**: 50% eval checks + 50% judge
6. Computes total reward: sum of step rewards + (eval score x completion bonus)
7. Sets status to `"completed"` (score = 1.0), `"failed"`, or preserves `"timeout"`
8. Clears the active episode and returns the finished Episode

```typescript
interface EpisodeResult {
  score: number;              // 0.0 - 1.0
  diff: StateDiff;
  eval: EvalResult;
  judgeResult?: JudgeResult;
  totalReward: number;
  wallTimeSeconds: number;
}
```

### `getStepReward(actionValid: boolean): number`

Returns shaped reward for an RL step. If the action was valid, returns `stepPenalty` (typically -0.01). If invalid, returns `invalidActionPenalty` (typically -0.1).

---

## Snapshot Engine

**Source:** `src/snapshot.ts`

### `captureSnapshot(getState: () => Record<string, unknown>): GenericSnapshot`

Deep-clones the entire site state via `JSON.parse(JSON.stringify(...))`. Adds a `capturedAt` ISO timestamp.

### `computeDiff(before, after, collections, singletons): StateDiff`

Field-level diff between two snapshots:

- **Collections** (arrays with `id` fields): Detects added entities, removed entities, and modified fields within existing entities.
- **Singletons** (plain objects): Detects modified fields.

```typescript
interface StateDiff {
  added: EntityRef[];                    // New entities in collections
  removed: { entity: string; id: string }[];  // Deleted entities
  modified: FieldDiff[];                 // Changed fields
}

interface FieldDiff {
  path: string;      // "products.1.price"
  entity: string;    // "products"
  id?: string;       // "1"
  field: string;     // "price"
  before: unknown;   // "29.99"
  after: unknown;    // "34.99"
}
```

### `getNestedField(obj, path): unknown`

Dot-path accessor. `getNestedField(product, "tags.0")` returns the first tag.

---

## Evaluator

**Source:** `src/evaluator.ts`

### `evaluate(task, initial, final, diff): EvalResult`

Runs all `evalChecks` from the task definition against the snapshots and diff. Returns weighted score.

```typescript
interface EvalResult {
  score: number;             // 0.0 - 1.0 (weighted average)
  checks: CheckResult[];
  passed: number;
  total: number;
}
```

### Check Types

| Type | What It Checks | Required Fields |
|------|---------------|----------------|
| `state_diff` | A field on an entity changed to the expected value | `entity`, `id` (for collections), `field`, `expected` |
| `state_exists` | An entity with a matching field value exists | `entity`, `field`, `expected` |
| `state_absent` | An entity with a given `id` no longer exists | `entity`, `id` |
| `state_count` | A collection has exactly N items | `entity`, `expected` (number) |
| `state_predicate` | A registered predicate function returns true | `predicate` (name) |
| `retrieval` | Placeholder -- evaluated separately by LLM judge | -- |

```typescript
interface EvalCheck {
  type: EvalCheckType;
  entity?: string;
  id?: string;
  field?: string;
  expected?: unknown;
  predicate?: string;
  weight: number;
  description: string;
}
```

### Scoring Formula

```
score = sum(passed_check_weights) / sum(all_check_weights)
```

Each check has a `weight` (default 1). Only checks that pass contribute to the numerator. This enables partial credit.

---

## LLM Judge

**Source:** `src/llm-judge.ts`

### `judgeRetrieval(agentResponse, rubric): JudgeResult`

Evaluates retrieval tasks using text matching (not an actual LLM call -- deterministic):

1. **Exact match**: Normalized (trimmed, lowercased, whitespace-collapsed) response equals ground truth
2. **Acceptable variations**: Response matches any variation in the rubric
3. **Semantic containment**: Ground truth appears as a substring of the response (with length-ratio thresholds)
4. **Variation containment**: Any acceptable variation appears in the response

```typescript
interface RetrievalRubric {
  question: string;
  groundTruth: string;
  acceptableVariations: string[];
  rubric: string;
}

interface JudgeResult {
  passed: boolean;
  reasoning: string;
  matchType: "exact" | "variation" | "semantic" | "failed";
}
```

### `judgeImpossibleTask(agentResponse): JudgeResult`

Checks if the agent recognized the task is impossible by scanning for 40+ multi-word indicator phrases:

- "not possible", "cannot be done", "already fulfilled", "already refunded"
- "does not exist", "no such product", "task is impossible"
- "has expired", "payment pending", etc.

All phrases are 2+ words to reduce false positives. Matching is case-insensitive with whitespace normalization.

---

## Config System

**Source:** `src/config.ts`

```typescript
interface UniversalConfig {
  latency: number;           // 0-5000ms simulated network delay
  hideAriaLabels: boolean;   // Remove ARIA attributes
  errorRate: number;         // 0.0-1.0 random action failure rate
  dateOverride: string | null; // Lock current date for determinism
  locale: string;            // "en-US", etc.
}
```

### Functions

- `getUniversalConfig()` - Returns a copy of the current config
- `applyUniversalConfig(overrides)` - Merges overrides into current config
- `resetUniversalConfig()` - Resets to defaults (called at episode start)

---

## Predicate Registry

**Source:** `src/predicates.ts`

Custom evaluation functions that sites register for domain-specific checks.

```typescript
type PredicateFn = (snapshot: GenericSnapshot, check: EvalCheck) => boolean;

registerPredicate("product_has_fields", (snapshot, check) => { ... });
registerPredicate("order_has_fulfillment_status", (snapshot, check) => { ... });
```

### Built-in Predicates

| Name | Description |
|------|-------------|
| `field_equals` | Check if a field on an entity equals the expected value |
| `entity_exists_with_field` | Check if any entity in a collection has a field matching expected |
| `collection_count_equals` | Check if a collection has exactly N items |

Sites register additional predicates (Shopify: 12, Linear: 10, Jira: 11).

---

## Task Registry

**Source:** `src/tasks/registry.ts`

Simple in-memory registry. Sites register their tasks at startup.

- `registerTasks(tasks: TaskDefinition[])` - Bulk register (deduplicates by ID)
- `getTaskById(id)` - O(1) lookup
- `getAllTasks()` - Full list
- `getTasksByCriteria({ domain?, difficulty?, type?, stage?, site? })` - Filtered list
- `getTaskCount()` - Total count
- `clearTasks()` - Reset (for testing)

---

## Curriculum

**Source:** `src/tasks/curriculum.ts`

Builds 10 progressive stages from registered tasks:

| Stage | Title | Domains | Difficulty |
|-------|-------|---------|-----------|
| 1 | Navigation Basics | navigation | easy |
| 2 | Single Field Reads & Updates | products, customers, settings, retrieval | easy |
| 3 | Entity Creation | products, customers, discounts | easy-medium |
| 4 | Order Operations | orders | medium |
| 5 | Multi-Field Operations | products, customers, discounts, settings | medium |
| 6 | Search & Information Retrieval | search, retrieval | medium-hard |
| 7 | Conditional Logic | products, orders | hard |
| 8 | Error Recognition & Multi-Step | orders, products, discounts, impossible | hard |
| 9 | Cross-Domain Workflows | multi-domain | hard-expert |
| 10 | Expert Scenarios | multi-domain | expert |

### Functions

- `getCurriculum(): CurriculumStage[]` - Returns all 10 stages with populated `taskIds`
- `getStageForTask(taskId): CurriculumStage | undefined` - Which stage a task belongs to

```typescript
interface CurriculumStage {
  stage: number;
  title: string;
  description: string;
  domains: string[];
  difficultyRange: [string, string];
  taskIds: string[];
}
```

---

## Task Definition

**Source:** `src/tasks/types.ts`

The complete schema for a task:

```typescript
interface TaskDefinition {
  id: string;                      // "prod-001", "ord-005", "imp-002"
  site: string;                    // "shopify-admin", "linear", "jira"
  domain: TaskDomain;              // "products", "orders", "issues", etc.
  type: TaskType;                  // "action" | "retrieval" | "action_retrieval" | "no_action"
  difficulty: TaskDifficulty;      // "easy" | "medium" | "hard" | "expert"
  curriculumStage: number;         // 1-10

  title: string;                   // Human-readable title
  goal: string;                    // What the agent must accomplish
  hint?: string;                   // Optional guidance
  requires?: string[];             // Prerequisite task IDs

  setup?: SetupAction[];           // Mutations to run before episode starts
  configOverrides?: Record<string, unknown>;

  retrievalRubric?: RetrievalRubric;    // For retrieval tasks
  impossibilityReason?: string;         // For impossible tasks
  evalChecks: EvalCheck[];              // How to score the task

  maxSteps: number;                // Step budget
  timeLimitSeconds?: number;

  rewardProfile: RewardProfile;    // Reward shaping parameters
  tags: string[];                  // ["form-fill", "navigation", "multi-step"]
}

interface RewardProfile {
  completion: number;              // Bonus on task success (e.g., 10.0)
  partialPerCheck: boolean;        // Award partial credit per check?
  stepPenalty: number;             // Per-step penalty (e.g., -0.01)
  invalidActionPenalty: number;    // Invalid action penalty (e.g., -0.1)
}

interface SetupAction {
  mutation: string;                // "updateProduct", "fulfillOrder"
  args: unknown[];                 // Arguments to pass to the mutation
}
```

### Task Domains

```typescript
type TaskDomain =
  | "navigation" | "products" | "orders" | "customers" | "discounts"
  | "settings" | "search" | "retrieval" | "impossible" | "multi-domain"
  | "issues" | "projects" | "sprints" | "cycles" | "views"
  | "boards" | "labels" | "teams"
  | "messages" | "channels" | "dms" | "reactions" | "huddles"
  | "canvases" | "lists";
```
