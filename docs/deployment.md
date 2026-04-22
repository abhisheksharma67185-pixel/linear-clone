# Deployment Guide

ThetaBench can be deployed to Vercel (quick evaluation) or run directly with Node.js (development).

## Local Development

### Prerequisites

- Node.js >= 20
- pnpm >= 10 (managed via Corepack)
- Python >= 3.10 (for the SDK)

### Setup

```bash
# Install all workspace dependencies
pnpm install

# Start a site in development mode
pnpm --filter shopify-admin-sim dev
# Server starts at http://localhost:3000
```

### Running Multiple Sites

Each site runs as an independent Next.js app on its own port:

```bash
# Terminal 1: Shopify Admin
pnpm --filter shopify-admin-sim dev
# http://localhost:3000

# Terminal 2: Linear
PORT=3001 pnpm --filter linear dev
# http://localhost:3001

# Terminal 3: Jira
PORT=3002 pnpm --filter jira dev
# http://localhost:3002
```

### Core Engine Development

The core engine (`@thetabench/core`) is consumed by sites via TypeScript path mapping —
edits to `packages/thetabench-core/src/` are picked up by site dev servers immediately,
no rebuild needed.

---

## Vercel

Each site can be deployed to Vercel as a standard Next.js application.

### Setup

1. Connect your repository to Vercel
2. Set the root directory to the site folder (e.g., `sites/shopify-admin`)
3. Vercel auto-detects Next.js and handles the build

### Build Settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | `sites/shopify-admin` |
| Build Command | `cd ../.. && pnpm --filter shopify-admin-sim build` |
| Output Directory | `.next` |
| Install Command | `cd ../.. && pnpm install --frozen-lockfile` |

### Agent Connection

```bash
# Point your agent at the Vercel URL
thetabench eval --agent my_agent.py --url https://your-deployment.vercel.app
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment (`production` for prod builds) |
| `HOSTNAME` | `0.0.0.0` | Bind address |

ThetaBench does not require any external services, databases, or API keys. Everything runs in-memory.

---

## Environment Configuration

ThetaBench supports per-episode environment configuration via the API:

### Universal Config

Applied via `POST /api/sim/config` with `config_overrides`:

```json
{
  "task_id": "prod-001",
  "config_overrides": {
    "latency": 100,
    "hideAriaLabels": true,
    "errorRate": 0.05,
    "dateOverride": "2025-06-15",
    "locale": "en-GB"
  }
}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `latency` | number | 0 | Simulated network delay (0-5000ms) |
| `hideAriaLabels` | boolean | false | Remove ARIA attributes from the UI |
| `errorRate` | number | 0 | Random action failure rate (0.0-1.0) |
| `dateOverride` | string | null | Lock the current date for determinism |
| `locale` | string | "en-US" | Language and region |

### Deterministic Seeding

Pass a `seed` when starting an episode for reproducible runs:

```python
env = thetabench.make("shopify-admin", task_id="prod-001", seed=42)
obs1, _ = env.reset()

# Later, same seed produces identical initial state
env2 = thetabench.make("shopify-admin", task_id="prod-001", seed=42)
obs2, _ = env2.reset()

assert obs1 == obs2  # Identical observations
```

The seed controls:
- Store state reset (identical initial data)
- Timestamp generation (deterministic `now()` calls)
- Any randomized behavior within the site

---

## Scaling Considerations

### Current Limitation: Single-Episode Concurrency

Each server instance handles one active episode at a time. The in-memory state is a module-level singleton -- concurrent episodes would interfere.

### Workarounds for Parallel Evaluation

**Option 1: Multiple server instances**
```bash
# Run N instances on different ports
for port in 3000 3001 3002 3003; do
  PORT=$port pnpm --filter shopify-admin-sim start &
done

# Distribute tasks across instances
```

**Option 2: Sequential batch evaluation**
```python
runner = thetabench.BatchRunner(base_url="http://localhost:3000")
results = runner.run_all()  # Runs tasks sequentially
```

### Future: Multi-Agent Support

Planned feature: per-session state isolation to support concurrent episodes on a single server instance. This would enable:
- Parallel training with multiple agents
- Higher throughput for batch evaluation
- Shared-nothing episode isolation

---

## Monitoring

### Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Returns site info, task count, and domain breakdown. Use for load balancer health checks.

### Logs

Next.js logs to stdout — pipe through your process manager (systemd, PM2, etc.) or
container runtime as needed.
