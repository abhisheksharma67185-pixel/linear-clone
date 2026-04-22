# Evaluation & Scoring

ThetaBench provides deterministic, ground-truth evaluation for all tasks. This document explains how tasks are scored, the different check types, the LLM judge, and the reward system.

## Evaluation Overview

When an episode finishes, ThetaBench:

1. **Captures** a final snapshot of the site's state
2. **Diffs** it against the initial snapshot (field-level)
3. **Runs** all `evalChecks` from the task definition
4. **Optionally runs** the LLM judge (for retrieval/impossible tasks)
5. **Computes** a final score (0.0 - 1.0)

## Check Types

Each task has one or more `evalChecks`. There are 6 types:

### `state_diff` -- Field Value Changed

Verifies that a specific field on an entity changed to the expected value.

```json
{
  "type": "state_diff",
  "entity": "products",
  "id": "1",
  "field": "price",
  "expected": "34.99",
  "weight": 1,
  "description": "Product price updated to $34.99"
}
```

How it works:
1. Finds the entity with matching `id` in the final snapshot's collection
2. Reads the `field` value using dot-path notation
3. Compares with `expected` using deep equality (order-independent for objects)
4. On failure, includes the initial value in the error message for debugging

### `state_exists` -- Entity With Matching Field Exists

Verifies that at least one entity in a collection has a field matching the expected value.

```json
{
  "type": "state_exists",
  "entity": "products",
  "field": "title",
  "expected": "Bamboo Water Bottle",
  "weight": 1,
  "description": "A product named 'Bamboo Water Bottle' exists"
}
```

### `state_absent` -- Entity Was Removed

Verifies that an entity with a given `id` no longer exists in the collection.

```json
{
  "type": "state_absent",
  "entity": "products",
  "id": "5",
  "weight": 1,
  "description": "Product #5 has been deleted"
}
```

### `state_count` -- Collection Cardinality

Verifies that a collection has exactly N items.

```json
{
  "type": "state_count",
  "entity": "products",
  "expected": 13,
  "weight": 1,
  "description": "There are now 13 products"
}
```

### `state_predicate` -- Custom Function

Runs a site-registered predicate function against the final snapshot.

```json
{
  "type": "state_predicate",
  "predicate": "all_orders_fulfilled",
  "weight": 1,
  "description": "All orders are fulfilled"
}
```

Predicates are registered per-site:
- **Shopify**: `product_has_fields`, `order_has_fulfillment_status`, `customer_has_tag`, `discount_exists_with_code`, etc.
- **Linear**: `issue_has_status`, `issue_in_cycle`, `cycle_has_state`, `all_issues_in_status`, etc.
- **Jira**: `issue_has_fields`, `issue_in_sprint`, `sprint_has_state`, `issue_has_story_points`, etc.

### `retrieval` -- LLM Judge

Placeholder check -- actual evaluation is done separately by the LLM judge. Always returns `passed: false` during eval-check evaluation; the score is overridden by the judge result in `finishEpisode()`.

---

## Scoring Formula

### Eval Check Score

```
eval_score = sum(weight of passed checks) / sum(weight of all checks)
```

Each check has a `weight` field (default: 1). This enables partial credit -- an agent that gets 2 out of 3 checks right scores 0.67, not 0.0.

### Final Score by Task Type

| Task Type | Formula |
|-----------|---------|
| `action` | `eval_score` (from eval checks only) |
| `retrieval` | `1.0` if judge passes, `0.0` if not |
| `no_action` (impossible) | `1.0` if judge passes, `0.0` if not |
| `action_retrieval` | `eval_score * 0.5 + judge_score * 0.5` |

---

## LLM Judge

The "LLM judge" is actually a deterministic text-matching system (no actual LLM API call). This ensures reproducible evaluation without API costs.

### Retrieval Evaluation

For retrieval tasks, the agent must report information. Evaluation matches the agent's response against a rubric:

```json
{
  "question": "How many unfulfilled orders are there?",
  "groundTruth": "4",
  "acceptableVariations": ["four", "4 orders", "there are 4"],
  "rubric": "Agent must report the correct count of unfulfilled orders"
}
```

**Matching pipeline** (first match wins):

1. **Exact match** -- Normalized response equals normalized ground truth
   - Normalization: trim, lowercase, collapse whitespace
   - `"  4  "` matches `"4"`

2. **Variation match** -- Response exactly matches any acceptable variation

3. **Semantic containment** -- Ground truth appears within the response
   - With length-ratio thresholds:
     - Short answers (<10 chars): ratio > 0.05 (very lenient)
     - Longer answers: ratio > 0.10
   - `"There are 4 unfulfilled orders in the system"` matches ground truth `"4"`

4. **Variation containment** -- Any acceptable variation appears within the response

### Impossible Task Evaluation

For impossible tasks, the agent must recognize the task cannot be done. The judge scans for 40+ multi-word indicator phrases:

**Impossibility indicators** (subset):
- "not possible", "cannot be done", "cannot be completed"
- "already fulfilled", "already refunded", "already captured"
- "does not exist", "not found", "no such product"
- "no action needed", "task is impossible"
- "has expired", "payment pending"

All phrases are 2+ words to avoid false positives. Matching is case-insensitive.

---

## Reward System

ThetaBench provides dense, per-step rewards (unlike binary-reward benchmarks).

### Reward Components

| Component | Value | When |
|-----------|-------|------|
| Step penalty | `rewardProfile.stepPenalty` (default: -0.01) | Every valid action |
| Invalid action penalty | `rewardProfile.invalidActionPenalty` (default: -0.1) | Invalid/failed actions |
| Base action reward | -0.5 to 1.0 | Per action type, computed in RL route |
| Completion bonus | `rewardProfile.completion × eval_score` | At episode end |
| Judge bonus | `rewardProfile.completion × 0.5` | If judge passes |

### Total Reward Formula

```
total_reward = sum(step_rewards) + (eval_score × completion_bonus) + (judge_bonus if applicable)
```

### Reward Profiles

Each task defines its own reward profile:

```json
{
  "completion": 10.0,
  "partialPerCheck": true,
  "stepPenalty": -0.01,
  "invalidActionPenalty": -0.1
}
```

- `completion`: How much reward for finishing successfully
- `partialPerCheck`: Whether partial credit is awarded
- `stepPenalty`: Small negative per step (encourages efficiency)
- `invalidActionPenalty`: Larger negative for invalid actions

---

## Metrics

ThetaBench reports multiple metrics per evaluation:

| Metric | Description |
|--------|-------------|
| **Task Success Rate (TSR)** | Percentage of tasks with score = 1.0 |
| **Partial Score** | Average weighted score across all eval checks |
| **Step Efficiency** | Average steps used / max steps allowed |
| **Curriculum Progress** | Highest stage achieved with mastery (80%) |
| **Error Recognition Rate** | Accuracy on impossible tasks |
| **Per-Domain Score** | Breakdown by task domain |
| **Per-Stage Score** | Breakdown by curriculum stage |

### Example Evaluation Output

```json
{
  "summary": {
    "total_evaluated": 104,
    "passed": 74,
    "score": 0.712,
    "avg_steps": 4.2
  },
  "domains": {
    "products":   { "score": 0.82, "tasks": 25, "passed": 20 },
    "orders":     { "score": 0.55, "tasks": 14, "passed": 8 },
    "customers":  { "score": 0.64, "tasks": 10, "passed": 6 },
    "discounts":  { "score": 0.58, "tasks": 10, "passed": 5 },
    "retrieval":  { "score": 0.93, "tasks": 15, "passed": 14 },
    "impossible": { "score": 0.38, "tasks": 8, "passed": 3 }
  },
  "curriculum": [
    { "stage": 1,  "score": 0.95 },
    { "stage": 5,  "score": 0.70 },
    { "stage": 10, "score": 0.20 }
  ]
}
```

This tells you exactly where the agent is weak -- then you can focus training on order workflows, impossible task recognition, or multi-step planning.
