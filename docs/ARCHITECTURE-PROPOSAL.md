# ThetaBench Architecture Proposal

> Decision document for the next phase of `@thetabench/core` and the sim sites.
> Supersedes `ARCHITECTURE-V2.md` (which is kept for historical reference but no
> longer reflects the recommended direction).

## What this doc decides

What `@thetabench/core` and the sim sites should look like in 6 months, and
what we change first to get there. Three options below; my recommendation is
**Option B** (per-instance state via a `SimEngine` class), shipped over ~2 weeks.

---

## Where we are today (the honest version)

```
packages/thetabench-core/             — 1,344 LoC, pure TS, zero runtime deps
├── src/
│   ├── episode.ts        ── module-level singletons (_activeEpisode, _siteAdapter)
│   ├── evaluator.ts      ── pure functions ✓
│   ├── snapshot.ts       ── pure functions ✓
│   ├── llm-judge.ts      ── deterministic string matcher (NOT actually an LLM call)
│   ├── predicates.ts     ── module-level Map<string, PredicateFn>
│   ├── config.ts         ── module-level _universalConfig
│   ├── tasks/registry.ts ── module-level Map<string, TaskDefinition>
│   ├── tasks/types.ts    ── TaskDomain enum hardcoded with EVERY site's domains
│   └── ...

sites/{shopify-admin,linear,jira,slack,zendesk}/
├── app/lib/
│   ├── store.ts          ── per-site mock data + CRUD + module-level singleton
│   ├── sim-adapter.ts    ── registers core adapter + tasks + predicates
│   ├── init-sim.ts       ── re-export trigger imported by every API route
│   └── tasks/*.ts        ── ~80 task definitions per site
└── app/api/
    ├── health/, sim/{config,episode,evaluate,finish,leaderboard,snapshot,state,tasks}/, rl/{,reset,action-space}/
    └── (jira: 50 routes, linear: 25, shopify: 28, slack: 48 — varies because some sites also serve CRUD)
```

### What works

- Every site uses the same engine via TS path mapping → guaranteed metric consistency
- The engine's pure functions (`evaluate`, `captureSnapshot`, `computeDiff`, `judgeRetrieval`) work cleanly
- Episode lifecycle works end-to-end (verified live)
- Deterministic seeding works
- The Python SDK (separate repo) consumes the HTTP contract

### What hurts

| Pain | Concrete evidence | Cost |
|---|---|---|
| **Singleton episode state** | `let _activeEpisode: Episode \| null` in `episode.ts:58` | One Next.js process = one concurrent episode. RLHF training with N parallel rollouts requires N processes. |
| **Singleton site adapter** | `let _siteAdapter: SiteAdapter \| null` in `episode.ts:59` | An inspector or test harness can't run an episode side-by-side with the live site in the same process. |
| **TaskDomain enum is a god-list** | `tasks/types.ts:5-25` lists every domain across every site (`products`, `orders`, `issues`, `cycles`, `channels`, ...) | Adding a new site requires editing core. Inverted dependency: leaf depends on plugin-specific names. |
| **Route file duplication** | jira=50, slack=48, shopify=28 route files — most are near-identical wrappers around `getActiveEpisode()` etc. | Adding a new endpoint requires touching N files. Bugs fixed in one site don't propagate. |
| **No tests** | `find packages/thetabench-core -name '*.test.ts'` → 0 files | A regression in `evaluate()` silently changes every benchmark score. No safety net. |
| **"LLM judge" is not actually an LLM** | `llm-judge.ts` is 100% string matching | Misleading naming, and retrieval scores are systematically pessimistic. |
| **No persistence** | Action log lives in `_activeEpisode.actionLog` only | Can't replay episodes, can't analyze what an agent did after the fact, no offline RL data. |
| **HTTP-only** | Python → HTTP → Node → JSON serialize → store mutation → JSON serialize → response → Python | RLHF training at scale needs in-process or IPC, not HTTP. ~5-50ms/step now; 0.01ms/step possible. |

### What does NOT hurt (don't fix what isn't broken)

- The core's pure-function modules (`evaluator`, `snapshot`, `predicates` lookup, `judgeRetrieval` algorithm) — keep as-is.
- TS path mapping for code sharing — works fine, no need to publish core to npm.
- The basic site adapter shape (`getState`, `reset`, `executeMutation`) — fine.
- The HTTP API contract — Python SDK depends on it; don't break.
- Module structure (one file per concept) — fine for current scale.

---

## Three options

### Option A — Cleanup only (1-3 days)

**Scope**

- Add unit tests for `evaluate`, `judgeRetrieval`, `captureSnapshot`/`computeDiff`, episode lifecycle (vitest, `*.test.ts` next to source).
- Add real LLM judge via Vercel ai-sdk: `judgeRetrievalLLM()` that hits an LLM **only** when `ANTHROPIC_API_KEY` is set, otherwise falls back to the existing string matcher. Default behavior unchanged → reproducibility preserved.
- Extract the ~10 standard sim/rl route handlers into shared functions in core (`createSimRoutes(adapter)` returns the handlers). Sites import these and re-export. Reduces 50 jira route files to ~10 thin wrappers.
- Remove site-specific names from `TaskDomain` enum — make it `string` with a `KNOWN_DOMAINS` const for autocomplete. Sites declare their own domains.

**What we keep**

Singletons. One episode per process. HTTP-only API. Path-mapping code sharing.

**Pros** Fast. Low risk. Unblocks zendesk + Vercel ai-sdk ask. Buys safety net (tests) before bigger surgery.
**Cons** Doesn't solve parallelism. Doesn't solve persistence. We'll be back here in 6 months.

### Option B — Per-instance state via `SimEngine` class (recommended, 1-2 weeks)

**Scope**

Everything in Option A, plus:

- Introduce `SimEngine` class in core: holds `episode`, `siteAdapter`, `predicates`, `config`, `tasks` as instance state, not module state. All current free functions become methods.
- Each site instantiates `const engine = new SimEngine(plugin)` once at app startup (still one per Next.js process for now — no behavior change yet).
- Site-specific singletons (`store.ts` mutable state) get the same treatment: `class SiteStore { ... }` per site, instantiated once. Mutations become methods, not free functions.
- API routes resolve their `SimEngine` instance from a request-scoped factory. Today: returns the global singleton. Tomorrow: can return a per-request instance for parallel episodes per process.
- Add a tiny persistence interface: `engine.onTransition(handler)` lets the runtime stream actions to a JSONL trajectory file (or anywhere). Wire a default file-backed store at `~/.thetabench/trajectories/{episode_id}.jsonl`. Opt-in via env var.

**What we keep**

HTTP-only API (Python SDK keeps working). Path-mapping. Per-site Next.js apps. Tests + LLM judge from Option A.

**Pros**
- Removes the singleton ceiling — multi-episode per process is now a config flag away.
- `SimEngine` is testable in isolation (instantiate, run an episode, assert) — no module reloads.
- Persistence opens RL replay + offline RL workflows.
- Inspector + CLI become more powerful (each can hold its own engine instance).
- Migration is mechanical: rename `let _x = null` → `this.x = null`, similar for stores.

**Cons**
- Touches every site (~5 sim-adapter files + ~5 store.ts files). Each ~50 LoC change. Total ~500 LoC of edits + test updates. Not glamorous.
- Per-request engine instances need an async-context (AsyncLocalStorage) wrapper in routes to avoid leaking between concurrent requests. Subtle but well-trodden territory.

### Option C — Full library extraction + process pool (4-8 weeks)

**Scope**

Everything in Option B, plus:

- Split core into `@thetabench/sim-core` (pure logic), `@thetabench/sim-runtime` (route handlers + persistence + IPC server), `@thetabench/sim-pool` (process orchestrator).
- Sites become "plugins" exposing only `SitePlugin` — no API routes (those move to runtime, generated from plugin metadata).
- IPC fast path for Python via Node subprocess + MessagePack (skip HTTP for the hot loop). 5-50ms/step → 0.05-0.5ms/step expected.
- `sim-pool` orchestrates N child Node processes, each running an `SimEngine`. Round-robin or task-aware dispatch.
- Trajectory store gets an indexed backend (SQLite + Parquet) for offline RL.
- Browser pool for vision-language eval (Playwright).

**Pros** End-state architecture. ~100x faster steps. True multi-process parallelism. Production-grade infra for AI lab consumption.
**Cons** Months of work. Big rewrite. Incompatible with the current site model (sites lose their Next.js routes — UI becomes a separate concern). High risk. Probably needs a dedicated person.

---

## Recommendation: **Option B**, starting next week

### Why

1. **Solves the highest-pain problem (singletons) without exotic infra.** Per-instance state buys 80% of Option C's value with 15% of the effort.
2. **Tests + real LLM judge land regardless** — both are part of Option A and required before any bigger surgery anyway.
3. **Keeps the Python SDK contract stable.** No HTTP changes. Existing users don't notice.
4. **Doesn't bet the farm on Option C's harder calls.** IPC vs FFI vs WASM, process pool topology, browser pool — those decisions are easier with one more month of usage data.
5. **Matches a real ship cadence.** Two engineers can complete it in a sprint. Option C is a roadmap item, not a sprint item.

### Reject Option A because

The singleton problem is the load-bearing reason this doesn't scale. Avoiding it now means re-doing this work in 3 months when the parallelism request comes from a real consumer.

### Reject Option C (for now) because

We don't yet have a paying RLHF training customer asking for 100k steps/sec. Once we do, Option C is justified — but doing it pre-emptively is over-engineering. Option B leaves the door wide open: per-instance state is the necessary precondition for a future Option C anyway.

---

## If we pick Option B: migration plan

### Week 1 — core refactor + tests + LLM judge

| Day | Work | Blast radius |
|---|---|---|
| 1 | Add vitest. Write tests for current `evaluate`, `judgeRetrieval`, `captureSnapshot`/`computeDiff`. Lock in current behavior as baseline. | core only |
| 1-2 | Add Vercel ai-sdk `judgeRetrievalLLM()`. Default off; opt-in via env. Test parity vs string matcher on a fixture set. | core only |
| 2-3 | Refactor `episode.ts`, `predicates.ts`, `config.ts`, `tasks/registry.ts` to a single `SimEngine` class. Keep the free-function exports as deprecated thin wrappers around a default global engine — sites keep working. | core only, backwards compatible |
| 4 | Add `engine.onTransition(handler)` + default JSONL trajectory writer. Opt-in via `THETA_TRAJECTORY_DIR` env. | core only |
| 5 | Extract route handlers (`createSimRoutes(engine)`) into core. Migrate one site (jira) to use them. Verify everything still passes. | jira only |

### Week 2 — per-site rollout + test the boundary

| Day | Work | Blast radius |
|---|---|---|
| 6-7 | Per-site `SiteStore` class refactor (one site at a time, jira → linear → shopify → slack). | each site, isolated |
| 8 | Migrate remaining 3 sites' routes to `createSimRoutes()`. Delete duplicate route files. | all sites |
| 9 | Drop site-specific names from `TaskDomain` (string with KNOWN_DOMAINS const). Sites declare their own. | core + tasks/types.ts callers |
| 10 | Wire async-context for per-request engine instances behind a feature flag (`THETA_ALLOW_CONCURRENT=1`). Default off. Add a stress test (100 concurrent episodes one one server). | core + routes |

### What stays unfinished (intentional)

- IPC fast path → Option C, future quarter.
- Browser pool → Option C, future quarter.
- Adaptive curriculum scheduler → already in `tasks/curriculum.ts`, doesn't need changes.
- Process pool / multi-machine → Option C, future quarter.
- Trajectory store as SQLite/Parquet → JSONL is enough for v1; upgrade later if query patterns demand it.

### Risks + mitigations

| Risk | Mitigation |
|---|---|
| Per-instance refactor breaks Python SDK contract | Keep HTTP shapes byte-identical; add SDK contract tests pre-refactor; CI gate. |
| AsyncLocalStorage perf hit on hot path | Benchmark before flipping the flag; node:async_hooks is well-optimized but verify. |
| LLM judge nondeterminism leaks into eval scores | Default off. Mark explicitly when used. Persist judge mode to episode result. |
| One site falls behind during migration | Each site migrates independently; intermediate state where 3 use new + 2 use old is supported during the transition. |

---

## Tooling we just added (already in flight)

These ship alongside the refactor and validate the architecture:

- **`packages/thetabench-cli`** — `theta` CLI for inspecting/exercising the engine. Validates the public TS API is usable from outside Next.js.
- **`sites/inspector`** — visual dashboard. Validates the HTTP API surface. Talks to running sites and renders engine state.

Both projects expose architectural friction the moment they exist. If the CLI struggles to start an episode without instantiating a fake site, that's the signal to push through Option B faster.

---

## Decision needed from you

1. **Greenlight Option B?** If yes, week 1 starts immediately (tests + LLM judge are already on my list anyway).
2. **Defer Option C explicitly until** [a real consumer needs >1k steps/sec / a specific training run blocks on it / Q3 next year — pick one]. Without a forcing function it'll drift.
3. **Trajectory persistence default location** — `~/.thetabench/trajectories/` or in-repo `./trajectories/` (gitignored)?
