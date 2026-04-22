# ThetaBench for AI Frontier Labs

## The Problem You Have

You train models to interact with websites (computer use, browsing, form filling). To measure if your model is getting better, you need:

- **Reproducible websites** that don't change between eval runs (real websites change daily)
- **Ground-truth scoring** — not "did it look right" but "did the database state match exactly"
- **Hundreds of tasks** across different web apps to test generalization
- **Fast iteration** — run evals in minutes, not hours

| Alternative | Problem |
|-------------|---------|
| WebArena | 812 tasks but slow (real browsers), complex setup, non-deterministic |
| MiniWoB++ | Toy tasks (click buttons), not realistic web apps |
| Real websites | Change daily, no ground truth, can't train on production |
| Build your own | 6-12 months of eng time, not your core competency |

## What ThetaBench Gives You

- **264 tasks** across 3 sites (Shopify Admin: 104 tasks, Linear: 80 tasks, Jira: 80 tasks) and 10 difficulty stages
- **Deterministic evaluation** with ground-truth state-diff scoring
- **REST mode** at 1-5ms/step for RL training loops
- **Browser mode** via Playwright for vision-language model evaluation
- **Gymnasium-compatible** Python SDK — drop-in for your training pipeline
- **CLI tool** for batch evaluation with standardized JSON output
- **New sites added** without any changes to your agent code

## Integration (15 minutes)

### Install

```bash
pip install ./sdk
```

### Write Your Agent (the only code you write)

```python
# your_agent.py
import anthropic  # or openai, google.generativeai, etc.

client = anthropic.Anthropic()
MODEL = "claude-4.7-internal"

def agent_step(obs, info):
    """Your model decides what action to take."""
    response = client.messages.create(
        model=MODEL,
        messages=[{
            "role": "user",
            "content": f"""You are on a Shopify Admin page.

Goal: {obs['observation']['episode']['taskGoal']}
Current page: {obs['observation']['currentPage']}
Available actions: {obs['observation']['availableActions']}
Products: {obs['observation']['data']['products'][:5]}
Orders: {obs['observation']['data']['orders'][:5]}

Return a JSON action. Example:
{{"action": "update_product", "productId": "1", "fields": {{"price": "34.99"}}}}"""
        }]
    )
    return json.loads(response.content[0].text)

def agent_response(obs, info):
    """Your model answers retrieval/impossibility questions."""
    response = client.messages.create(
        model=MODEL,
        messages=[{
            "role": "user",
            "content": f"Answer this concisely: {obs['observation']['episode']['taskGoal']}\nAvailable data: {obs['observation']['data']}"
        }]
    )
    return response.content[0].text
```

### Run Evaluation

```bash
# Single task
thetabench run --task prod-001 --agent your_agent.py

# Full Shopify benchmark (104 tasks)
thetabench eval --agent your_agent.py --output results.json

# Full Linear benchmark (80 tasks)
thetabench eval --agent your_agent.py --url http://localhost:3001 --output linear-results.json

# Full Jira benchmark (80 tasks)
thetabench eval --agent your_agent.py --url http://localhost:3002 --output jira-results.json

# View platform info
thetabench info
```

### Run Against the Linear Site

```python
import thetabench

# Linear runs on a separate port (default: 3001)
env = thetabench.make("linear", base_url="http://localhost:3001", task_id="issue-001")
obs, info = env.reset()

while True:
    action = your_model.decide(obs)
    obs, reward, done, truncated, info = env.step(action)
    if done or truncated:
        break

result = env.finish()
print(f"Score: {result['score']:.0%}")
```

### Run Against the Jira Site

```python
import thetabench

# Jira runs on a separate port (default: 3002)
env = thetabench.make("jira", base_url="http://localhost:3002", task_id="jira-001")
obs, info = env.reset()

while True:
    action = your_model.decide(obs)
    obs, reward, done, truncated, info = env.step(action)
    if done or truncated:
        break

result = env.finish()
print(f"Score: {result['score']:.0%}")
```

### Or Use the Python API Directly

```python
import thetabench

env = thetabench.make("shopify-admin", task_id="prod-001")
obs, info = env.reset()

while True:
    action = your_model.decide(obs)
    obs, reward, done, truncated, info = env.step(action)
    if done or truncated:
        break

result = env.finish()
print(f"Score: {result['score']:.0%}")
```

### Or Run in Your Training Loop

```python
import thetabench

runner = thetabench.CurriculumRunner("http://localhost:3000")
for stage_result in runner.run(agent_step_fn, agent_response_fn):
    print(f"Stage {stage_result['stage']}: {stage_result['avg_score']:.0%}")
    if not stage_result['mastery_achieved']:
        break  # Agent hasn't mastered this stage yet
```

## What You Get From Results

```json
{
  "summary": {
    "total_evaluated": 104,
    "passed": 74,
    "score": 0.71
  },
  "domains": {
    "products":    { "score": 0.82, "tasks": 33 },
    "orders":      { "score": 0.55, "tasks": 22 },
    "customers":   { "score": 0.64, "tasks": 14 },
    "discounts":   { "score": 0.58, "tasks": 12 },
    "retrieval":   { "score": 0.93, "tasks": 15 },
    "impossible":  { "score": 0.38, "tasks": 8  }
  },
  "curriculum": [
    { "stage": 1,  "title": "Navigation Basics",  "score": 0.95 },
    { "stage": 5,  "title": "Multi-Field Ops",    "score": 0.70 },
    { "stage": 10, "title": "Expert Scenarios",   "score": 0.20 }
  ]
}
```

This tells you **exactly where your model is weak** — then you train on more order-workflow data, or teach it to recognize impossible tasks, or improve its multi-step planning.

## Three Deployment Modes

### 1. CI/CD Gate (every model release)
```yaml
# In your CI pipeline
- name: Run ThetaBench eval
  run: |
    thetabench eval --agent agents/claude_web.py --output thetabench.json
    python check_threshold.py thetabench.json --min-score 0.65
```
Score must pass threshold to ship. Catches regressions automatically.

### 2. RL Training Loop (high volume)
```python
# 100K+ episodes/day in REST mode (1-5ms/step)
env = thetabench.make("shopify-admin", task_id="prod-001", mode="rest")
for episode in range(100_000):
    obs, info = env.reset(seed=episode)
    # ... training loop with shaped rewards
```

### 3. Research Benchmark (published results)
```
"Claude 4.7 scores 71% on ThetaBench v0.1 (Shopify Admin),
 up from 62% on Claude 4.6. Largest gains in order workflows
 (+18%) and retrieval tasks (+12%). See Table 3."
```

## Self-Hosting

### Local Node.js
```bash
pnpm install
pnpm --filter shopify-admin-sim dev
# Server starts at http://localhost:3000

# Then point your agent at localhost
thetabench eval --agent your_agent.py --url http://localhost:3000
```

### Vercel (for quick evaluation)
Already deployed at `https://shopify-admin-sim.vercel.app`

```bash
thetabench eval --agent your_agent.py --url https://shopify-admin-sim.vercel.app
```

## Task Types

| Type | Count | How Scored | Example |
|------|-------|-----------|---------|
| **Action** | 181 | State-diff: did the database change correctly? | "Change product price to $34.99" |
| **Retrieval** | 50 | LLM judge: does agent's answer match ground truth? | "What is the price of Hiking Jacket?" |
| **Impossible** | 18 | LLM judge: did agent recognize the task can't be done? | "Refund an already-refunded order" |
| **Multi-domain** | 15 | Combined state-diff across multiple entities | "Create product + discount for it" |

## Curriculum (10 Stages)

Progressive difficulty for training:

| Stage | Focus | Difficulty |
|-------|-------|-----------|
| 1 | Navigation | Easy |
| 2 | Single field updates | Easy |
| 3 | Entity creation | Easy-Medium |
| 4 | Order operations | Medium |
| 5 | Multi-field operations | Medium |
| 6 | Search + information retrieval | Medium |
| 7 | Conditional logic | Medium-Hard |
| 8 | Error recognition | Hard |
| 9 | Cross-domain workflows | Hard |
| 10 | Expert scenarios | Hard |

## Observation Space

Every step, your agent receives:

```python
{
  "observation": {
    "currentPage": "/admin/products",
    "episode": {
      "taskGoal": "Change the price of 'Classic Cotton T-Shirt' to $34.99",
      "stepsRemaining": 12
    },
    "availableActions": ["navigate", "update_product", "create_product", ...],
    "data": {
      "products": [{"id": "1", "title": "Classic Cotton T-Shirt", "price": "29.99", ...}],
      "orders": [...],
      "customers": [...],
      "discounts": [...]
    },
    "summary": {
      "totalProducts": 12,
      "totalOrders": 10,
      "unfulfilledOrders": 4,
      ...
    }
  }
}
```

## Action Space (14 actions)

| Action | Fields | Context |
|--------|--------|---------|
| `navigate` | `url` | Any page |
| `search` | `query` | Any page |
| `select` | `ids[]` | List pages |
| `create_product` | `title, price, status, ...` | Products page |
| `update_product` | `productId, fields{}` | Product detail |
| `delete_product` | `productId` | Product detail |
| `fulfill_order` | `orderId` | Order detail |
| `capture_payment` | `orderId` | Order detail |
| `refund_order` | `orderId` | Order detail |
| `add_order_note` | `orderId, message` | Order detail |
| `create_customer` | `fields{}` | Customers page |
| `update_customer` | `customerId, fields{}` | Customer detail |
| `create_discount` | `fields{}` | Discounts page |
| `update_settings` | `fields{}` | Settings page |

## Baseline Results

Rule-based agent (no LLM): **14.7%** overall, **100%** on impossible tasks.

This is the floor. Your model should significantly outperform this.

## Roadmap

| Phase | Sites | Tasks | Status |
|-------|-------|-------|--------|
| v0.1 | Shopify Admin | 104 | Live |
| v0.2 | + Linear (project mgmt) | 184 | Live |
| v0.3 | + Jira (project mgmt) | 264 | Live |
| v0.4 | + Gmail, GitHub, Slack | ~500 | Planned |
| v1.0 | 10+ sites | 1000+ | Planned |

Each new site works with the same SDK, CLI, and agent interface. No changes to your code.

## Contact

Rahul Sulegaokar
GitHub: github.com/RahulSulegoakar/shopify-admin-sim
