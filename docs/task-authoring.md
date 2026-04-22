# Task Authoring Guide

This guide explains how to write task definitions for ThetaBench. Tasks are TypeScript objects that live in `sites/<site>/app/lib/tasks/` organized by domain.

## Task Definition Schema

```typescript
const task: TaskDefinition = {
  // Identity
  id: "prod-001",                    // Unique across all sites
  site: "shopify-admin",             // Which site this task belongs to
  domain: "products",                // Task domain (used for filtering/reporting)
  type: "action",                    // "action" | "retrieval" | "action_retrieval" | "no_action"
  difficulty: "easy",                // "easy" | "medium" | "hard" | "expert"
  curriculumStage: 2,                // 1-10 (which curriculum stage)

  // Description
  title: "Update product price",
  goal: "Change the price of 'Classic Cotton T-Shirt' to $34.99",
  hint: "Navigate to Products, find the T-Shirt, update the price field",

  // Prerequisites (optional)
  requires: [],                      // Task IDs that should be mastered first

  // Pre-episode setup (optional)
  setup: [],                         // Mutations to run before the episode starts
  configOverrides: {},               // Config overrides for this task

  // Evaluation
  evalChecks: [
    {
      type: "state_diff",
      entity: "products",
      id: "1",
      field: "price",
      expected: "34.99",
      weight: 1,
      description: "Product price updated to $34.99",
    },
  ],

  // For retrieval tasks only
  retrievalRubric: undefined,
  impossibilityReason: undefined,

  // Limits
  maxSteps: 10,
  timeLimitSeconds: undefined,

  // Reward shaping
  rewardProfile: {
    completion: 10,
    partialPerCheck: true,
    stepPenalty: -0.01,
    invalidActionPenalty: -0.1,
  },

  // Metadata
  tags: ["form-fill", "single-field"],
};
```

## Task Types

### Action Tasks (`type: "action"`)

The agent must modify the site's state. Evaluated by comparing before/after snapshots using `evalChecks`.

```typescript
{
  id: "prod-005",
  type: "action",
  goal: "Create a new product named 'Bamboo Water Bottle' priced at $24.99",
  evalChecks: [
    {
      type: "state_exists",
      entity: "products",
      field: "title",
      expected: "Bamboo Water Bottle",
      weight: 1,
      description: "Product with title 'Bamboo Water Bottle' exists",
    },
    {
      type: "state_predicate",
      predicate: "product_has_fields",
      expected: { title: "Bamboo Water Bottle", price: "24.99" },
      weight: 1,
      description: "Product has correct price",
    },
  ],
}
```

### Retrieval Tasks (`type: "retrieval"`)

The agent must find information and report it. Evaluated by the LLM judge comparing the agent's response to a rubric.

```typescript
{
  id: "ret-003",
  type: "retrieval",
  goal: "How many unfulfilled orders are there?",
  evalChecks: [
    {
      type: "retrieval",
      weight: 1,
      description: "Agent reports the correct count",
    },
  ],
  retrievalRubric: {
    question: "How many unfulfilled orders are there?",
    groundTruth: "4",
    acceptableVariations: ["four", "4 orders", "there are 4", "4 unfulfilled"],
    rubric: "Agent must identify and count all orders with fulfillment status 'unfulfilled'",
  },
}
```

### Impossible Tasks (`type: "no_action"`)

The task cannot be completed. The agent must recognize this and explain why.

```typescript
{
  id: "imp-002",
  type: "no_action",
  goal: "Refund order #1003",
  impossibilityReason: "Order #1003 has already been fully refunded",
  evalChecks: [
    {
      type: "retrieval",
      weight: 1,
      description: "Agent recognizes the task is impossible",
    },
  ],
}
```

The agent's response is checked for impossibility indicator phrases (e.g., "already refunded", "not possible").

### Combined Tasks (`type: "action_retrieval"`)

Both state modification and information retrieval. Score = 50% eval checks + 50% judge.

```typescript
{
  id: "combo-001",
  type: "action_retrieval",
  goal: "Find the most expensive product and reduce its price by 10%. Report the new price.",
  evalChecks: [
    {
      type: "state_diff",
      entity: "products",
      id: "7",
      field: "price",
      expected: "179.99",
      weight: 1,
      description: "Product price reduced by 10%",
    },
  ],
  retrievalRubric: {
    question: "What is the new price?",
    groundTruth: "$179.99",
    acceptableVariations: ["179.99", "$179.99", "one hundred seventy-nine ninety-nine"],
    rubric: "Agent must report the new price after 10% reduction",
  },
}
```

## Setup Actions

Setup actions run mutations before the episode starts to create pre-conditions:

```typescript
{
  id: "ord-010",
  goal: "Fulfill the order for 'Jane Smith'",
  setup: [
    {
      mutation: "createOrder",
      args: [{
        customerId: "3",
        lineItems: [{ productId: "1", quantity: 2, price: "29.99" }],
        fulfillmentStatus: "unfulfilled",
        paymentStatus: "paid",
      }],
    },
  ],
  evalChecks: [
    {
      type: "state_predicate",
      predicate: "order_has_fulfillment_status",
      expected: { orderId: "newest", status: "fulfilled" },
      weight: 1,
      description: "Order is fulfilled",
    },
  ],
}
```

## Eval Check Reference

### `state_diff`

```typescript
{
  type: "state_diff",
  entity: "products",     // Collection or singleton name in the state
  id: "1",                // Entity ID (for collections only)
  field: "price",         // Dot-path to the field (e.g., "tags.0", "address.city")
  expected: "34.99",      // Expected value after the episode
  weight: 1,
  description: "...",
}
```

### `state_exists`

```typescript
{
  type: "state_exists",
  entity: "products",
  field: "title",         // Field to check on each entity
  expected: "New Product", // At least one entity must have this value
  weight: 1,
  description: "...",
}
```

### `state_absent`

```typescript
{
  type: "state_absent",
  entity: "products",
  id: "5",                // Entity with this ID must not exist
  weight: 1,
  description: "...",
}
```

### `state_count`

```typescript
{
  type: "state_count",
  entity: "products",
  expected: 13,           // Exact count expected
  weight: 1,
  description: "...",
}
```

### `state_predicate`

```typescript
{
  type: "state_predicate",
  predicate: "product_has_fields",  // Name of a registered predicate
  entity: "products",               // Passed to the predicate function
  expected: { title: "...", price: "..." },
  weight: 1,
  description: "...",
}
```

### `retrieval`

```typescript
{
  type: "retrieval",
  weight: 1,
  description: "...",
}
```

## Difficulty Guidelines

| Difficulty | Curriculum Stages | Steps Budget | Description |
|-----------|------------------|-------------|-------------|
| `easy` | 1-3 | 5-15 | Single action, one entity, one field |
| `medium` | 4-6 | 15-25 | Multi-field updates, order operations, search |
| `hard` | 7-8 | 15-30 | Conditional logic, impossible tasks, multi-step |
| `expert` | 9-10 | 30-60 | Cross-domain, multi-entity, ambiguous goals |

## Curriculum Stage Assignment

| Stage | What to Assign Here |
|-------|-------------------|
| 1 | Navigation-only tasks |
| 2 | Read one field, or update one field on an existing entity |
| 3 | Create a new entity |
| 4 | Order-specific operations (fulfill, capture, refund) |
| 5 | Update multiple fields in one operation |
| 6 | Search, filter, count -- information retrieval tasks |
| 7 | "Archive all draft products" -- requires conditional inspection |
| 8 | Impossible tasks, multi-step sequences |
| 9 | Tasks spanning 2+ entity types |
| 10 | Complex real-world scenarios with ambiguity |

## Reward Profile Guidelines

```typescript
// Easy tasks
rewardProfile: { completion: 5, partialPerCheck: true, stepPenalty: -0.01, invalidActionPenalty: -0.05 }

// Medium tasks
rewardProfile: { completion: 10, partialPerCheck: true, stepPenalty: -0.01, invalidActionPenalty: -0.1 }

// Hard/expert tasks
rewardProfile: { completion: 20, partialPerCheck: true, stepPenalty: -0.005, invalidActionPenalty: -0.1 }
```

Higher `completion` bonuses for harder tasks incentivize agents to attempt them. Lower `stepPenalty` for complex tasks gives agents more room to explore.

## File Organization

Tasks live in `sites/<site>/app/lib/tasks/`:

```
sites/shopify-admin/app/lib/tasks/
├── products.ts          # Product domain tasks
├── orders.ts            # Order domain tasks
├── customers.ts         # Customer domain tasks
├── discounts.ts         # Discount domain tasks
├── navigation.ts        # Navigation tasks
├── retrieval.ts         # Retrieval tasks
├── impossible.ts        # Impossible tasks
├── multi-domain.ts      # Cross-domain tasks
├── search.ts            # Search tasks
└── settings.ts          # Settings tasks
```

Each file exports an array of `TaskDefinition` objects. These are imported and registered in the site's `sim-adapter.ts`:

```typescript
import { registerTasks } from "@thetabench/core";
import { productTasks } from "./tasks/products";
import { orderTasks } from "./tasks/orders";
// ...

registerTasks([...productTasks, ...orderTasks, ...]);
```

## Checklist for New Tasks

1. Choose a unique `id` (convention: `domain-NNN`)
2. Set the correct `site`, `domain`, `type`, `difficulty`, `curriculumStage`
3. Write a clear, specific `goal` (this is what the agent sees)
4. Add `setup` mutations if the task requires specific pre-conditions
5. Write `evalChecks` that unambiguously verify success
6. For retrieval tasks, include a `retrievalRubric` with ground truth + variations
7. For impossible tasks, include `impossibilityReason`
8. Set `maxSteps` appropriate to the difficulty
9. Configure `rewardProfile` based on difficulty guidelines
10. Add relevant `tags` for analysis
11. Test the task manually: start an episode, perform the actions, verify scoring
