# Architecture

ThetaBench separates a **site-agnostic simulation engine** from **site-specific implementations**. The engine handles episodes, snapshots, evaluation, curriculum, and reward computation. Each site plugs into the engine by implementing a standard adapter interface, inheriting all infrastructure automatically.

## Monorepo Layout

```
thetabench/
├── packages/
│   └── thetabench-core/           # Shared simulation engine (TypeScript)
│       └── src/
│           ├── types.ts         # Core interfaces (SitePlugin, StateDiff, Episode, etc.)
│           ├── index.ts         # Public API exports
│           ├── episode.ts       # Episode lifecycle (start, log, evaluate, finish)
│           ├── snapshot.ts      # State capture & field-level diff
│           ├── evaluator.ts     # 6 check types, weighted scoring
│           ├── llm-judge.ts     # Retrieval & impossibility evaluation
│           ├── config.ts        # Universal environment configuration
│           ├── predicates.ts    # Custom predicate registry
│           └── tasks/
│               ├── types.ts     # TaskDefinition, EvalCheck, RewardProfile, etc.
│               ├── registry.ts  # Task registration, lookup, filtering
│               └── curriculum.ts # 10-stage curriculum builder
├── sites/
│   ├── shopify-admin/           # E-commerce simulation (104 tasks)
│   ├── linear/                  # Project management simulation (166 tasks)
│   ├── jira/                    # Project management simulation (176 tasks)
│   └── slack/                   # Messaging simulation (123 tasks, WIP)
├── sdk/                         # Python SDK
│   └── thetabench/
│       ├── env.py               # Gymnasium environment wrapper
│       ├── client.py            # HTTP client
│       ├── types.py             # Pydantic response models
│       ├── runner.py            # Batch evaluation runner
│       ├── curriculum.py        # Curriculum runner with mastery gates
│       └── cli.py               # CLI tool
└── paper/                       # Research paper
```

## Component Diagram

```
                     Python SDK (thetabench)
                           │
                     HTTP requests
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    Next.js Site Server                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ /api/sim/*   │  │ /api/rl/*    │  │ /api/data/*  │       │
│  │ Episode mgmt │  │ RL interface │  │ CRUD routes  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │               │
│         ▼                 ▼                  ▼               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              @thetabench/core                         │     │
│  │                                                     │     │
│  │  Episode Manager ─► Snapshot Engine ─► Evaluator    │     │
│  │       │                                    │        │     │
│  │       │              LLM Judge ◄───────────┘        │     │
│  │       │                                             │     │
│  │  Task Registry ─── Curriculum ─── Config System     │     │
│  │       │                                             │     │
│  │  Predicate Registry                                 │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              Site Adapter                           │     │
│  │  getState() │ reset() │ executeMutation()           │     │
│  │  collections: ["products","orders",...]             │     │
│  │  singletons: ["settings"]                           │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              In-Memory Store                        │     │
│  │  _products[] │ _orders[] │ _customers[] │ etc.      │     │
│  │  CRUD functions │ Validators │ Deterministic time    │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              UI Pages (React + Polaris/Tailwind)    │     │
│  │  39+ admin pages (Shopify) │ Issue tracker (Linear) │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow: Complete Episode Lifecycle

### 1. Episode Start (`POST /api/sim/config`)

```
Client sends: { task_id: "prod-001", mode: "rest", seed: 42 }
                    │
                    ▼
           Episode Manager
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
 Lookup task    Reset store     Apply config
 from registry  (with seed)     overrides
                    │
                    ▼
           Run setup mutations
           (pre-conditions for this task)
                    │
                    ▼
           Capture initial snapshot
           (deep clone of full state)
                    │
                    ▼
           Return Episode object
           { episode_id, task, initial_snapshot }
```

### 2. Agent Interaction Loop (`GET/POST /api/rl`)

```
Agent observes:  GET /api/rl
                    │
                    ▼
           Build observation
           { currentPage, data, availableActions, episode, summary }
                    │
                    ▼
           Agent decides action
                    │
                    ▼
Agent acts:     POST /api/rl { action: "update_product", productId: "1", fields: {...} }
                    │
                    ▼
           Execute mutation on store
                    │
                    ▼
           Compute step reward
           (base reward + shaped penalty)
                    │
                    ▼
           Log action to episode
                    │
                    ▼
           Check termination
           (max steps? time limit? task complete?)
                    │
                    ▼
           Return { observation, reward, done, truncated, info }
```

### 3. Episode Finish (`POST /api/sim/finish`)

```
Client sends: { agent_response: "4 unfulfilled orders" }
                    │
                    ▼
           Capture final snapshot
                    │
                    ▼
           Compute state diff
           (field-level: added, removed, modified)
                    │
                    ▼
           Run eval checks
           (state_diff, state_exists, state_absent,
            state_count, state_predicate)
                    │
                    ▼
           Run LLM judge (if retrieval/impossible task)
           judgeRetrieval() or judgeImpossibleTask()
                    │
                    ▼
           Compute final score
           Action tasks: weighted eval check average
           Retrieval tasks: judge result (pass/fail)
           Combined tasks: 50% eval + 50% judge
                    │
                    ▼
           Compute total reward
           sum(step rewards) + (eval score × completion bonus)
                    │
                    ▼
           Return EpisodeResult
           { score, diff, eval, judge_result, total_reward, wall_time }
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Core engine | TypeScript | Type safety for complex state management |
| Build tool | vite-plus | Fast TypeScript library bundling |
| Site servers | Next.js 16 | App Router, React Server Components, API routes |
| React | v19 | Latest features, concurrent rendering |
| Shopify UI | Polaris 13 | Pixel-perfect Shopify Admin fidelity |
| Linear/Jira UI | Base UI + Tailwind CSS 4 | Lightweight, customizable components |
| Python SDK | httpx + gymnasium + pydantic | Standard ML/RL ecosystem tools |
| Monorepo | pnpm workspaces | Fast installs, content-addressable store |

## Key Design Decisions

### In-Memory State (Not Database)

All site state lives in module-level JavaScript variables (`_products`, `_orders`, etc.). This is intentional:
- **Speed**: No database round-trips. State access is <1ms.
- **Determinism**: `reset(seed)` restores identical state every time.
- **Simplicity**: No migrations, connections, or ORM.
- **Trade-off**: No concurrent episode isolation (each server instance handles one episode at a time).

### JSON Deep-Clone Snapshots (Not Redux/Event Sourcing)

State snapshots use `JSON.parse(JSON.stringify(state))`:
- **Framework-agnostic**: Works with any state shape.
- **No dependencies**: No Redux middleware, no IndexedDB, no external storage.
- **Trade-off**: O(n) in state size per snapshot. Acceptable for mock data scales (~10-50KB).

### Separated Collections vs Singletons

The snapshot engine distinguishes between:
- **Collections** (`products`, `orders`): Arrays of objects with `id` fields. Diffed by ID-based matching.
- **Singletons** (`settings`): Single objects. Diffed by key comparison.

This enables the evaluator to handle "entity X was added/removed" separately from "field Y changed on entity Z".

### Dense Rewards (Not Binary)

Every step produces a reward signal:
- **Step penalty** (`rewardProfile.stepPenalty`, default -0.01): Encourages efficiency.
- **Invalid action penalty** (`rewardProfile.invalidActionPenalty`, default -0.1): Discourages random exploration.
- **Partial credit**: Weighted average of eval checks that pass.
- **Completion bonus** (`rewardProfile.completion`): Large positive reward on task success.

This is ThetaBench's core differentiator from binary-reward benchmarks (WebArena, REAL).

### Deterministic Timestamps

Stores use a `_dateOverride` + `_dateCounter` pattern to generate deterministic timestamps. When a seed is provided:
- `now()` returns `dateOverride + counter` instead of `Date.now()`
- Every episode with the same seed produces identical timestamps
- Essential for reproducible evaluation
