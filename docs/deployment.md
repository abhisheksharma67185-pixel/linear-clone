# Deployment Guide

SimBench can be deployed via Docker (recommended for training), Vercel (quick evaluation), or directly with Node.js (development).

## Local Development

### Prerequisites

- Node.js >= 20
- npm (comes with Node.js)
- Python >= 3.10 (for the SDK)

### Setup

```bash
# Install all workspace dependencies
npm install

# Build the shared core engine
cd packages/simbench-core
npm run build
cd ../..

# Start a site in development mode
cd sites/shopify-admin
npm run dev
# Server starts at http://localhost:3000
```

### Running Multiple Sites

Each site runs as an independent Next.js app on its own port:

```bash
# Terminal 1: Shopify Admin
cd sites/shopify-admin && npm run dev
# http://localhost:3000

# Terminal 2: Linear
cd sites/linear && PORT=3001 npm run dev
# http://localhost:3001

# Terminal 3: Jira
cd sites/jira && PORT=3002 npm run dev
# http://localhost:3002
```

### Core Engine Development

For live-reloading when editing the core engine:

```bash
# Terminal: watch mode
cd packages/simbench-core
npm run dev    # runs: vp pack --watch
```

---

## Docker

### Build

```bash
docker build -t simbench .
```

The Dockerfile uses a multi-stage build:

1. **deps** - Installs npm dependencies (`npm ci`)
2. **builder** - Builds `@simbench/core` and the Next.js site (standalone output)
3. **runner** - Minimal production image (Node 20 Alpine)

### Run

```bash
# Basic
docker run -p 3000:3000 simbench

# With custom port
docker run -p 8080:3000 simbench

# Detached
docker run -d --name simbench -p 3000:3000 simbench
```

### Health Check

The container includes a built-in health check:

```
GET http://localhost:3000/api/health
Interval: 30s
Timeout: 10s
Retries: 3
```

### Production Details

- **Base image**: `node:20-alpine`
- **User**: `nextjs` (UID 1001) -- non-root
- **Port**: 3000
- **Output**: Next.js standalone mode (minimal node_modules)
- **CMD**: `node sites/shopify-admin/server.js`

### Building for a Different Site

The default Dockerfile builds the Shopify Admin site. To build a different site, modify the builder stage or create site-specific Dockerfiles:

```dockerfile
# In the builder stage, replace:
RUN cd sites/shopify-admin && npx next build
# With:
RUN cd sites/linear && npx next build

# In the runner stage, replace the CMD:
CMD ["node", "sites/linear/server.js"]
```

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
| Build Command | `cd ../.. && npm run build --workspace=packages/simbench-core && cd sites/shopify-admin && next build` |
| Output Directory | `.next` |
| Install Command | `cd ../.. && npm install` |

### Agent Connection

```bash
# Point your agent at the Vercel URL
simbench eval --agent my_agent.py --url https://your-deployment.vercel.app
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment (`production` in Docker) |
| `HOSTNAME` | `0.0.0.0` | Bind address (set in Docker) |

SimBench does not require any external services, databases, or API keys. Everything runs in-memory.

---

## Environment Configuration

SimBench supports per-episode environment configuration via the API:

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
env = simbench.make("shopify-admin", task_id="prod-001", seed=42)
obs1, _ = env.reset()

# Later, same seed produces identical initial state
env2 = simbench.make("shopify-admin", task_id="prod-001", seed=42)
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
  docker run -d -p $port:3000 simbench
done

# Distribute tasks across instances
```

**Option 2: Sequential batch evaluation**
```python
runner = simbench.BatchRunner(base_url="http://localhost:3000")
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

### Docker Health Check

The container's built-in health check pings `/api/health` every 30 seconds:

```bash
docker inspect --format='{{.State.Health.Status}}' simbench
# "healthy" or "unhealthy"
```

### Logs

```bash
# Docker
docker logs simbench

# Development
# Next.js logs to stdout
```
