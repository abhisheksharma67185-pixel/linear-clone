# REST API Reference

All SimBench sites expose the same API structure. Replace `localhost:3000` with your server URL.

## Simulation Endpoints (`/api/sim/*`)

### Start Episode

```
POST /api/sim/config
```

**Request body:**
```json
{
  "task_id": "prod-001",
  "mode": "rest",
  "seed": 42,
  "config_overrides": {}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task_id` | string | Yes | Task identifier (e.g., `"prod-001"`, `"ord-005"`) |
| `mode` | string | No | `"rest"` (default) or `"browser"` |
| `seed` | number | No | Non-negative finite integer for deterministic episodes |
| `config_overrides` | object | No | Override universal/site config |

**Response (200):**
```json
{
  "episode_id": "ep_1713168000000_abc123",
  "task": {
    "id": "prod-001",
    "title": "Update product price",
    "goal": "Change the price of 'Classic Cotton T-Shirt' to $34.99",
    "type": "action",
    "difficulty": "easy",
    "max_steps": 10,
    "curriculum_stage": 2
  },
  "status": "active",
  "initial_snapshot": { "products": [...], "orders": [...], ... }
}
```

**Errors:**
- `400` - Missing `task_id`, invalid seed, or task not found
- `400` - Another episode is already active

---

### Finish Episode

```
POST /api/sim/finish
```

**Request body:**
```json
{
  "agent_response": "4 unfulfilled orders"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agent_response` | string | No | Agent's text answer (for retrieval/impossible tasks) |

**Response (200):**
```json
{
  "episode_id": "ep_...",
  "task_id": "prod-001",
  "status": "completed",
  "steps": 3,
  "score": 1.0,
  "total_reward": 9.97,
  "wall_time_seconds": 0.15,
  "eval": {
    "score": 1.0,
    "checks": [
      { "passed": true, "message": "PASS: Product price updated to 34.99", "weight": 1 }
    ],
    "passed": 1,
    "total": 1
  },
  "judge_result": null,
  "diff": {
    "added": [],
    "removed": [],
    "modified": [
      { "path": "products.1.price", "entity": "products", "id": "1", "field": "price", "before": "29.99", "after": "34.99" }
    ]
  },
  "action_log": [
    { "step": 1, "timestamp": "...", "action": "update_product", "payload": {...}, "reward": -0.01, "success": true }
  ]
}
```

**Errors:**
- `400` - No active episode

---

### Mid-Episode Evaluation

```
POST /api/sim/evaluate
```

No request body.

**Response (200):**
```json
{
  "score": 0.5,
  "checks": [
    { "passed": true, "message": "PASS: Product title updated", "weight": 1 },
    { "passed": false, "message": "FAIL: expected 34.99, got 29.99", "weight": 1 }
  ],
  "passed": 1,
  "total": 2
}
```

**Errors:**
- `400` - No active episode
- `500` - Evaluation error

---

### Get State

```
GET /api/sim/state?diff=true
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `diff` | string | `"false"` | If `"true"`, include state diff from initial snapshot |

**Response (200):**
```json
{
  "state": { "products": [...], "orders": [...] },
  "diff": { "added": [], "removed": [], "modified": [...] }
}
```

---

### Get Initial Snapshot

```
GET /api/sim/snapshot
```

Returns the deep-cloned state captured at episode start.

---

### Get Episode Status

```
GET /api/sim/episode
```

**Response (200):**
```json
{
  "active": true,
  "episode_id": "ep_...",
  "task_id": "prod-001",
  "task_title": "Update product price",
  "task_goal": "Change the price of...",
  "status": "active",
  "step_count": 2,
  "max_steps": 10,
  "elapsed_seconds": 1.5,
  "action_log_length": 2
}
```

---

### Log Action

```
POST /api/sim/episode/log
```

**Request body:**
```json
{
  "action": "update_product",
  "payload": { "productId": "1", "fields": { "price": "34.99" } },
  "reward": -0.01,
  "success": true
}
```

**Response (200):**
```json
{ "step_count": 3 }
```

---

## Task Endpoints

### List Tasks

```
GET /api/sim/tasks?domain=products&difficulty=easy&type=action&stage=2
```

All query params are optional filters.

| Param | Type | Description |
|-------|------|-------------|
| `domain` | string | Filter by domain (`products`, `orders`, etc.) |
| `difficulty` | string | `easy`, `medium`, `hard`, `expert` |
| `type` | string | `action`, `retrieval`, `action_retrieval`, `no_action` |
| `stage` | number | Curriculum stage (1-10) |
| `site` | string | Site ID |

**Response (200):**
```json
{
  "total": 104,
  "filtered": 25,
  "tasks": [
    {
      "id": "prod-001",
      "site": "shopify-admin",
      "domain": "products",
      "type": "action",
      "difficulty": "easy",
      "curriculum_stage": 2,
      "title": "Update product price",
      "goal": "Change the price of...",
      "max_steps": 10,
      "tags": ["form-fill"]
    }
  ]
}
```

---

### Get Task Detail

```
GET /api/sim/tasks/{id}
```

Returns the full `TaskDefinition` object including `evalChecks`, `rewardProfile`, `setup`, etc.

---

### Get Curriculum

```
GET /api/sim/tasks/curriculum
```

**Response (200):**
```json
{
  "total_stages": 10,
  "stages": [
    {
      "stage": 1,
      "title": "Navigation Basics",
      "description": "Navigate between pages and identify content",
      "domains": ["navigation"],
      "difficultyRange": ["easy", "easy"],
      "taskIds": ["nav-001", "nav-002", "nav-003", "nav-004", "nav-005"]
    },
    ...
  ]
}
```

---

## RL Endpoints (`/api/rl/*`)

### Observe

```
GET /api/rl
```

**Response (200):**
```json
{
  "currentPage": "/admin/products",
  "stepCount": 2,
  "lastAction": "navigate",
  "selectedIds": [],
  "availableActions": [
    "navigate", "search", "select",
    "create_product", "update_product", "delete_product",
    "fulfill_order", "capture_payment", "refund_order", "add_order_note",
    "create_customer", "update_customer",
    "create_discount", "update_discount", "delete_discount",
    "update_settings"
  ],
  "currentPageData": { ... },
  "episode": {
    "id": "ep_...",
    "taskId": "prod-001",
    "taskGoal": "Change the price of...",
    "status": "active",
    "stepsRemaining": 8
  },
  "summary": {
    "totalProducts": 12,
    "activeProducts": 10,
    "totalOrders": 10,
    "unfulfilledOrders": 4,
    "totalCustomers": 8,
    "totalDiscounts": 6,
    "activeDiscounts": 2
  },
  "data": {
    "products": [...],
    "orders": [...],
    "customers": [...],
    "discounts": [...]
  },
  "info": {
    "description": "SimBench RL endpoint",
    "version": "0.1.0",
    "episodeActive": true
  }
}
```

---

### Step

```
POST /api/rl
```

**Request body:**
```json
{
  "action": "update_product",
  "productId": "1",
  "fields": { "price": "34.99" }
}
```

**Response (200):**
```json
{
  "observation": { ... },
  "reward": -0.01,
  "done": false,
  "truncated": false,
  "info": { "action": "update_product", "valid": true }
}
```

### Available Actions by Site

**Shopify Admin:** `navigate`, `search`, `select`, `create_product`, `update_product`, `delete_product`, `fulfill_order`, `capture_payment`, `refund_order`, `add_order_note`, `create_customer`, `update_customer`, `create_discount`, `update_discount`, `delete_discount`, `update_settings`

**Linear:** `navigate`, `search`, `respond`, `create_issue`, `update_issue`, `delete_issue`, `transition_issue`, `move_issue_to_cycle`, `create_project`, `update_project`, `create_cycle`, `start_cycle`, `complete_cycle`, `create_label`, `update_label`, `create_team`, `update_team`, `create_view`

**Jira:** `navigate`, `search`, `respond`, `create_issue`, `update_issue`, `delete_issue`, `transition_issue`, `move_issue_to_sprint`, `create_project`, `update_project`, `create_sprint`, `start_sprint`, `complete_sprint`, `create_epic`, `update_epic`, `create_filter`

---

### Reset RL Session

```
POST /api/rl/reset
```

Resets the RL session state (page, selections) without ending the episode.

---

### Action Space

```
GET /api/rl/action-space
```

Returns the list of available actions and their parameter schemas.

---

## Site Data Endpoints (`/api/data/*`)

Each site exposes CRUD routes for its domain entities. These are used by the site's own UI and can also be called directly.

### Shopify Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data/products` | List all products |
| POST | `/api/data/products` | Create product |
| GET | `/api/data/products/[id]` | Get product |
| POST | `/api/data/products/[id]` | Update product |
| GET | `/api/data/orders` | List all orders |
| GET | `/api/data/orders/[id]` | Get order |
| POST | `/api/data/orders/[id]/fulfill` | Fulfill order |
| POST | `/api/data/orders/[id]/capture` | Capture payment |
| POST | `/api/data/orders/[id]/refund` | Process refund |
| POST | `/api/data/orders/[id]/notes` | Add timeline note |
| GET | `/api/data/customers` | List customers |
| POST | `/api/data/customers` | Create customer |
| GET | `/api/data/customers/[id]` | Get customer |
| POST | `/api/data/customers/[id]` | Update customer |
| GET | `/api/data/discounts` | List discounts |
| POST | `/api/data/discounts` | Create discount |
| GET | `/api/data/discounts/[id]` | Get discount |
| POST | `/api/data/discounts/[id]` | Update discount |
| GET | `/api/data/settings` | Get store settings |
| POST | `/api/data/settings` | Update settings |

### Linear

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/data/issues` | List/create issues |
| GET/POST | `/api/data/issues/[id]` | Get/update issue |
| GET/POST | `/api/data/projects` | List/create projects |
| GET/POST | `/api/data/cycles` | List/create cycles |
| GET/POST | `/api/data/labels` | List/create labels |
| GET | `/api/data/teams` | List teams |
| GET | `/api/data/members` | List members |

### Jira

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/data/issues` | List/create issues (supports `?populate=assignee,sprint,epic`) |
| GET/POST | `/api/data/issues/[id]` | Get/update issue |
| GET/POST | `/api/data/projects` | List/create projects |
| GET/POST | `/api/data/sprints` | List/create sprints |
| GET/POST | `/api/data/epics` | List/create epics |
| GET | `/api/data/boards` | List boards |
| GET | `/api/data/users` | List users |
| GET/POST | `/api/data/filters` | List/create filters |

---

## Utility Endpoints

### Health Check

```
GET /api/health
```

**Response (200):**
```json
{
  "status": "ok",
  "site": "shopify-admin",
  "version": "0.1.0",
  "tasks": 104,
  "domains": 10,
  "curriculum_stages": 10,
  "domain_breakdown": {
    "products": 25,
    "orders": 14,
    ...
  }
}
```

### Leaderboard

```
GET  /api/sim/leaderboard          # List entries
POST /api/sim/leaderboard          # Submit entry
```
