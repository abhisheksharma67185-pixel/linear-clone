# ThetaBench

A scalable platform for training and evaluating autonomous web agents on 264 deterministic website simulation tasks across 3 sites.

## Repository Structure

```
thetabench/
├── packages/
│   └── thetabench-core/       # Shared simulation engine (site-agnostic)
├── sites/
│   ├── shopify-admin/       # Shopify Admin simulation (104 tasks)
│   ├── linear/              # Linear simulation (project management, 80 tasks)
│   └── jira/                # Jira simulation (project management, 80 tasks)
├── sdk/                     # Python SDK (pip install thetabench)
├── observability/           # Theta Observability — external SaaS for AI interaction traces
│   ├── api-go/              # Go ingest API (chi + GCS + BigQuery + Postgres)
│   ├── sdk-python/          # theta-observability (pip)
│   ├── sdk-node/            # @theta/observability (npm)
│   ├── dashboard/           # Next.js 16 dashboard (multi-tenant SaaS)
│   ├── schema/              # Trace JSON Schema, BQ table schemas, Postgres migrations
│   └── docker-compose.dev.yml
└── paper/                   # Research paper
```

## Quick Start

**Prerequisites:** Node.js >= 20, Python >= 3.10 (for SDK)

### Run the Shopify Admin simulation

```bash
# From repo root (uses npm workspaces)
npm install

# Start the dev server (http://localhost:3000)
cd sites/shopify-admin
npm run dev
```

### Install the Python SDK

```bash
cd sdk
pip install -e .

# For browser mode (Playwright)
pip install 'thetabench[browser]' && playwright install chromium
```

### Try it

```python
import thetabench

env = thetabench.make("shopify-admin", task_id="prod-001")
obs, info = env.reset()
print(f"Task: {info['task_goal']}")
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/rl` | Current observation |
| `POST /api/rl` | Execute action, get reward |
| `POST /api/sim/config` | Start episode with task |
| `POST /api/sim/finish` | End episode, get score |
| `GET /api/sim/tasks` | List all tasks |
| `GET /api/sim/tasks/curriculum` | 10-stage curriculum |

## Architecture

ThetaBench separates the **simulation engine** (site-agnostic) from **site implementations** (site-specific). Each site is a standalone Next.js app that plugs into the shared engine via the `SitePlugin` interface.

See [paper/thetabench-paper.md](paper/thetabench-paper.md) for the full research paper.

## Sites

| Site | Pages | Tasks | Status |
|------|-------|-------|--------|
| Shopify Admin | 39 | 104 | Complete |
| Linear | - | 80 | Complete |
| Jira | - | 80 | Complete |

## Observability

`observability/` hosts **Theta Observability**, an external SaaS product for visualizing multimodal AI interaction traces (text / image / audio / video / robotics sensor frames). Customers install an SDK in their agent code; traces land in GCS + BigQuery and appear in a polished web dashboard.

```bash
# Spin up the full local stack (postgres, fake-gcs, bq emulator, go api, dashboard)
cd observability && docker compose -f docker-compose.dev.yml up

# Python SDK
pip install -e observability/sdk-python

# Node SDK (installed via root workspace)
npm install
npm run dev:obs                       # dashboard at http://localhost:3100
```

See [observability/README.md](observability/README.md) for the full quickstart, SDK references, and self-host guide.

## License

MIT
