# SimBench v2 Architecture — RL-Native Redesign

> Designed after auditing the full codebase and the 2026 RL-for-GUI-agents landscape
> (ComputerRL, OSGym, DigiRL/Digi-Q, DART-GUI, BrowserGym, Cua, WEBSERV, etc.)

---

## Executive Summary

The current SimBench is a **monolithic Next.js app** that serves UI, RL API, simulation engine, and data store in one process with singleton episode state. This makes parallelism impossible, couples the RL hot path to React SSR overhead, and has zero connection to actual RL training.

The redesign splits SimBench into **four independent layers** connected by well-defined interfaces:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LAYER 4: TRAINING                            │
│  GRPO / PPO via veRL  ·  Reward Models  ·  Curriculum Scheduler    │
│  Reads trajectories, produces model checkpoints                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ trajectories + rewards
┌──────────────────────────────▼──────────────────────────────────────┐
│                     LAYER 3: ORCHESTRATOR                           │
│  EnvPool  ·  VectorEnv  ·  Trajectory Store  ·  Rollout Collector  │
│  Manages N env instances, batches steps, stores trajectories        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ step() / reset() / snapshot()
┌──────────────────────────────▼──────────────────────────────────────┐
│                     LAYER 2: OBSERVATION PIPELINE                   │
│  Screenshot  ·  A11y Tree  ·  Set-of-Mark  ·  DOM Filter           │
│  Composes multi-modal observations for VLM input                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ raw state + browser page
┌──────────────────────────────▼──────────────────────────────────────┐
│                      LAYER 1: ENVIRONMENT                           │
│  SimWorld (pure lib)  ·  SitePlugin  ·  Evaluator  ·  Store        │
│  Fast, deterministic, no HTTP, no React — just state + transitions  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Environment (SimWorld)

### Problem with current design
The environment is trapped inside a Next.js HTTP server. Every step requires:
`Python → HTTP POST → Next.js → JSON parse → store mutation → JSON serialize → HTTP response → Python`

For RL training at scale (millions of steps), this is 100-1000x slower than necessary.

### Solution: Environment as a library, not a server

Extract the simulation engine into a **pure TypeScript library** (`@simbench/simworld`) with zero HTTP/React dependencies. Then expose it to Python via two paths:

```
                    ┌─────────────────────────────┐
                    │     @simbench/simworld       │
                    │  (pure TS lib, no HTTP)      │
                    │                              │
                    │  SimWorld class:             │
                    │    .reset(taskId, seed)      │
                    │    .step(action) → obs,r,d   │
                    │    .evaluate() → score       │
                    │    .getState() → snapshot    │
                    │    .clone() → SimWorld       │
                    └──────┬───────────┬───────────┘
                           │           │
              ┌────────────▼──┐   ┌────▼──────────────┐
              │  FAST PATH    │   │  RICH PATH        │
              │  (RL Training)│   │  (Browser Eval)   │
              │               │   │                   │
              │  Python ←→ TS │   │  Next.js + UI     │
              │  via IPC/FFI  │   │  + Playwright      │
              │  0.01ms/step  │   │  100-500ms/step   │
              └───────────────┘   └───────────────────┘
```

### SimWorld API

```typescript
// @simbench/simworld — the core environment, zero dependencies on HTTP/React

class SimWorld {
  private store: SiteStore;
  private episode: EpisodeState;
  private plugin: SitePlugin;

  constructor(siteId: string, options?: SimWorldOptions);

  // --- Episode lifecycle ---
  reset(taskId: string, seed?: number, config?: Record<string, unknown>): Observation;
  step(action: Action): StepResult;  // { obs, reward, terminated, truncated, info }
  evaluate(): EvalResult;            // mid-episode, non-destructive
  finish(agentResponse?: string): EpisodeResult;

  // --- State access ---
  getState(): Record<string, unknown>;
  getSnapshot(): Snapshot;
  getDiff(): StateDiff;

  // --- Cloning for parallel rollouts ---
  clone(): SimWorld;           // deep-copy for GRPO branching
  serialize(): Uint8Array;     // fast binary serialization
  static deserialize(buf: Uint8Array): SimWorld;

  // --- Task access ---
  static listTasks(siteId: string, filter?: TaskFilter): TaskDefinition[];
  static getTask(taskId: string): TaskDefinition;
}

interface StepResult {
  observation: Observation;
  reward: number;
  terminated: boolean;
  truncated: boolean;
  info: StepInfo;
}

interface Observation {
  mode: "structured" | "screenshot" | "hybrid";
  // Structured (REST mode)
  state?: Record<string, unknown>;
  availableActions?: string[];
  currentPage?: string;
  summary?: Record<string, unknown>;
  // Visual (browser mode)
  screenshot?: Uint8Array;
  accessibilityTree?: AccessibilityNode;
  setOfMark?: SetOfMarkAnnotation[];
  boundingBoxes?: BoundingBox[];
  // Always present
  taskGoal: string;
  stepsRemaining: number;
  stepCount: number;
}
```

### Key changes from v1

| Aspect | v1 (current) | v2 (proposed) |
|--------|-------------|---------------|
| Episode state | Singleton global (`let _activeEpisode`) | Per-instance (`this.episode`) |
| Store | Module-level singletons (`let _products`) | Per-instance (`this.store`) |
| Parallelism | 1 episode per process | N instances per process |
| Transport | HTTP (5-50ms/step) | In-process (0.01ms/step) |
| Dependencies | Next.js, React, Polaris | Zero — pure logic |
| Cloning | Impossible | `clone()` for GRPO branching |
| Serialization | JSON.parse/stringify | Binary (MessagePack/protobuf) |

### SiteStore (replaces module-level store.ts)

```typescript
// Each SimWorld instance owns its own store — no global state

class SiteStore {
  private data: Map<string, unknown[]>;  // collections
  private singletons: Map<string, unknown>;
  private counters: Map<string, number>;
  private rng: SeededRNG;

  constructor(initialData: SiteData, seed?: number);

  // Fast deep clone via structured clone (3-5x faster than JSON.parse/stringify)
  clone(): SiteStore;

  // Binary serialization for checkpointing
  serialize(): Uint8Array;
  static deserialize(buf: Uint8Array): SiteStore;

  // Collection access
  getCollection<T>(name: string): T[];
  getById<T>(collection: string, id: string): T | undefined;
  insert<T>(collection: string, item: T): T;
  update<T>(collection: string, id: string, fields: Partial<T>): T;
  delete(collection: string, id: string): boolean;

  // Singleton access
  getSingleton<T>(name: string): T;
  updateSingleton<T>(name: string, fields: Partial<T>): T;

  // Snapshot
  getState(): Record<string, unknown>;
}
```

### SitePlugin v2 (simplified)

```typescript
// Plugins register initial data, mutations, and tasks — that's it
// No more getState/setState/reset on the plugin — the engine handles that

interface SitePlugin {
  id: string;
  name: string;

  // Data
  getInitialData(): SiteData;

  // Mutations (the actions an agent can take)
  getMutations(): MutationDef[];
  executeMutation(store: SiteStore, name: string, args: unknown[]): MutationResult;

  // Tasks
  getTasks(): TaskDefinition[];

  // Predicates for evaluation
  getPredicates(): Record<string, PredicateFn>;

  // Action-space definition (for REST mode)
  getActionSpace(store: SiteStore, currentPage: string): ActionDef[];
}
```

### Python fast-path binding

For the RL training hot path, we avoid HTTP entirely:

```python
# Option A: Node subprocess with IPC (simplest, good enough for most cases)
# Python ←→ Node.js via stdin/stdout MessagePack

class SimWorldProcess:
    """Manages a Node.js subprocess running SimWorld instances."""
    
    def __init__(self, site_id: str, num_envs: int = 1):
        self._proc = subprocess.Popen(
            ["node", "--experimental-vm-modules", "simworld-worker.js"],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE
        )
        self._send({"cmd": "init", "site": site_id, "n": num_envs})
    
    def reset(self, env_idx: int, task_id: str, seed: int = None) -> dict:
        return self._send({"cmd": "reset", "env": env_idx, "task": task_id, "seed": seed})
    
    def step(self, env_idx: int, action: dict) -> tuple:
        r = self._send({"cmd": "step", "env": env_idx, "action": action})
        return r["obs"], r["reward"], r["terminated"], r["truncated"], r["info"]
    
    def step_batch(self, actions: list[dict]) -> list[tuple]:
        """Step all envs simultaneously — single IPC round-trip."""
        r = self._send({"cmd": "step_batch", "actions": actions})
        return [(s["obs"], s["reward"], s["terminated"], s["truncated"], s["info"]) for s in r]

# Option B: NAPI/FFI binding (fastest, for extreme scale)
# Compile SimWorld to native addon, call directly from Python via cffi
# ~10x faster than IPC but more complex to build/maintain

# Option C: WASM (portable, decent speed)
# Compile SimWorld to WASM, run in Python via wasmer/wasmtime
# 2-3x slower than native but zero Node.js dependency
```

---

## Layer 2: Observation Pipeline

### Problem with current design
Browser mode returns raw screenshots and raw a11y trees. No processing, no annotation, no filtering. VLMs need carefully composed multi-modal observations.

### Solution: Composable observation pipeline

```
Raw Browser State
       │
       ▼
┌──────────────────┐
│  Screenshot      │──→ Resize/crop → Set-of-Mark overlay → Base64/tensor
│  Capture         │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  A11y Tree       │──→ Filter (interactive only) → Flatten → Token-budget trim
│  Extraction      │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  DOM Filter      │──→ Extract visible text → Semantic landmarks → Compress
│  (optional)      │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Observation      │──→ Compose final multi-modal observation
│  Composer         │    (screenshot + a11y + task context + action history)
└──────────────────┘
```

### ObservationPipeline API

```python
class ObservationPipeline:
    """Composable pipeline for processing raw environment state into VLM-ready observations."""
    
    def __init__(self, config: ObsConfig):
        self.processors: list[ObsProcessor] = []
        
        if config.screenshot:
            self.processors.append(ScreenshotProcessor(
                resolution=config.resolution,       # (1280, 720) or (896, 672) for VLM
                set_of_mark=config.set_of_mark,     # annotate interactive elements
                crop_to_viewport=config.crop,
            ))
        
        if config.a11y_tree:
            self.processors.append(A11yTreeProcessor(
                filter_mode=config.a11y_filter,     # "interactive" | "visible" | "all"
                max_tokens=config.a11y_max_tokens,  # budget for a11y text
                flatten=config.a11y_flatten,         # tree → flat list
            ))
        
        if config.dom:
            self.processors.append(DOMProcessor(
                extract_text=True,
                semantic_landmarks=True,
            ))
    
    def process(self, raw_obs: RawObservation) -> ProcessedObservation:
        result = ProcessedObservation()
        for proc in self.processors:
            proc.apply(raw_obs, result)
        return result


@dataclass
class ObsConfig:
    # Mode
    mode: Literal["structured", "screenshot", "a11y", "hybrid"] = "hybrid"
    
    # Screenshot
    screenshot: bool = True
    resolution: tuple[int, int] = (1280, 720)
    set_of_mark: bool = True          # SoM annotation (numbered bounding boxes)
    crop: bool = False
    
    # Accessibility tree
    a11y_tree: bool = True
    a11y_filter: str = "interactive"   # only interactive elements
    a11y_max_tokens: int = 2048        # trim to fit context
    a11y_flatten: bool = True
    
    # DOM
    dom: bool = False
    
    # History
    include_action_history: int = 5    # last N actions in observation
    include_task_context: bool = True


@dataclass
class SetOfMarkAnnotation:
    """Bounding box + label for an interactive element."""
    id: int                    # sequential ID shown on screenshot
    bbox: tuple[int, int, int, int]  # x, y, w, h
    element_type: str          # "button", "input", "link", "select", etc.
    text: str                  # visible text or aria-label
    selector: str              # CSS/XPath selector for clicking
```

### Why this matters

The observation pipeline is what separates "works on toy tasks" from "works on real GUI tasks." Every successful RL-for-GUI paper (ComputerRL, UI-TARS-2, ZeroGUI) has a carefully designed observation pipeline. The current SimBench has none.

---

## Layer 3: Orchestrator

### Problem with current design
One episode at a time. No way to collect rollouts in parallel. No trajectory storage.

### Solution: Environment pool + vectorized stepping + trajectory store

```
┌──────────────────────────────────────────────────────────────────┐
│                         Orchestrator                              │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────┐                    │
│  │   EnvPool        │    │  TrajectoryStore  │                   │
│  │                  │    │                   │                   │
│  │  SimWorld[0] ────┼───→│  Trajectory DB    │                   │
│  │  SimWorld[1] ────┼───→│  (SQLite/Parquet) │                   │
│  │  SimWorld[2] ────┼───→│                   │                   │
│  │  ...             │    │  Columns:         │                   │
│  │  SimWorld[N-1]───┼───→│  - episode_id     │                   │
│  │                  │    │  - step           │                   │
│  └────────┬─────────┘    │  - observation    │                   │
│           │              │  - action         │                   │
│           ▼              │  - reward         │                   │
│  ┌─────────────────┐    │  - next_obs       │                   │
│  │  RolloutCollector│    │  - terminated     │                   │
│  │                  │    │  - truncated      │                   │
│  │  Batches steps   │    │  - value_est      │                   │
│  │  across N envs   │    │  - advantage      │                   │
│  │  for GPU-efficient│   │  - log_prob       │                   │
│  │  training        │    └──────────────────┘                   │
│  └─────────────────┘                                            │
│                                                                  │
│  ┌─────────────────────────────────────────────┐                │
│  │  CurriculumScheduler                        │                │
│  │                                             │                │
│  │  Tracks mastery per stage, assigns tasks    │                │
│  │  to envs based on current training stage    │                │
│  │  Supports:                                  │                │
│  │  - Sequential (stage 1→2→...→10)           │                │
│  │  - Mixed (sample from mastered + current)   │                │
│  │  - Adaptive (focus on failure modes)        │                │
│  └─────────────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────────────┘
```

### VectorEnv API (Gymnasium-compatible)

```python
class SimBenchVecEnv:
    """Vectorized environment for parallel rollout collection.
    
    Manages N SimWorld instances via a single Node.js worker process
    (or N processes for true parallelism). All N envs step in one
    IPC round-trip via step_batch().
    """
    
    def __init__(
        self,
        site_id: str,
        num_envs: int,
        task_sampler: TaskSampler,      # how to assign tasks to envs
        obs_pipeline: ObservationPipeline,
        mode: Literal["rest", "browser"] = "rest",
    ):
        self.num_envs = num_envs
        self.task_sampler = task_sampler
        self.obs_pipeline = obs_pipeline
        
        if mode == "rest":
            # Single Node.js process managing N SimWorld instances
            self._backend = SimWorldProcess(site_id, num_envs)
        else:
            # N browser instances (Playwright)
            self._backend = BrowserEnvPool(site_id, num_envs)
    
    def reset(self, env_mask: np.ndarray | None = None) -> tuple[list[Observation], list[dict]]:
        """Reset specified envs (or all if mask is None).
        
        Each reset env gets a new task from the task_sampler.
        """
        indices = np.where(env_mask)[0] if env_mask is not None else range(self.num_envs)
        obs_list, info_list = [], []
        
        for i in indices:
            task = self.task_sampler.sample()
            raw_obs = self._backend.reset(i, task.id)
            obs_list.append(self.obs_pipeline.process(raw_obs))
            info_list.append({"task_id": task.id, "task_goal": task.goal})
        
        return obs_list, info_list
    
    def step(self, actions: list[Action]) -> tuple[
        list[Observation],  # obs
        np.ndarray,         # rewards (N,)
        np.ndarray,         # terminated (N,)
        np.ndarray,         # truncated (N,)
        list[dict],         # infos
    ]:
        """Step all N envs simultaneously."""
        results = self._backend.step_batch(actions)
        
        obs = [self.obs_pipeline.process(r["obs"]) for r in results]
        rewards = np.array([r["reward"] for r in results])
        terminated = np.array([r["terminated"] for r in results])
        truncated = np.array([r["truncated"] for r in results])
        infos = [r["info"] for r in results]
        
        # Auto-reset terminated envs
        done_mask = terminated | truncated
        if done_mask.any():
            new_obs, new_infos = self.reset(done_mask)
            for i, idx in enumerate(np.where(done_mask)[0]):
                infos[idx]["terminal_observation"] = obs[idx]
                obs[idx] = new_obs[i]
        
        return obs, rewards, terminated, truncated, infos


class TaskSampler:
    """Assigns tasks to environments based on curriculum state."""
    
    def __init__(self, site_id: str, strategy: str = "curriculum"):
        self.tasks = SimWorld.listTasks(site_id)
        self.strategy = strategy
        self.mastery: dict[int, float] = {}  # stage → mastery score
    
    def sample(self) -> TaskDefinition:
        if self.strategy == "curriculum":
            # Find current stage (first unmastered)
            stage = self._current_stage()
            candidates = [t for t in self.tasks if t.curriculumStage == stage]
            return random.choice(candidates)
        
        elif self.strategy == "mixed":
            # 70% current stage, 30% mastered stages (prevent forgetting)
            stage = self._current_stage()
            if random.random() < 0.3 and stage > 1:
                prev_stage = random.randint(1, stage - 1)
                candidates = [t for t in self.tasks if t.curriculumStage == prev_stage]
            else:
                candidates = [t for t in self.tasks if t.curriculumStage == stage]
            return random.choice(candidates)
        
        elif self.strategy == "adaptive":
            # Focus on tasks with lowest success rate
            return self._sample_by_difficulty()
        
        elif self.strategy == "uniform":
            return random.choice(self.tasks)
    
    def update_mastery(self, task_id: str, score: float):
        """Update mastery tracking after episode completion."""
        task = next(t for t in self.tasks if t.id == task_id)
        stage = task.curriculumStage
        # Exponential moving average
        self.mastery[stage] = self.mastery.get(stage, 0) * 0.9 + score * 0.1
```

### TrajectoryStore

```python
class TrajectoryStore:
    """Persistent storage for episode trajectories.
    
    Supports:
    - Online RL: stream transitions as they happen
    - Offline RL: load batches of historical trajectories
    - Analysis: query trajectories by task, score, model, etc.
    """
    
    def __init__(self, path: str = "./trajectories"):
        self.path = Path(path)
        self.path.mkdir(exist_ok=True)
        self._db = self._init_db()
    
    # --- Writing ---
    
    def start_episode(self, episode_id: str, task_id: str, model: str, config: dict) -> EpisodeWriter:
        """Begin recording a new episode."""
        return EpisodeWriter(self._db, episode_id, task_id, model, config)
    
    # --- Reading ---
    
    def load_trajectories(
        self,
        task_ids: list[str] | None = None,
        min_score: float | None = None,
        max_score: float | None = None,
        model: str | None = None,
        limit: int | None = None,
    ) -> Iterator[Trajectory]:
        """Load trajectories matching filters. For offline RL."""
        ...
    
    def load_batch(self, batch_size: int, strategy: str = "uniform") -> TrajectoryBatch:
        """Load a batch of trajectories for training.
        
        Strategies:
        - "uniform": random sampling
        - "prioritized": weight by |TD error| or score
        - "curriculum": weight by curriculum stage
        """
        ...
    
    # --- Analysis ---
    
    def stats(self) -> dict:
        """Return summary statistics: episodes, avg score, per-task breakdown."""
        ...


class EpisodeWriter:
    """Writes transitions for a single episode."""
    
    def log_step(
        self,
        step: int,
        observation: dict,
        action: dict,
        reward: float,
        next_observation: dict,
        terminated: bool,
        truncated: bool,
        info: dict | None = None,
    ):
        ...
    
    def finalize(self, score: float, eval_result: dict):
        """Mark episode complete with final evaluation."""
        ...


@dataclass
class Trajectory:
    episode_id: str
    task_id: str
    model: str
    score: float
    steps: list[Transition]
    
@dataclass
class Transition:
    step: int
    observation: dict
    action: dict
    reward: float
    next_observation: dict
    terminated: bool
    truncated: bool
    value_estimate: float | None = None
    advantage: float | None = None
    log_prob: float | None = None
```

### RolloutCollector (bridges Orchestrator → Training)

```python
class RolloutCollector:
    """Collects rollouts from vectorized envs for RL training.
    
    This is the bridge between the environment layer and the training layer.
    Handles:
    - Multi-turn episode collection (not single-step like Atari)
    - VLM inference batching (group observations for efficient GPU use)
    - Trajectory storage
    - GRPO group collection (G rollouts per prompt)
    """
    
    def __init__(
        self,
        vec_env: SimBenchVecEnv,
        policy: Policy,                    # the VLM being trained
        trajectory_store: TrajectoryStore,
        reward_pipeline: RewardPipeline,
        grpo_group_size: int = 8,          # G rollouts per task
    ):
        self.vec_env = vec_env
        self.policy = policy
        self.trajectory_store = trajectory_store
        self.reward_pipeline = reward_pipeline
        self.G = grpo_group_size
    
    def collect_grpo_groups(self, num_groups: int) -> list[GRPOGroup]:
        """Collect groups of rollouts for GRPO training.
        
        For each task prompt, runs G rollouts and returns them as a group.
        GRPO computes advantages relative to the group mean reward.
        """
        groups = []
        
        for _ in range(num_groups):
            task = self.vec_env.task_sampler.sample()
            
            # Run G rollouts for this task (can use G envs in parallel)
            rollouts = []
            for g in range(self.G):
                trajectory = self._collect_single_rollout(task)
                rollouts.append(trajectory)
            
            # Compute group-relative advantages (GRPO)
            rewards = [r.total_reward for r in rollouts]
            mean_r = np.mean(rewards)
            std_r = np.std(rewards) + 1e-8
            for r in rollouts:
                r.advantage = (r.total_reward - mean_r) / std_r
            
            groups.append(GRPOGroup(task=task, rollouts=rollouts))
        
        return groups
    
    def _collect_single_rollout(self, task: TaskDefinition) -> Trajectory:
        """Run one episode to completion."""
        ...


@dataclass
class GRPOGroup:
    task: TaskDefinition
    rollouts: list[Trajectory]
```

---

## Layer 4: Training

### Problem with current design
No training integration whatsoever. SimBench is environment-only.

### Solution: Native veRL integration with GRPO + pluggable reward pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                       Training Loop                               │
│                                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │  veRL Trainer (or custom GRPO)               │               │
│  │                                              │               │
│  │  for each iteration:                         │               │
│  │    1. Collect G×N rollouts via Orchestrator   │               │
│  │    2. Compute rewards via RewardPipeline      │               │
│  │    3. Compute advantages (GRPO group-relative)│               │
│  │    4. Update policy (gradient step)           │               │
│  │    5. Log metrics, checkpoint                 │               │
│  │    6. Update curriculum (advance if mastered) │               │
│  └──────────────────────┬───────────────────────┘               │
│                         │                                        │
│  ┌──────────────────────▼───────────────────────┐               │
│  │  RewardPipeline                              │               │
│  │                                              │               │
│  │  Composes multiple reward signals:           │               │
│  │                                              │               │
│  │  ┌─────────────────┐ weight: 0.5            │               │
│  │  │ Rule-based       │ State-diff eval checks │               │
│  │  │ (from Evaluator) │ (current SimBench)     │               │
│  │  └─────────────────┘                         │               │
│  │                                              │               │
│  │  ┌─────────────────┐ weight: 0.3            │               │
│  │  │ Process Reward   │ Step-level learned     │               │
│  │  │ Model (PRM)      │ reward (trained on     │               │
│  │  │                  │ trajectory data)       │               │
│  │  └─────────────────┘                         │               │
│  │                                              │               │
│  │  ┌─────────────────┐ weight: 0.2            │               │
│  │  │ Outcome Reward   │ Episode-level learned  │               │
│  │  │ Model (ORM)      │ reward (binary: did    │               │
│  │  │                  │ the task succeed?)     │               │
│  │  └─────────────────┘                         │               │
│  │                                              │               │
│  │  final_reward = Σ(weight_i × reward_i)      │               │
│  └──────────────────────────────────────────────┘               │
│                                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │  CurriculumScheduler                         │               │
│  │                                              │               │
│  │  Tracks per-stage mastery across training     │               │
│  │  Advances when mastery > threshold            │               │
│  │  Supports stage regression on catastrophic    │               │
│  │  forgetting                                   │               │
│  └──────────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────┘
```

### RewardPipeline

```python
class RewardPipeline:
    """Composes multiple reward signals into a single scalar.
    
    Inspired by ComputerRL's reward design and WebRL's ORM.
    """
    
    def __init__(self, components: list[tuple[float, RewardComponent]]):
        self.components = components  # [(weight, component), ...]
    
    def compute(self, trajectory: Trajectory) -> float:
        total = 0.0
        for weight, component in self.components:
            total += weight * component.score(trajectory)
        return total
    
    def compute_step_rewards(self, trajectory: Trajectory) -> list[float]:
        """Per-step rewards for process supervision."""
        step_rewards = [0.0] * len(trajectory.steps)
        for weight, component in self.components:
            if hasattr(component, 'score_steps'):
                sr = component.score_steps(trajectory)
                for i, r in enumerate(sr):
                    step_rewards[i] += weight * r
        return step_rewards


class RuleBasedReward(RewardComponent):
    """Uses SimBench's existing eval checks (state_diff, state_exists, etc.)."""
    
    def score(self, trajectory: Trajectory) -> float:
        return trajectory.eval_result.score


class OutcomeRewardModel(RewardComponent):
    """Learned ORM: predicts whether the episode succeeded.
    
    Trained on (trajectory, binary_label) pairs from trajectory store.
    """
    
    def __init__(self, model_path: str):
        self.model = load_reward_model(model_path)
    
    def score(self, trajectory: Trajectory) -> float:
        # Encode final state + task goal → predict success probability
        return self.model.predict(trajectory.final_observation, trajectory.task_goal)


class ProcessRewardModel(RewardComponent):
    """Learned PRM: predicts per-step quality.
    
    Trained on step-level annotations from successful trajectories.
    """
    
    def score_steps(self, trajectory: Trajectory) -> list[float]:
        rewards = []
        for step in trajectory.steps:
            r = self.model.predict(step.observation, step.action, trajectory.task_goal)
            rewards.append(r)
        return rewards


class ProgressReward(RewardComponent):
    """Automatic dense reward from state-diff progress.
    
    At each step, measures how much closer the state is to the goal state.
    No manual reward shaping needed — derived from eval checks.
    """
    
    def score_steps(self, trajectory: Trajectory) -> list[float]:
        rewards = []
        prev_progress = 0.0
        for step in trajectory.steps:
            # How many eval checks pass now vs. previous step?
            current_progress = step.info.get("eval_progress", 0.0)
            delta = current_progress - prev_progress
            rewards.append(delta)  # positive when making progress
            prev_progress = current_progress
        return rewards
```

### GRPO Training Loop

```python
class SimBenchTrainer:
    """End-to-end GRPO training loop for GUI agents on SimBench.
    
    Integrates with veRL for distributed training or runs standalone.
    """
    
    def __init__(self, config: TrainConfig):
        # Environment
        self.vec_env = SimBenchVecEnv(
            site_id=config.site_id,
            num_envs=config.num_envs,
            task_sampler=TaskSampler(config.site_id, config.curriculum_strategy),
            obs_pipeline=ObservationPipeline(config.obs_config),
            mode=config.env_mode,
        )
        
        # Policy (the VLM being trained)
        self.policy = load_policy(config.model_name, config.model_path)
        
        # Reward
        self.reward_pipeline = RewardPipeline([
            (0.6, RuleBasedReward()),
            (0.2, ProgressReward()),
            (0.2, OutcomeRewardModel(config.orm_path) if config.orm_path else RuleBasedReward()),
        ])
        
        # Rollout collection
        self.collector = RolloutCollector(
            vec_env=self.vec_env,
            policy=self.policy,
            trajectory_store=TrajectoryStore(config.trajectory_path),
            reward_pipeline=self.reward_pipeline,
            grpo_group_size=config.grpo_G,
        )
        
        # Optimizer
        self.optimizer = torch.optim.AdamW(self.policy.parameters(), lr=config.lr)
    
    def train(self, num_iterations: int):
        for iteration in range(num_iterations):
            # 1. Collect rollouts
            groups = self.collector.collect_grpo_groups(num_groups=config.groups_per_iter)
            
            # 2. Compute GRPO loss
            loss = self._grpo_loss(groups)
            
            # 3. Gradient step
            self.optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.policy.parameters(), config.max_grad_norm)
            self.optimizer.step()
            
            # 4. Update curriculum
            for group in groups:
                for rollout in group.rollouts:
                    self.vec_env.task_sampler.update_mastery(
                        rollout.task_id, rollout.score
                    )
            
            # 5. Log
            self._log_metrics(iteration, groups)
            
            # 6. Checkpoint
            if iteration % config.checkpoint_every == 0:
                self._save_checkpoint(iteration)
    
    def _grpo_loss(self, groups: list[GRPOGroup]) -> torch.Tensor:
        """GRPO: Group Relative Policy Optimization.
        
        For each group of G rollouts on the same task:
        - Advantages are computed relative to the group mean
        - Policy gradient weighted by advantages
        - KL penalty against reference policy
        """
        total_loss = 0.0
        
        for group in groups:
            rewards = torch.tensor([r.total_reward for r in group.rollouts])
            advantages = (rewards - rewards.mean()) / (rewards.std() + 1e-8)
            
            for rollout, advantage in zip(group.rollouts, advantages):
                # Compute log probs under current policy
                log_probs = self.policy.log_prob(rollout.observations, rollout.actions)
                # Compute log probs under reference policy (for KL)
                ref_log_probs = self.ref_policy.log_prob(rollout.observations, rollout.actions)
                
                # Clipped surrogate objective (PPO-style clipping within GRPO)
                ratio = torch.exp(log_probs - rollout.old_log_probs)
                clipped = torch.clamp(ratio, 1 - self.clip_eps, 1 + self.clip_eps)
                pg_loss = -torch.min(ratio * advantage, clipped * advantage).mean()
                
                # KL penalty
                kl = (ref_log_probs - log_probs).mean()
                
                total_loss += pg_loss + self.kl_coeff * kl
        
        return total_loss / len(groups)
```

---

## New Directory Structure

```
theta-rl-labs/
├── packages/
│   ├── simworld/                          # LAYER 1: Pure environment library
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── simworld.ts            # SimWorld class (the environment)
│   │   │   │   ├── store.ts               # SiteStore (per-instance state)
│   │   │   │   ├── episode.ts             # Episode lifecycle (per-instance)
│   │   │   │   ├── evaluator.ts           # Eval checks
│   │   │   │   ├── snapshot.ts            # State capture & diff
│   │   │   │   ├── predicates.ts          # Predicate registry
│   │   │   │   └── types.ts              # Core types
│   │   │   ├── tasks/
│   │   │   │   ├── registry.ts            # Task registry
│   │   │   │   ├── curriculum.ts          # Curriculum stages
│   │   │   │   └── types.ts              # Task types
│   │   │   ├── plugins/                   # SitePlugin interface + loader
│   │   │   │   └── types.ts
│   │   │   ├── reward/
│   │   │   │   ├── rule-based.ts          # Current eval-check rewards
│   │   │   │   └── progress.ts            # Automatic progress-based dense rewards
│   │   │   └── worker/
│   │   │       ├── ipc-worker.ts          # Node.js IPC worker for Python binding
│   │   │       └── protocol.ts            # MessagePack IPC protocol
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── simworld-ui/                       # Shared UI components (optional)
│       └── ...
│
├── sites/                                 # Site plugins (same as before, but decoupled)
│   ├── shopify-admin/
│   │   ├── plugin/                        # Pure plugin code (no Next.js)
│   │   │   ├── index.ts                   # SitePlugin implementation
│   │   │   ├── data.ts                    # Initial data
│   │   │   ├── mutations.ts               # All mutations
│   │   │   ├── predicates.ts              # Site-specific predicates
│   │   │   └── tasks/                     # Task definitions
│   │   │       ├── navigation.ts
│   │   │       ├── products.ts
│   │   │       ├── orders.ts
│   │   │       └── ...
│   │   └── ui/                            # Next.js app (for browser mode + human use)
│   │       ├── app/
│   │       │   ├── admin/                 # UI pages (Polaris)
│   │       │   └── api/                   # Thin API routes (delegate to simworld)
│   │       └── package.json
│   ├── linear/
│   │   ├── plugin/
│   │   └── ui/
│   └── jira/
│       ├── plugin/
│       └── ui/
│
├── sdk/                                   # LAYER 2-3: Python SDK
│   ├── simbench/
│   │   ├── env.py                         # SimBenchEnv (Gymnasium, single env)
│   │   ├── vec_env.py                     # SimBenchVecEnv (vectorized, N envs)
│   │   ├── backend/
│   │   │   ├── ipc.py                     # SimWorldProcess (Node IPC, fast path)
│   │   │   ├── http.py                    # HTTP backend (for browser mode)
│   │   │   └── browser_pool.py            # Playwright pool for browser eval
│   │   ├── observation/
│   │   │   ├── pipeline.py                # ObservationPipeline
│   │   │   ├── screenshot.py              # Screenshot processor
│   │   │   ├── a11y.py                    # A11y tree processor
│   │   │   ├── set_of_mark.py             # SoM annotation
│   │   │   └── dom.py                     # DOM filter
│   │   ├── trajectory/
│   │   │   ├── store.py                   # TrajectoryStore
│   │   │   ├── writer.py                  # EpisodeWriter
│   │   │   └── loader.py                  # Batch loading for offline RL
│   │   ├── reward/
│   │   │   ├── pipeline.py                # RewardPipeline
│   │   │   ├── rule_based.py              # Rule-based (eval checks)
│   │   │   ├── progress.py                # State-diff progress reward
│   │   │   ├── orm.py                     # Outcome reward model
│   │   │   └── prm.py                     # Process reward model
│   │   ├── curriculum/
│   │   │   ├── sampler.py                 # TaskSampler
│   │   │   └── scheduler.py               # CurriculumScheduler
│   │   ├── client.py                      # HTTP client (backward compat)
│   │   ├── types.py                       # Pydantic models
│   │   ├── cli.py                         # CLI tool
│   │   └── runner.py                      # BatchRunner
│   ├── examples/
│   │   ├── demo_agent.py                  # Rule-based baseline
│   │   ├── vlm_agent.py                   # VLM agent example
│   │   └── grpo_train.py                  # GRPO training example
│   └── pyproject.toml
│
├── training/                              # LAYER 4: Training infrastructure
│   ├── configs/
│   │   ├── grpo_shopify_7b.yaml           # GRPO on Shopify with 7B VLM
│   │   ├── grpo_shopify_72b.yaml          # GRPO on Shopify with 72B VLM
│   │   └── offline_dpo.yaml               # Offline DPO from trajectories
│   ├── scripts/
│   │   ├── train_grpo.py                  # Main GRPO training script
│   │   ├── train_dpo.py                   # DPO training from trajectory pairs
│   │   ├── train_orm.py                   # Train outcome reward model
│   │   ├── train_prm.py                   # Train process reward model
│   │   ├── eval_model.py                  # Evaluate model on benchmark
│   │   └── collect_trajectories.py        # Collect trajectories for offline RL
│   ├── verl_integration/
│   │   ├── simworld_env.py                # veRL environment wrapper
│   │   └── simworld_reward.py             # veRL reward function
│   └── requirements.txt
│
├── paper/
│   └── simbench-paper.md
├── README.md
├── FOR-AI-LABS.md
├── HOW-IT-WORKS.md
├── ARCHITECTURE-V2.md                     # This document
├── Dockerfile
└── docker-compose.yml                     # Multi-container deployment
```

---

## Key Architectural Differences: v1 vs v2

| Dimension | v1 (Current) | v2 (Proposed) |
|-----------|-------------|---------------|
| **Environment** | Monolithic Next.js app | Pure TS library (`@simbench/simworld`) |
| **State** | Module-level singletons | Per-instance (N envs per process) |
| **Parallelism** | 1 episode/process | N episodes/process, M processes |
| **Transport (REST)** | HTTP (5-50ms/step) | IPC/FFI (0.01-0.1ms/step) |
| **Transport (Browser)** | HTTP + Playwright | Direct Playwright pool |
| **Observation** | Raw screenshot + a11y | Composable pipeline (SoM, filtered a11y, etc.) |
| **Rewards** | Hand-coded switch statement | Pluggable pipeline (rule + learned) |
| **Trajectory storage** | None (in-memory action log) | Persistent store (SQLite/Parquet) |
| **Training** | None | Native GRPO/PPO with veRL integration |
| **Curriculum** | Static 10-stage definition | Adaptive scheduler with mastery tracking |
| **Vectorized env** | No | Yes (`SimBenchVecEnv`) |
| **Site plugins** | Mixed with UI code | Pure logic, decoupled from UI |
| **Scalability** | Single machine, single process | Multi-process, multi-machine ready |

---

## Performance Targets

| Metric | v1 | v2 (REST) | v2 (Browser) |
|--------|-----|-----------|-------------|
| Steps/sec (1 env) | ~200 (HTTP) | ~100,000 (IPC) | ~2-10 (Playwright) |
| Steps/sec (64 envs) | N/A | ~1,000,000 | ~128-640 |
| Episode throughput/hr | ~3,600 | ~500,000+ | ~720-3,600 |
| Memory per env | ~50MB (Next.js) | ~2MB (store only) | ~100MB (browser) |
| Time to 1M steps | ~83 min | ~1 sec | ~28-139 hrs |

The 500x speedup in REST mode comes from eliminating HTTP overhead and running pure in-process state transitions.

---

## Migration Path

The redesign is **incremental** — each layer can be built and tested independently:

### Phase 1: Extract SimWorld library (1-2 weeks)
- Extract `episode.ts`, `evaluator.ts`, `snapshot.ts`, `predicates.ts` into `@simbench/simworld`
- Convert singleton state to per-instance state (`SimWorld` class)
- Extract Shopify plugin code from `sim-adapter.ts` + `store.ts` into `sites/shopify-admin/plugin/`
- Keep existing Next.js app working by having it instantiate SimWorld internally
- **Test**: Run existing Python SDK against both old and new paths, verify identical scores

### Phase 2: IPC fast path (1 week)
- Build `ipc-worker.ts` (Node.js process managing N SimWorld instances)
- Build `SimWorldProcess` Python class (IPC client)
- Update `SimBenchEnv` to use IPC backend for REST mode
- **Test**: Benchmark steps/sec, verify same results as HTTP path

### Phase 3: VectorEnv + Trajectory Store (1 week)
- Build `SimBenchVecEnv` wrapping N `SimWorldProcess` backends
- Build `TrajectoryStore` (SQLite for metadata, Parquet for observations)
- Wire trajectory recording into `RolloutCollector`
- **Test**: Collect 10K trajectories, verify storage/retrieval

### Phase 4: Observation Pipeline (1 week)
- Build `ScreenshotProcessor`, `A11yTreeProcessor`, `SetOfMarkAnnotator`
- Integrate with browser mode
- **Test**: Visual inspection of SoM annotations, a11y filtering quality

### Phase 5: Reward Pipeline (1 week)
- Build `RewardPipeline` with `RuleBasedReward` + `ProgressReward`
- Replace hand-coded switch statement in RL route
- **Test**: Compare reward distributions on 1K episodes vs. v1 rewards

### Phase 6: GRPO Training Integration (2 weeks)
- Build `SimBenchTrainer` with GRPO loop
- Build veRL integration wrapper
- Train a small VLM (Qwen-2.5-VL-3B) on Shopify curriculum stages 1-3
- **Test**: Training loss decreases, eval score improves over 1K iterations

---

## Relationship to Landscape

| System | What we learn from it | How v2 incorporates it |
|--------|----------------------|----------------------|
| **ComputerRL** | Online GRPO for desktop agents, OfficeWorld benchmark | GRPO training loop, curriculum-based training |
| **OSGym** | 1000+ parallel envs, distributed data engine | VectorEnv, IPC-based parallelism, trajectory store |
| **DigiRL/Digi-Q** | Online RL + offline Q-learning for device control | Dual online/offline support via trajectory store |
| **DART-GUI** | Decoupled training + adaptive data curation | Adaptive curriculum scheduler, separated rollout/update |
| **BrowserGym** | Gymnasium-compatible API, unified benchmarks | Same Gymnasium API, extended with VecEnv |
| **WEBSERV** | Scalable browser-server architecture | Browser pool for parallel eval |
| **Cua** | Multi-platform sandboxing, trajectory export | Platform-agnostic plugin interface, trajectory export |
| **WebRL** | Actor-Critic + outcome reward model | Pluggable reward pipeline with ORM |
| **VEM (GUI-Agent-RL)** | Environment-free value estimation | Offline RL support via trajectory store |
| **UI-TARS-2** | Multi-turn RL with process + outcome rewards | PRM + ORM in reward pipeline |

---

## What This Enables That v1 Cannot

1. **Train a VLM on SimBench tasks end-to-end** — not just evaluate, but actually improve the model
2. **GRPO with 64 parallel rollouts** — collect diverse trajectories for the same task simultaneously
3. **100K+ steps/second** — fast enough for RL training (v1's HTTP bottleneck makes this impossible)
4. **Offline RL from historical data** — train on collected trajectories without live env interaction
5. **Learned reward models** — train ORM/PRM on trajectory data, get better reward signals than hand-tuned
6. **Progressive curriculum with forgetting prevention** — adaptive task sampling with mastery gates
7. **Multi-modal observation pipeline** — SoM-annotated screenshots + filtered a11y trees for VLM input
8. **Sim-to-real transfer** — train fast on REST mode, evaluate on browser mode, graduate to real websites
9. **Trajectory analysis** — understand why agents fail, what they learn, where they plateau
10. **Multi-site training** — train on Shopify + Linear + Jira simultaneously with shared curriculum
