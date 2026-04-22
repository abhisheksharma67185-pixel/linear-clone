# Python SDK Reference

The `thetabench` Python package provides a Gymnasium-compatible interface for interacting with ThetaBench simulation servers.

**Package:** `thetabench` v0.1.0
**Source:** `sdk/thetabench/`
**Python:** >= 3.10
**Dependencies:** `httpx>=0.27`, `gymnasium>=1.0`, `pydantic>=2.0`
**Optional:** `playwright>=1.40` (for browser mode)

## Installation

```bash
# Basic (REST mode)
cd sdk && pip install -e .

# With browser support
pip install -e '.[browser]'
playwright install chromium

# Development
pip install -e '.[dev]'
```

---

## `thetabench.make()` -- Factory Function

```python
thetabench.make(
    site: str = "shopify-admin",
    task_id: str = "prod-001",
    base_url: str = "http://localhost:3000",
    mode: Literal["rest", "browser"] = "rest",
    **kwargs
) -> ThetaBenchEnv
```

Creates a `ThetaBenchEnv` instance. If `site` is not `"shopify-admin"` and `base_url` is the default, the URL is auto-constructed as `http://localhost:3000/sites/{site}`.

```python
# Shopify Admin
env = thetabench.make("shopify-admin", task_id="prod-001")

# Linear
env = thetabench.make("linear", base_url="http://localhost:3001", task_id="issue-001")

# Browser mode
env = thetabench.make("shopify-admin", task_id="prod-001", mode="browser", headless=False)
```

---

## `ThetaBenchEnv` -- Gymnasium Environment

```python
class ThetaBenchEnv(gym.Env):
```

### Constructor

```python
ThetaBenchEnv(
    base_url: str = "http://localhost:3000",
    task_id: str = "prod-001",
    mode: Literal["rest", "browser"] = "rest",
    render_mode: Optional[str] = None,
    seed: Optional[int] = None,
    config_overrides: Optional[dict] = None,
    headless: bool = True,           # Browser mode only
    viewport: tuple[int, int] = (1280, 720),  # Browser mode only
)
```

### `reset(*, seed=None, options=None) -> (obs, info)`

Starts a new episode for the configured task.

- If `seed` is provided, overrides the constructor seed for this episode
- If `options["config_overrides"]` is set, overrides constructor config

**Returns:**
- `obs`: Observation dict (varies by mode -- see below)
- `info`: `{"episode_id", "task_id", "task_goal", "max_steps"}`

### `step(action: dict) -> (obs, reward, terminated, truncated, info)`

Executes one action. Returns the standard Gymnasium 5-tuple.

**REST mode actions** are JSON dicts:
```python
{"action": "update_product", "productId": "1", "fields": {"price": "34.99"}}
{"action": "navigate", "url": "/admin/products"}
{"action": "create_product", "title": "Hat", "price": "24.99", "status": "active"}
```

**Browser mode actions** are Playwright primitives:
```python
{"type": "click", "selector": "#price-input"}
{"type": "fill", "selector": "#price-input", "value": "34.99"}
{"type": "navigate", "url": "/admin/products"}
{"type": "select", "selector": "#status", "value": "active"}
{"type": "keyboard", "key": "Enter"}
{"type": "scroll", "delta": 300}
```

### `evaluate() -> dict`

Mid-episode non-destructive evaluation. Returns eval result with score and per-check breakdown.

### `finish(agent_response=None) -> dict`

Ends the episode and returns the final result. Pass `agent_response` for retrieval/impossible tasks.

**Returns:**
```python
{
    "episode_id": "ep_...",
    "task_id": "prod-001",
    "status": "completed",          # or "failed", "timeout"
    "steps": 3,
    "score": 1.0,                   # 0.0 - 1.0
    "total_reward": 9.97,
    "wall_time_seconds": 0.15,
    "eval": {"score": 1.0, "checks": [...], "passed": 1, "total": 1},
    "judge_result": None,           # or {"passed": true, "reasoning": "...", "matchType": "exact"}
    "diff": {"added": [], "removed": [], "modified": [...]},
    "action_log": [...]
}
```

### `close()`

Closes HTTP client and browser (if open).

### Context Manager

```python
with thetabench.make("shopify-admin", task_id="prod-001") as env:
    obs, info = env.reset()
    # ... agent loop ...
    result = env.finish()
# Auto-cleanup
```

### Observations

**REST mode** (dict):
```python
{
    "currentPage": "/admin/products",
    "episode": {"taskGoal": "...", "stepsRemaining": 8},
    "availableActions": ["navigate", "update_product", ...],
    "data": {"products": [...], "orders": [...], "customers": [...], "discounts": [...]},
    "summary": {"totalProducts": 12, "totalOrders": 10, ...}
}
```

**Browser mode** (dict):
```python
{
    "screenshot": b"...",           # PNG bytes
    "accessibility_tree": {...},    # Playwright a11y snapshot
    "url": "http://localhost:3000/admin/products",
    "state": {...}                  # Full JSON state from API
}
```

---

## `ThetaBenchClient` -- Low-Level HTTP Client

```python
class ThetaBenchClient:
    def __init__(self, base_url="http://localhost:3000", timeout=30.0)
```

Thin wrapper around the ThetaBench HTTP API using `httpx`. All methods raise `ThetaBenchError` on failure.

### Episode Lifecycle

```python
# Start episode
client.start_episode(task_id, mode="rest", seed=None, config_overrides=None) -> EpisodeStartResponse

# End episode
client.finish_episode(agent_response=None) -> EpisodeFinishResponse

# Mid-episode evaluation
client.evaluate() -> EvalResult
```

### RL Interaction

```python
# Execute action, get Gymnasium 5-tuple
client.step(action: dict) -> StepResponse

# Get current observation
client.observe() -> dict

# Reset RL session (not episode)
client.reset_env() -> dict
```

### State Inspection

```python
client.get_state(diff=False) -> dict      # Full state or state diff
client.get_snapshot() -> dict              # Initial snapshot
client.get_episode() -> dict               # Episode status
```

### Tasks & Curriculum

```python
client.list_tasks(**filters) -> TaskListResponse
client.get_task(task_id) -> dict
client.get_curriculum() -> CurriculumResponse
```

### Episode Logging

```python
client.log_action(action, payload=None, reward=0.0, success=True) -> dict
```

### Action Space

```python
client.get_action_space() -> dict
```

### Error Handling

```python
class ThetaBenchError(Exception):
    status_code: int    # HTTP status
    detail: str         # Server error message
    url: str            # Request URL
```

---

## `BatchRunner` -- Bulk Evaluation

```python
class BatchRunner:
    def __init__(
        self,
        base_url="http://localhost:3000",
        agent_step_fn=None,
        agent_response_fn=None,
        agent_name="unknown",
        model_name="unknown",
        mode="rest",
        site="shopify-admin",
        verbose=True,
    )
```

Runs all (or filtered) tasks and produces a standardized results JSON.

### `run_all(domain=None, difficulty=None, task_type=None) -> dict`

Runs filtered tasks. Returns:

```python
{
    "meta": {
        "agent": "my_agent",
        "model": "claude-4.7",
        "mode": "rest",
        "site": "shopify-admin",
        "thetabench_version": "0.1.0",
        "server_url": "http://localhost:3000",
        "timestamp": "2026-04-15T10:00:00Z"
    },
    "summary": {
        "total_available": 104,
        "total_evaluated": 104,
        "passed": 74,
        "score": 0.712,
        "avg_steps": 4.2,
        "avg_time_seconds": 0.15
    },
    "domains": {
        "products": {"tasks": 25, "passed": 20, "score": 0.82},
        "orders": {"tasks": 14, "passed": 8, "score": 0.55},
        ...
    },
    "curriculum": [
        {"stage": 1, "tasks": 5, "score": 0.95},
        {"stage": 2, "tasks": 12, "score": 0.83},
        ...
    ],
    "tasks": [
        {"id": "prod-001", "domain": "products", "score": 1.0, "status": "completed", ...},
        ...
    ]
}
```

---

## `CurriculumRunner` -- Progressive Training

```python
class CurriculumRunner:
    def __init__(
        self,
        base_url="http://localhost:3000",
        mode: Literal["rest", "browser"] = "rest",
        mastery_threshold: float = 0.8,
    )
```

### `run(agent_step_fn, agent_response_fn=None, start_stage=1) -> Generator`

Generator that yields stage results, advancing when mastery is achieved. Stops on first stage failure.

```python
for result in runner.run(agent_step, agent_response):
    print(f"Stage {result['stage']}: {result['avg_score']:.0%}")
    if not result["mastery_achieved"]:
        break
```

Each yielded result:

```python
{
    "stage": 1,
    "title": "Navigation Basics",
    "tasks_attempted": 5,
    "tasks_passed": 5,
    "avg_score": 1.0,
    "mastery_achieved": True,
    "results": [...]           # Per-task results
}
```

### `run_stage(stage, agent_step_fn, agent_response_fn=None) -> dict`

Run all tasks in a specific stage without curriculum progression.

### `run_task(task_id, agent_step_fn, agent_response_fn=None) -> dict`

Run a single task. Returns the finish result with an extra `cumulative_reward` field.

---

## `thetabench` CLI

```bash
thetabench [--url URL] <command> [options]
```

### Commands

#### `thetabench info`

Show platform info (version, site, task count, domain breakdown).

```bash
thetabench info --url http://localhost:3000
```

#### `thetabench tasks`

List available tasks with optional filters.

```bash
thetabench tasks
thetabench tasks --domain products
thetabench tasks --type retrieval --difficulty hard
thetabench tasks --stage 3
```

#### `thetabench run`

Run a single task.

```bash
thetabench run --task prod-001
thetabench run --task prod-001 --agent my_agent.py
```

#### `thetabench eval`

Batch evaluation with standardized output.

```bash
thetabench eval --agent my_agent.py
thetabench eval --agent my_agent.py --domain products --output products.json
thetabench eval --agent my_agent.py --difficulty hard --output hard.json
```

### Agent File Format

Agent files must export:

```python
def agent_step(obs: dict, info: dict) -> dict:
    """Required. Returns an action dict."""
    ...

def agent_response(obs: dict, info: dict) -> Optional[str]:
    """Optional. Returns a text answer for retrieval/impossible tasks."""
    ...
```

---

## Pydantic Response Models

**Source:** `sdk/thetabench/types.py`

| Model | Fields |
|-------|--------|
| `TaskSummary` | id, site, domain, type, difficulty, curriculum_stage, title, goal, max_steps, tags |
| `TaskListResponse` | total, filtered, tasks: list[TaskSummary] |
| `EpisodeStartResponse` | episode_id, task, status, initial_snapshot |
| `EpisodeFinishResponse` | episode_id, task_id, status, steps, score, total_reward, wall_time_seconds, eval, judge_result, diff, action_log |
| `StepResponse` | observation, reward, done, truncated, info |
| `EvalResult` | score, checks, passed, total |
| `JudgeResult` | passed, reasoning, matchType |
| `CurriculumStage` | stage, title, description, domains, difficultyRange, taskIds |
| `CurriculumResponse` | total_stages, stages: list[CurriculumStage] |
