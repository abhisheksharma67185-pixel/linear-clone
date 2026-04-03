# SimBench

A scalable platform for training and evaluating autonomous web agents on 100+ deterministic website simulations.

## Repository Structure

```
simbench/
├── packages/
│   └── simbench-core/       # Shared simulation engine (site-agnostic)
├── sites/
│   ├── shopify-admin/       # Shopify Admin simulation (111 tasks)
│   └── linear/              # Linear simulation (in progress)
├── sdk/                     # Python SDK (pip install simbench)
└── paper/                   # Research paper
```

## Quick Start

### Run the Shopify Admin simulation

```bash
cd sites/shopify-admin
npm install
npm run dev
```

### Use the Python SDK

```bash
pip install ./sdk

python -c "
import simbench
env = simbench.make('shopify-admin', task_id='prod-001')
obs, info = env.reset()
print(f'Task: {info[\"task_goal\"]}')
"
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
| Shopify Admin | 39 | 111 | Complete |
| Linear | - | - | In progress |

## License

MIT
