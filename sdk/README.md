# SimBench Python SDK

Gymnasium-compatible SDK for training and evaluating web agents on SimBench environments.

## Installation

```bash
pip install simbench

# With browser mode support (Playwright)
pip install 'simbench[browser]'
```

## Quick Start

### REST Mode (Fast Training — 1-5ms/step)

```python
import simbench

env = simbench.make("shopify-admin", task_id="prod-001")
obs, info = env.reset()

print(f"Task: {info['task_goal']}")
print(f"Max steps: {info['max_steps']}")

done = False
while not done:
    # Your agent decides what to do
    action = {"action": "update_product", "productId": "1", "fields": {"price": "34.99"}}
    obs, reward, terminated, truncated, info = env.step(action)
    done = terminated or truncated

result = env.finish()
print(f"Score: {result['score']:.0%} | Steps: {result['steps']} | Reward: {result['total_reward']:.2f}")
env.close()
```

### Browser Mode (Realistic Evaluation)

```python
import simbench

env = simbench.make("shopify-admin", task_id="prod-001", mode="browser")
obs, info = env.reset()

# obs includes screenshot, accessibility tree, and URL
print(f"URL: {obs['url']}")

action = {"type": "navigate", "url": "/admin/products/1"}
obs, reward, terminated, truncated, info = env.step(action)

action = {"type": "fill", "selector": "#price", "value": "34.99"}
obs, reward, terminated, truncated, info = env.step(action)

action = {"type": "click", "selector": "button:has-text('Save')"}
obs, reward, terminated, truncated, info = env.step(action)

result = env.finish()
env.close()
```

### Curriculum Training

```python
import simbench

def my_agent(obs, info):
    # Your agent logic here
    return {"action": "navigate", "target": "/admin/products"}

runner = simbench.CurriculumRunner(
    base_url="http://localhost:3000",
    mastery_threshold=0.8,
)

for stage_result in runner.run(my_agent):
    print(f"Stage {stage_result['stage']}: {stage_result['title']}")
    print(f"  Score: {stage_result['avg_score']:.0%}")
    print(f"  Mastery: {'Yes' if stage_result['mastery_achieved'] else 'No'}")

runner.close()
```

### Browse Tasks

```python
from simbench import SimBenchClient

client = SimBenchClient("http://localhost:3000")

# List all tasks
tasks = client.list_tasks()
print(f"Total tasks: {tasks.total}")

# Filter by domain and difficulty
easy_product_tasks = client.list_tasks(domain="products", difficulty="easy")
for t in easy_product_tasks.tasks:
    print(f"  {t.id}: {t.title}")

# Get curriculum
curriculum = client.get_curriculum()
for stage in curriculum.stages:
    print(f"Stage {stage.stage}: {stage.title} ({len(stage.taskIds)} tasks)")

client.close()
```

## API Reference

### `simbench.make(site, task_id, mode, **kwargs)`

Factory function for creating environments.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `site` | str | `"shopify-admin"` | Site identifier |
| `task_id` | str | `"prod-001"` | Task to run |
| `base_url` | str | `"http://localhost:3000"` | SimBench server URL |
| `mode` | str | `"rest"` | `"rest"` or `"browser"` |

### `SimBenchEnv` (Gymnasium)

| Method | Returns | Description |
|--------|---------|-------------|
| `reset()` | `(obs, info)` | Start new episode |
| `step(action)` | `(obs, reward, terminated, truncated, info)` | Execute action |
| `evaluate()` | `dict` | Mid-episode score check |
| `finish(response?)` | `dict` | End episode, get final score |
| `close()` | None | Cleanup |

### `CurriculumRunner`

| Method | Description |
|--------|-------------|
| `run(agent_fn)` | Generator yielding stage results |
| `run_stage(stage, agent_fn)` | Run all tasks in one stage |
| `run_task(task_id, agent_fn)` | Run a single task |
