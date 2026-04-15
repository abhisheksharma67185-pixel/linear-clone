# Getting Started

This guide walks you through installing SimBench, running your first task, and integrating your own agent.

## Prerequisites

- **Node.js >= 20** (for the simulation server)
- **Python >= 3.10** (for the SDK)
- **npm** (comes with Node.js)

## 1. Start the Simulation Server

```bash
# Clone and install
git clone <repo-url> simbench
cd simbench
npm install

# Build the shared core engine
cd packages/simbench-core
npm run build
cd ../..

# Start Shopify Admin (port 3000)
cd sites/shopify-admin
npm run dev
```

The server is ready when you see `http://localhost:3000`. Open it in a browser to see the simulated Shopify Admin UI.

### Running Other Sites

Each site runs as a separate Next.js app:

```bash
# Linear (port 3001)
cd sites/linear
PORT=3001 npm run dev

# Jira (port 3002)
cd sites/jira
PORT=3002 npm run dev
```

## 2. Install the Python SDK

```bash
cd sdk
pip install -e .

# Optional: browser mode support
pip install -e '.[browser]'
playwright install chromium
```

## 3. Verify the Setup

```bash
# Check server health
curl http://localhost:3000/api/health

# List available tasks
simbench info --url http://localhost:3000

# List tasks
simbench tasks --url http://localhost:3000
```

## 4. Run Your First Task (No Agent)

```python
import simbench

# Create environment pointing at a specific task
env = simbench.make("shopify-admin", task_id="prod-001")

# Start the episode
obs, info = env.reset()
print(f"Goal: {info['task_goal']}")
print(f"Page: {obs['currentPage']}")
print(f"Actions: {obs['availableActions']}")

# Take a single action
action = {"action": "update_product", "productId": "1", "fields": {"price": "34.99"}}
obs, reward, terminated, truncated, info = env.step(action)
print(f"Reward: {reward}, Done: {terminated}")

# Finish and get the score
result = env.finish()
print(f"Score: {result['score']}")
env.close()
```

## 5. Write a Simple Agent

Create a file `my_agent.py`:

```python
import json

def agent_step(obs, info):
    """Called each step. Returns an action dict."""
    goal = obs.get("episode", {}).get("taskGoal", "")
    page = obs.get("currentPage", "")
    actions = obs.get("availableActions", [])

    # Simple rule: if on the wrong page, navigate
    if "products" in goal.lower() and "/products" not in page:
        return {"action": "navigate", "url": "/admin/products"}

    # Default: do nothing useful
    return {"action": "navigate", "url": "/admin"}

def agent_response(obs, info):
    """Called at episode end for retrieval/impossible tasks. Returns a string answer."""
    return "I don't know"
```

Run it:

```bash
# Single task
simbench run --task prod-001 --agent my_agent.py

# Full evaluation (all 104 Shopify tasks)
simbench eval --agent my_agent.py --output results.json
```

## 6. Write an LLM-Powered Agent

```python
import json
import anthropic

client = anthropic.Anthropic()
MODEL = "claude-sonnet-4-20250514"

def agent_step(obs, info):
    """Use Claude to decide the next action."""
    response = client.messages.create(
        model=MODEL,
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""You are navigating a Shopify Admin dashboard.

Goal: {obs['episode']['taskGoal']}
Current page: {obs['currentPage']}
Available actions: {obs['availableActions']}
Products: {json.dumps(obs['data']['products'][:3], indent=2)}

Return ONLY a JSON action. Examples:
{{"action": "navigate", "url": "/admin/products"}}
{{"action": "update_product", "productId": "1", "fields": {{"price": "34.99"}}}}
{{"action": "create_product", "title": "New Shirt", "price": "24.99", "status": "active"}}"""
        }]
    )
    return json.loads(response.content[0].text)

def agent_response(obs, info):
    """Answer retrieval/impossible task questions."""
    response = client.messages.create(
        model=MODEL,
        max_tokens=200,
        messages=[{
            "role": "user",
            "content": f"Answer concisely: {obs['episode']['taskGoal']}\nData: {json.dumps(obs['data'])}"
        }]
    )
    return response.content[0].text
```

## 7. Use the Curriculum Runner

Train progressively through 10 difficulty stages:

```python
import simbench

runner = simbench.CurriculumRunner(
    base_url="http://localhost:3000",
    mastery_threshold=0.8,  # 80% average to advance
)

for stage_result in runner.run(agent_step, agent_response):
    print(f"Stage {stage_result['stage']}: {stage_result['title']}")
    print(f"  Score: {stage_result['avg_score']:.0%}")
    print(f"  Passed: {stage_result['tasks_passed']}/{stage_result['tasks_attempted']}")
    print(f"  Mastery: {'Yes' if stage_result['mastery_achieved'] else 'No'}")

    if not stage_result["mastery_achieved"]:
        print("Agent stuck - needs more training at this level")
        break
```

## 8. Browser Mode

For vision-language model agents that need screenshots:

```python
import simbench

env = simbench.make(
    "shopify-admin",
    task_id="prod-001",
    mode="browser",
    headless=False,  # Set True for CI
    viewport=(1280, 720),
)

obs, info = env.reset()
# obs contains: screenshot (bytes), accessibility_tree, url, state

# Browser actions use Playwright primitives
obs, reward, done, truncated, info = env.step({
    "type": "click",
    "selector": "#price-input"
})

obs, reward, done, truncated, info = env.step({
    "type": "fill",
    "selector": "#price-input",
    "value": "34.99"
})

result = env.finish()
env.close()
```

## 9. Context Manager (Auto-Cleanup)

```python
import simbench

with simbench.make("shopify-admin", task_id="prod-001") as env:
    obs, info = env.reset()
    # ... your agent loop ...
    result = env.finish()
# Browser and HTTP connections are cleaned up automatically
```

## What's Next

- [Python SDK Reference](sdk-reference.md) - Full API docs for all SDK classes
- [REST API Reference](api-reference.md) - Direct HTTP endpoint docs
- [Task Authoring Guide](task-authoring.md) - Write your own tasks
- [Site Plugin Guide](site-plugin-guide.md) - Add a new simulated website
