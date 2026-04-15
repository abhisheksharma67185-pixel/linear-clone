# Site Plugin Guide

This guide explains how to add a new simulated website to SimBench. Each site is a standalone Next.js application that plugs into the shared `@simbench/core` engine.

## What You Build

1. **An in-memory store** with CRUD operations and deterministic reset
2. **A site adapter** that connects your store to the core engine
3. **Task definitions** with evaluation checks
4. **Site-specific predicates** for domain-specific evaluation
5. **UI pages** (React + any component library)
6. **API routes** (`/api/sim/*`, `/api/rl/*`, `/api/data/*`)

The core engine handles episode management, snapshots, evaluation, curriculum, rewards, and the SDK -- you inherit all of that automatically.

## Step 1: Scaffold the Site

```bash
# Create from an existing site as template
cp -r sites/linear sites/my-site
cd sites/my-site
```

Update `package.json`:
```json
{
  "name": "my-site-sim",
  "version": "0.1.0",
  "dependencies": {
    "@simbench/core": "workspace:*",
    "next": "16.1.7",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  }
}
```

Add to the root `package.json` workspaces:
```json
"workspaces": ["packages/*", "sites/shopify-admin", "sites/linear", "sites/jira", "sites/my-site"]
```

## Step 2: Design Your Data Model

Define the entities your simulated website manages:

```typescript
// app/lib/types.ts

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: "agent" | "admin";
}
```

## Step 3: Build the Store

Create an in-memory store with CRUD functions and deterministic reset:

```typescript
// app/lib/store.ts

import type { Ticket, Agent } from "./types";

// Initial data (restored on every reset)
const INITIAL_TICKETS: Ticket[] = [
  { id: "1", title: "Login page broken", status: "open", priority: "critical", ... },
  { id: "2", title: "Update FAQ page", status: "in_progress", priority: "low", ... },
  // ... more realistic mock data
];

const INITIAL_AGENTS: Agent[] = [
  { id: "1", name: "Alice Chen", email: "alice@example.com", role: "admin" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "agent" },
];

// Mutable state
let _tickets: Ticket[] = [];
let _agents: Agent[] = [];
let _nextTicketId = 100;
let _dateOverride: string | null = null;
let _dateCounter = 0;

// Deterministic timestamp
function now(): string {
  if (_dateOverride) {
    _dateCounter++;
    return new Date(new Date(_dateOverride).getTime() + _dateCounter * 1000).toISOString();
  }
  return new Date().toISOString();
}

// Deep clone utility
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Reset to initial state (called at episode start)
export function reset(seed?: number): void {
  _tickets = deepClone(INITIAL_TICKETS);
  _agents = deepClone(INITIAL_AGENTS);
  _nextTicketId = 100;
  _dateCounter = 0;
  _dateOverride = seed !== undefined ? "2025-01-15T10:00:00.000Z" : null;
}

// CRUD operations
export function getTickets(): Ticket[] { return _tickets; }
export function getTicketById(id: string): Ticket | undefined { return _tickets.find(t => t.id === id); }

export function createTicket(data: Partial<Ticket>): { success: true; data: Ticket } | { success: false; error: string } {
  if (!data.title) return { success: false, error: "Title is required" };
  const ticket: Ticket = {
    id: String(_nextTicketId++),
    title: data.title,
    description: data.description ?? "",
    status: data.status ?? "open",
    priority: data.priority ?? "medium",
    assigneeId: data.assigneeId ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  _tickets.push(ticket);
  return { success: true, data: ticket };
}

export function updateTicket(id: string, fields: Partial<Ticket>): { success: true; data: Ticket } | { success: false; error: string } {
  const ticket = _tickets.find(t => t.id === id);
  if (!ticket) return { success: false, error: `Ticket ${id} not found` };
  Object.assign(ticket, fields, { updatedAt: now() });
  return { success: true, data: ticket };
}

// ... more CRUD functions

// Initialize on import
reset();
```

**Key patterns:**
- Deep clone initial data on reset (don't mutate the constant)
- Use deterministic timestamps when seed is provided
- Return `{ success, data/error }` from all mutations
- Initialize state on module load

## Step 4: Create the Site Adapter

Connect your store to the core engine:

```typescript
// app/lib/sim-adapter.ts

import {
  registerSiteAdapter,
  registerTasks,
  registerPredicate,
} from "@simbench/core";
import * as store from "./store";
import { ticketTasks } from "./tasks/tickets";
import { navigationTasks } from "./tasks/navigation";

// Register the site adapter
registerSiteAdapter({
  getState: () => ({
    tickets: store.getTickets(),
    agents: store.getAgents(),
  }),
  reset: (seed) => store.reset(seed),
  executeMutation: (name, args) => {
    const mutations: Record<string, (...a: any[]) => any> = {
      createTicket: store.createTicket,
      updateTicket: store.updateTicket,
      deleteTicket: store.deleteTicket,
      transitionTicket: store.transitionTicket,
    };
    const fn = mutations[name];
    if (!fn) throw new Error(`Unknown mutation: ${name}`);
    fn(...args);
  },
  collections: ["tickets", "agents"],   // Arrays with id fields
  singletons: [],                        // Flat objects (e.g., "settings")
});

// Register tasks
registerTasks([...ticketTasks, ...navigationTasks]);

// Register site-specific predicates
registerPredicate("ticket_has_status", (snapshot, check) => {
  const tickets = snapshot.tickets as { id: string; status: string }[];
  const expected = check.expected as { ticketId: string; status: string };
  const ticket = tickets.find(t => t.id === expected.ticketId);
  return ticket?.status === expected.status;
});

registerPredicate("all_tickets_resolved", (snapshot) => {
  const tickets = snapshot.tickets as { status: string }[];
  return tickets.every(t => t.status === "resolved" || t.status === "closed");
});
```

**Important:** The `collections` array tells the snapshot engine which state keys are arrays with `id` fields (diffed by entity). The `singletons` array is for flat objects (diffed by key).

## Step 5: Write Task Definitions

```typescript
// app/lib/tasks/tickets.ts

import type { TaskDefinition } from "@simbench/core";

export const ticketTasks: TaskDefinition[] = [
  {
    id: "ticket-001",
    site: "support-desk",
    domain: "issues",
    type: "action",
    difficulty: "easy",
    curriculumStage: 2,
    title: "Update ticket priority",
    goal: "Change the priority of 'Login page broken' to 'critical'",
    evalChecks: [
      {
        type: "state_diff",
        entity: "tickets",
        id: "1",
        field: "priority",
        expected: "critical",
        weight: 1,
        description: "Ticket priority set to critical",
      },
    ],
    maxSteps: 10,
    rewardProfile: { completion: 5, partialPerCheck: true, stepPenalty: -0.01, invalidActionPenalty: -0.05 },
    tags: ["single-field"],
  },
  // ... more tasks
];
```

## Step 6: Create API Routes

### Simulation routes (copy from existing site)

The `/api/sim/*` routes are nearly identical across sites. Copy from an existing site:

```
app/api/sim/config/route.ts      # Start episode
app/api/sim/finish/route.ts      # End episode
app/api/sim/evaluate/route.ts    # Mid-episode evaluation
app/api/sim/state/route.ts       # Get state/diff
app/api/sim/snapshot/route.ts    # Get initial snapshot
app/api/sim/episode/route.ts     # Episode status
app/api/sim/episode/log/route.ts # Log actions
app/api/sim/tasks/route.ts       # List tasks
app/api/sim/tasks/curriculum/route.ts # Curriculum
```

### RL route (site-specific)

The `/api/rl/route.ts` is site-specific because it defines:
- Available actions and their parameters
- How to build observations from your store
- How to execute actions and compute rewards

```typescript
// app/api/rl/route.ts (simplified)

export async function GET() {
  return NextResponse.json({
    currentPage: session.currentPage,
    availableActions: ["navigate", "create_ticket", "update_ticket", "transition_ticket"],
    data: { tickets: store.getTickets(), agents: store.getAgents() },
    summary: { totalTickets: store.getTickets().length, openTickets: ... },
    episode: activeEpisode ? { taskGoal: ..., stepsRemaining: ... } : null,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, ...params } = body;

  let reward = -0.01; // step penalty
  let success = false;

  switch (action) {
    case "update_ticket":
      const result = store.updateTicket(params.ticketId, params.fields);
      success = result.success;
      reward = success ? 0.5 : -0.1;
      break;
    // ... handle other actions
  }

  // Log to episode
  if (hasActiveEpisode()) {
    logAction(action, params, reward, success);
  }

  return NextResponse.json({
    observation: buildObservation(),
    reward,
    done: !hasActiveEpisode() || getActiveEpisode()?.status !== "active",
    truncated: getActiveEpisode()?.status === "timeout",
    info: { action, valid: success },
  });
}
```

### Data routes (CRUD)

```
app/api/data/tickets/route.ts         # GET (list), POST (create)
app/api/data/tickets/[id]/route.ts    # GET (detail), POST (update)
app/api/data/agents/route.ts          # GET (list)
```

## Step 7: Build UI Pages

Create React pages that display and allow interaction with your mock data. This is important for browser-mode agents that navigate visually.

Use any component library you like -- the core engine doesn't care about the UI.

## Step 8: Import the Adapter

Make sure the sim-adapter is imported at the server level so it runs on startup:

```typescript
// app/layout.tsx or a server-side import
import "./lib/sim-adapter";
```

## Step 9: Test

```bash
# Build core
cd packages/simbench-core && npm run build && cd ../..

# Start your site
cd sites/my-site && npm run dev

# Test from Python
python -c "
import simbench
env = simbench.make('my-site', base_url='http://localhost:3000', task_id='ticket-001')
obs, info = env.reset()
print(f'Goal: {info[\"task_goal\"]}')
result = env.finish()
print(f'Score: {result[\"score\"]}')
"
```

## Checklist

- [ ] Store with CRUD functions and deterministic `reset(seed)`
- [ ] Site adapter registered with correct collections/singletons
- [ ] Tasks registered with proper eval checks
- [ ] Site-specific predicates registered
- [ ] `/api/sim/*` routes working (episode lifecycle)
- [ ] `/api/rl` route with actions, observations, rewards
- [ ] `/api/data/*` routes for UI data access
- [ ] `/api/health` route returning site info
- [ ] UI pages rendering mock data
- [ ] Tasks pass when correct actions are taken
- [ ] Tasks fail when incorrect actions are taken
- [ ] Deterministic: same seed produces same results
