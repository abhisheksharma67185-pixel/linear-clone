# SimBench — How It Works

## Overview

SimBench is a **benchmark environment** for training and evaluating autonomous web agents. Clients bring their own AI model/agent. SimBench provides the simulated websites, tasks, and scoring.

```
+------------------+         +------------------------+
|  Client's Agent  |  HTTP   |  SimBench (your infra) |
|  (their model)   | <-----> |  e.g. shopify-admin    |
|                  |         |  running on Vercel      |
+------------------+         +------------------------+
```

## Quick Start (Client Perspective)

```python
pip install simbench

import simbench

# Client brings their own agent (GPT-4, Claude, Gemini, custom model)
from their_lab import WebAgent

agent = WebAgent(model="their-model-v3")
env = simbench.make("shopify-admin", task_id="prod-001")

obs, info = env.reset()           # SimBench sets up the task
print(info["task_goal"])          # "Update the price of Classic Cotton T-Shirt to $34.99"

while True:
    action = agent.decide(obs)    # THEIR model picks the action
    obs, reward, done, trunc, info = env.step(action)  # SimBench executes + scores
    if done or trunc:
        break

result = env.finish()
print(result["score"])            # 0.0 - 1.0
```

That's it. The client writes ~15 lines of glue code. SimBench handles everything else: mock UI, state management, evaluation, scoring.

## Two Modes

| Mode | How It Works | Who Uses It |
|------|-------------|-------------|
| **REST** (fast) | Agent sends JSON actions (`update_product`, `navigate`). 1-5ms per step. No browser needed. | RL training loops, batch evaluation, leaderboard runs |
| **Browser** (realistic) | Agent controls a real Chromium browser via Playwright. Sees screenshots + accessibility tree. | Vision-language models, screenshot-based agents, real-world testing |

### REST Mode

```python
env = simbench.make("shopify-admin", task_id="prod-001", mode="rest")
obs, info = env.reset()
obs, reward, done, trunc, info = env.step({
    "action": "update_product",
    "productId": "1",
    "fields": {"price": "34.99"}
})
```

### Browser Mode

```python
pip install 'simbench[browser]'
playwright install chromium

env = simbench.make("shopify-admin", task_id="prod-001", mode="browser")
obs, info = env.reset()
# obs contains: screenshot (bytes), accessibility_tree, url, state
obs, reward, done, trunc, info = env.step({
    "type": "click",
    "selector": "#price-input"
})
```

## What Clients Bring vs What SimBench Provides

### Client provides:
- Their AI model / agent
- Glue code to connect agent decisions to SimBench actions
- Their own compute (GPU clusters for training)

### SimBench provides:
- Simulated websites (Shopify Admin, Linear, and more)
- 111 tasks across 8 domains and 10 difficulty stages
- Deterministic evaluation with ground-truth scoring
- Gymnasium-compatible Python SDK
- REST API for programmatic access
- Curriculum system for progressive training
- Leaderboard for comparison

## What Clients DON'T Need

- **No UI dashboard** — they run scripts, not click buttons
- **No accounts or auth** — they self-host or hit the Vercel URL
- **No training infrastructure** — they have their own GPU clusters
- **No browser for REST mode** — pure JSON over HTTP

## Architecture

```
Client Code
    |
    v
simbench (Python SDK)
    |
    v
HTTP API (/api/sim/*, /api/rl/*)
    |
    v
@simbench/core (TypeScript engine)
    |
    +-- Episode Manager (start, log, evaluate, finish)
    +-- Snapshot Engine (capture state, compute diffs)
    +-- Evaluator (6 check types, weighted scoring)
    +-- LLM Judge (retrieval + impossibility detection)
    +-- Config System (universal + site-specific)
    +-- Curriculum (10-stage progression)
    +-- Task Registry (111 tasks, filterable)
    |
    v
Site Plugin (e.g. Shopify Admin)
    |
    +-- Mock Data Store (products, orders, customers, discounts, settings)
    +-- 39 Polaris UI pages
    +-- CRUD API (/api/data/*)
    +-- Site-specific predicates
```

## Task Types

| Type | Count | How It Works |
|------|-------|-------------|
| **Action** | ~71 | Agent must modify state (create, update, delete entities). Scored by comparing before/after snapshots. |
| **Retrieval** | 15 | Agent must find and report information. Scored by LLM judge comparing response to ground truth. |
| **Impossible** | 8 | Task cannot be completed (e.g. refund an already-refunded order). Agent must recognize and explain why. |
| **Multi-domain** | 14 | Tasks spanning multiple entity types (e.g. create a product AND a discount for it). |

## Curriculum System

10 progressive stages from beginner to expert:

| Stage | Focus | Example |
|-------|-------|---------|
| 1 | Navigation Basics | Navigate to the products page |
| 2 | Single Field Reads & Updates | Update a product price |
| 3 | Entity Creation | Create a new product |
| 4 | Order Operations | Fulfill an order |
| 5 | Multi-Field Operations | Update multiple product fields at once |
| 6 | Search & Information Retrieval | Find a product by vendor name |
| 7 | Conditional Logic | Archive all draft products |
| 8 | Error Recognition & Multi-Step | Recognize an impossible task |
| 9 | Cross-Domain Workflows | Create product + discount + update order |
| 10 | Expert Scenarios | Complex multi-step operations |

## The Vision (Multi-Site)

```
                           +--- shopify-admin (e-commerce)
                           +--- linear (project management)
                           +--- gmail-sim (email)
SimBench Platform ---------+--- github-sim (code hosting)
                           +--- slack-sim (messaging)
                           +--- salesforce-sim (CRM)
                           +--- ... (100+ planned)

                   +--------------------------------------+
Client runs:       | simbench eval --suite all-sites      |
                   |   --agent gpt4o_web_agent            |
                   |   --output results.json              |
                   +--------------------------------------+

Result: "GPT-4o scores 73% on SimBench (856/1000+ tasks across 10 sites)"
```

Each new site follows the same pattern:
1. Implement `SiteAdapter` interface from `@simbench/core`
2. Define task definitions with eval checks
3. Register tasks and predicates
4. The SDK, API, curriculum, and scoring all work automatically

## Roadmap to Production Launch

### Must Have (before labs take it seriously)

| Item | Why | Status |
|------|-----|--------|
| **5+ sites** | 1 site = demo, 5+ = benchmark. Labs need diversity to prove generalization. | 1 done, 1 scaffolded |
| **Baseline results** | "Here's how GPT-4o / Claude / Gemini score." Without this, no reference point. | Not started |
| **Deterministic seeding** | `seed` param must guarantee identical state across runs. Critical for reproducible research. | Partial |
| **Published PyPI package** | `pip install simbench` from PyPI, not `pip install ./sdk`. | Not started |

### Should Have

| Item | Why | Status |
|------|-----|--------|
| **Docker self-hosting** | `docker run -p 3000:3000 simbench/shopify-admin`. Labs need local speed for training loops. | Not started |
| **Batch evaluation CLI** | `simbench eval --agent my_agent.py --suite shopify-all --output results.json` | Not started |
| **Standardized results format** | JSON output that labs can upload to leaderboard or include in papers. | Not started |

### Nice to Have

| Item | Why | Status |
|------|-----|--------|
| **Public leaderboard website** | Like HELM or Chatbot Arena — labs submit scores, public ranking. | Not started |
| **Paper on arXiv** | Draft exists, needs baseline numbers to publish. | Draft done |
| **Multi-agent support** | Concurrent episodes for parallel evaluation. | Not started |
