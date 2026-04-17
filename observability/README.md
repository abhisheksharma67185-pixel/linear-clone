# Theta Observability

Theta Observability is a multimodal tracing platform purpose-built for AI agents. It captures every step your agent takes -- LLM calls, tool use, retrieval, robotics sensor frames, human-in-the-loop interactions -- across text, images, audio, video, and sensor data. Traces are searchable, filterable, and evaluable from a single dashboard.

## Features

- **Structured Traces** -- hierarchical trace-and-step model with automatic timing, token counts, and cost tracking.
- **Multimodal** -- first-class support for images, audio, video, and robotics sensor frames (joint state, pose, IMU, LiDAR, depth, force/torque, gripper, camera, tactile).
- **Evaluations & Metrics** -- define pass/fail, score, or label metrics; record them against any trace programmatically or via the dashboard.
- **Incident Detection** -- automatic anomaly detection across your traces to surface regressions.
- **Semantic Search** -- full-text and vector search across trace content.
- **Trace Clustering** -- discover patterns across runs with automatic cluster analysis.
- **SDKs** -- official Python and Node.js/TypeScript SDKs with zero-config setup, background batching, and provider integrations for OpenAI and Anthropic.
- **Self-Hostable** -- the entire stack runs locally with Docker Compose or deploys to your own cloud.

## Quickstart

### 1. Install the SDK

```bash
# Python
pip install theta-observability

# Node.js / TypeScript
npm install @theta/observability
```

### 2. Add three lines of code

**Python:**

```python
from theta_observability import trace

with trace("my-agent") as t:
    with t.step(name="plan", type="llm", model="gpt-4o") as s:
        s.log_message(role="user", text="Hello")
        s.log_message(role="assistant", text="Hi there!")
        s.set_token_usage(input=10, output=5)
```

**Node.js:**

```typescript
import { trace } from "@theta/observability";

await trace("my-agent", async (t) => {
  await t.step({ name: "plan", type: "llm", model: "gpt-4o" }, async (s) => {
    s.logMessage({ role: "user", text: "Hello" });
    s.logMessage({ role: "assistant", text: "Hi there!" });
    s.setTokenUsage({ input: 10, output: 5 });
  });
});
```

### 3. See your traces

Open the dashboard at [https://app.theta-observability.com](https://app.theta-observability.com) or your self-hosted instance. Traces appear within seconds.

## Architecture

```
SDK (Python / Node) --> Go Ingest API --> GCS (trace JSON + media blobs)
                                      --> BigQuery (searchable index)
                                      --> Postgres (control plane: orgs, projects, keys, billing)
```

SDKs batch traces and submit them to the Go ingest API over HTTPS. The API validates payloads against the [trace schema](./schema/trace.schema.json), writes the full trace JSON to GCS, indexes metadata into BigQuery for fast querying, and manages organizational state in Postgres.

## Local Development

### Prerequisites

- Docker and Docker Compose
- GNU Make (optional, for convenience targets)

### Bring up the stack

```bash
docker compose -f docker-compose.dev.yml up
```

This starts:

| Service      | URL                                               | Purpose                           |
|--------------|----------------------------------------------------|-----------------------------------|
| Dashboard    | http://localhost:3100                               | Next.js app                       |
| API          | http://localhost:8080                               | Go ingest + control plane         |
| Postgres     | `postgres://theta:theta@localhost:5432/theta_obs`   | Control plane DB                  |
| fake-gcs     | http://localhost:4443                               | GCS emulator                      |
| BigQuery     | http://localhost:9050                               | BigQuery emulator                 |

### Seed demo data

```bash
make obs-seed
# Prints: Org, Project, API Key=tk_live_...
export THETA_API_KEY=tk_live_...
export THETA_PROJECT=proj_...
```

### Emit a test trace

```bash
curl -sS -X POST http://localhost:8080/v1/traces \
  -H "x-api-key: $THETA_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "schema_version": "1.0",
    "trace_id": "tr_demo0001",
    "project_id": "'$THETA_PROJECT'",
    "name": "hello-world",
    "status": "success",
    "started_at": "2026-04-15T12:00:00Z",
    "ended_at": "2026-04-15T12:00:01Z",
    "latency_ms": 1000,
    "steps": [{
      "step_id": "st_001",
      "type": "llm",
      "name": "greet",
      "messages": [
        {"role": "user", "content": [{"type": "text", "text": "Hello"}]},
        {"role": "assistant", "content": [{"type": "text", "text": "Hi!"}]}
      ]
    }]
  }'
```

Open http://localhost:3100 to see the trace in the dashboard.

### Make targets

| Command            | Description                                       |
|--------------------|---------------------------------------------------|
| `make obs-dev`     | Build and start the full stack                    |
| `make obs-down`    | Stop all services (volumes preserved)             |
| `make obs-migrate` | Re-run Postgres migrations                        |
| `make obs-seed`    | Create demo org, project, and API key             |
| `make obs-logs`    | Tail logs from all services                       |
| `make obs-ps`      | Show service status                               |
| `make obs-restart` | Restart API and dashboard services                |

## Documentation

| Document | Description |
|----------|-------------|
| [Python SDK Reference](./docs/python-sdk.md) | Complete guide to the `theta-observability` Python package |
| [Node.js SDK Reference](./docs/node-sdk.md) | Complete guide to the `@theta/observability` npm package |
| [REST API Reference](./docs/api-reference.md) | Every endpoint, request/response format, and cURL examples |
| [Trace Schema](./docs/trace-schema.md) | JSON schema documentation for the trace payload format |
| [Self-Hosting Guide](./docs/self-hosting.md) | Deploy Theta Observability on your own infrastructure |

## Storage Layout

- **Trace JSON** -- `gs://<bucket>/p/<project_id>/tr/<trace_id>/trace.json`
- **Media blobs** -- `gs://<bucket>/p/<project_id>/tr/<trace_id>/att/<attachment_id>.<ext>`
- **Search index** -- BigQuery tables `traces` and `steps`, partitioned by `ingest_date`
- **Control plane** -- Postgres (orgs, projects, API keys, members, billing)

## License

Proprietary. (c) Theta. All rights reserved.
