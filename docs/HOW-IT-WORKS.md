# ThetaBench — How It Works

## Overview

ThetaBench is a **benchmark environment** for training and evaluating autonomous web agents. Clients bring their own AI model/agent. ThetaBench provides the simulated websites, tasks, and scoring.

```
+------------------+         +------------------------+
|  Client's Agent  |  HTTP   |  ThetaBench (your infra) |
|  (their model)   | <-----> |  e.g. shopify-admin    |
|                  |         |  running on Vercel      |
+------------------+         +------------------------+
```

## Quick Start (Client Perspective)

```python
pip install ./sdk

import thetabench

# Client brings their own agent (GPT-4, Claude, Gemini, custom model)
from their_lab import WebAgent

agent = WebAgent(model="their-model-v3")
env = thetabench.make("shopify-admin", task_id="prod-001")

obs, info = env.reset()           # ThetaBench sets up the task
print(info["task_goal"])          # "Update the price of Classic Cotton T-Shirt to $34.99"

while True:
    action = agent.decide(obs)    # THEIR model picks the action
    obs, reward, done, trunc, info = env.step(action)  # ThetaBench executes + scores
    if done or trunc:
        break

result = env.finish()
print(result["score"])            # 0.0 - 1.0
```

That's it. The client writes ~15 lines of glue code. ThetaBench handles everything else: mock UI, state management, evaluation, scoring.

## Two Modes

| Mode | How It Works | Who Uses It |
|------|-------------|-------------|
| **REST** (fast) | Agent sends JSON actions (`update_product`, `navigate`). 1-5ms per step. No browser needed. | RL training loops, batch evaluation, leaderboard runs |
| **Browser** (realistic) | Agent controls a real Chromium browser via Playwright. Sees screenshots + accessibility tree. | Vision-language models, screenshot-based agents, real-world testing |

### REST Mode

```python
env = thetabench.make("shopify-admin", task_id="prod-001", mode="rest")
obs, info = env.reset()
obs, reward, done, trunc, info = env.step({
    "action": "update_product",
    "productId": "1",
    "fields": {"price": "34.99"}
})
```

### Browser Mode

```python
pip install 'thetabench[browser]'
playwright install chromium

env = thetabench.make("shopify-admin", task_id="prod-001", mode="browser")
obs, info = env.reset()
# obs contains: screenshot (bytes), accessibility_tree, url, state
obs, reward, done, trunc, info = env.step({
    "type": "click",
    "selector": "#price-input"
})
```

## What Clients Bring vs What ThetaBench Provides

### Client provides:
- Their AI model / agent
- Glue code to connect agent decisions to ThetaBench actions
- Their own compute (GPU clusters for training)

### ThetaBench provides:
- Simulated websites (Shopify Admin, Linear, Jira, and more)
- 264 tasks across 3 sites and 10 difficulty stages
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
thetabench (Python SDK)
    |
    v
HTTP API (/api/sim/*, /api/rl/*)
    |
    v
@thetabench/core (TypeScript engine)
    |
    +-- Episode Manager (start, log, evaluate, finish)
    +-- Snapshot Engine (capture state, compute diffs)
    +-- Evaluator (6 check types, weighted scoring)
    +-- LLM Judge (retrieval + impossibility detection)
    +-- Config System (universal + site-specific)
    +-- Curriculum (10-stage progression)
    +-- Task Registry (264 tasks across 3 sites, filterable)
    |
    v
Site Plugin (e.g. Shopify Admin, Linear, Jira)
    |
    +-- Mock Data Store (products, orders, customers, discounts, settings)
    +-- 39 Polaris UI pages
    +-- CRUD API (/api/data/*)
    +-- Site-specific predicates
```

## Task Types

| Type | Count | How It Works |
|------|-------|-------------|
| **Action** | ~121 | Agent must modify state (create, update, delete entities). Scored by comparing before/after snapshots. |
| **Retrieval** | 40 | Agent must find and report information. Scored by LLM judge comparing response to ground truth. |
| **Impossible** | 13 | Task cannot be completed (e.g. refund an already-refunded order). Agent must recognize and explain why. |
| **Multi-domain** | 10 | Tasks spanning multiple entity types (e.g. create a product AND a discount for it). |

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
                           +--- jira (project management)
                           +--- gmail-sim (email)
ThetaBench Platform ---------+--- github-sim (code hosting)
                           +--- slack-sim (messaging)
                           +--- salesforce-sim (CRM)
                           +--- ... (100+ planned)

                   +--------------------------------------+
Client runs:       | thetabench eval --suite all-sites      |
                   |   --agent gpt4o_web_agent            |
                   |   --output results.json              |
                   +--------------------------------------+

Result: "GPT-4o scores 73% on ThetaBench (856/1000+ tasks across 10 sites)"
```

Each new site follows the same pattern:
1. Implement `SitePlugin` interface from `@thetabench/core`
2. Define task definitions with eval checks
3. Register tasks and predicates
4. The SDK, API, curriculum, and scoring all work automatically

## Roadmap

### Done

| Item | Details |
|------|---------|
| **Deterministic seeding** | `seed` param guarantees identical timestamps and state across runs. |
| **Batch evaluation CLI** | `thetabench eval --agent my_agent.py --output results.json` runs all tasks per site. |
| **Standardized results format** | JSON output with per-domain and per-stage breakdowns. |
| **Input validation** | All API routes validate JSON, enums, numeric types. Leaderboard validates submissions. |
| **RL episode isolation** | Per-episode state prevents concurrent agent interference. |
| **Evaluation with initial state** | Eval errors show before/after values for debugging. |
| **LLM judge improvements** | Multi-word impossibility phrases, tiered retrieval thresholds. |
| **SDK context manager** | `with ThetaBenchEnv(...) as env:` for automatic Playwright cleanup. |

### Remaining (before labs take it seriously)

| Item | Why | Status |
|------|-----|--------|
| **Baseline results** | "Here's how GPT-4o / Claude / Gemini score." Rule-based agent baseline done (14.7%). LLM baselines require API keys. | Rule-based done |
| **Published PyPI package** | `pip install thetabench` from PyPI, not `pip install ./sdk`. Requires PyPI credentials. | Not started |
| **5+ sites** | 1 site = demo, 5+ = benchmark. Labs need diversity to prove generalization. | 3 done (Shopify Admin, Linear, Jira) |
| **Paper on arXiv** | Draft exists, needs baseline numbers to publish. | Draft done |
| **Leaderboard signing** | HMAC-signed submissions to prevent spoofing. Requires secret key setup. | Not started |
| **Multi-agent support** | Concurrent episodes for parallel evaluation at scale. | Not started |
