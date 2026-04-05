# SimBench

A scalable platform for training and evaluating autonomous web agents on 264 deterministic website simulation tasks across 3 sites.

## Repository Structure

```
simbench/
├── packages/
│   └── simbench-core/       # Shared simulation engine (site-agnostic)
├── sites/
│   ├── shopify-admin/       # Shopify Admin simulation (104 tasks)
│   ├── linear/              # Linear simulation (project management, 80 tasks)
│   └── jira/                # Jira simulation (project management, 80 tasks)
├── sdk/                     # Python SDK (pip install simbench)
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
pip install 'simbench[browser]' && playwright install chromium
```

### Try it

```python
import simbench

env = simbench.make("shopify-admin", task_id="prod-001")
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

SimBench separates the **simulation engine** (site-agnostic) from **site implementations** (site-specific). Each site is a standalone Next.js app that plugs into the shared engine via the `SitePlugin` interface.

See [paper/simbench-paper.md](paper/simbench-paper.md) for the full research paper.

## Sites

| Site | Pages | Tasks | Status |
|------|-------|-------|--------|
| Shopify Admin | 39 | 104 | Complete |
| Linear | - | 80 | Complete |
| Jira | - | 80 | Complete |

## License

MIT
