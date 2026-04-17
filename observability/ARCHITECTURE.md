# Theta Observability — System Architecture

## Overview

Theta Observability is a full-stack AI agent observability platform. Customers install a Python or Node SDK in their agent code; traces flow through a Go ingest API into GCS + BigQuery; a Next.js dashboard visualizes everything with real-time filters, semantic search, incident detection, and cluster discovery.

```
┌─────────────────┐     ┌─────────────────┐
│  Python Agent    │     │  Node.js Agent   │
│  theta-obs SDK   │     │  @theta/obs SDK  │
└────────┬────────┘     └────────┬────────┘
         │  POST /v1/traces       │
         └──────────┬─────────────┘
                    ▼
         ┌─────────────────────┐
         │   Go Ingest API     │
         │   (chi + slog)      │
         │                     │
         │  ┌───────────────┐  │
         │  │ Ingest Pipeline│  │
         │  │ validate →     │  │
         │  │ GCS put →      │  │
         │  │ BQ append →    │  │
         │  │ FTS index →    │  │
         │  │ SSE publish    │  │
         │  └───────────────┘  │
         └──┬──────┬──────┬────┘
            │      │      │
     ┌──────┘      │      └──────┐
     ▼             ▼             ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│   GCS   │  │ BigQuery  │  │ Postgres │
│ (blobs) │  │ (index)   │  │ (control │
│ trace   │  │ traces    │  │  plane)  │
│ JSON +  │  │ steps     │  │ orgs     │
│ media   │  │ metric_   │  │ projects │
│         │  │ events    │  │ api_keys │
│         │  │           │  │ metrics  │
│         │  │           │  │ incidents│
│         │  │           │  │ clusters │
│         │  │           │  │ annotate │
│         │  │           │  │ saved_   │
│         │  │           │  │ filters  │
│         │  │           │  │ pgvector │
└─────────┘  └──────────┘  └──────────┘
                    ▲
                    │ JWT / API key
         ┌─────────────────────┐
         │  Next.js Dashboard  │
         │  (App Router, RSC)  │
         │  shadcn + Tailwind  │
         │  NextAuth v5        │
         └─────────────────────┘
```

---

## Components

### 1. Go Ingest API (`observability/api-go/`)

**Stack:** Go 1.23+, chi router, slog structured logging, pgx for Postgres, GCP SDKs for GCS + BigQuery.

**Architecture:**
```
cmd/server/main.go          ← entry point, wires deps + routes
internal/
  config/config.go          ← env-based config (PORT, DB_URL, GCS_*, BQ_*, JWT_SECRET, etc.)
  auth/
    apikey.go               ← extract + validate API keys (any prefix, min 16 chars)
    jwt.go                  ← HS256 JWT mint + parse (NextAuth-compatible)
    middleware.go            ← APIKeyMiddleware, JWTMiddleware, EitherAuthMiddleware
    password.go             ← argon2id hash + verify
  ingest/pipeline.go        ← core pipeline: validate → GCS put → BQ append → FTS index → SSE publish
  gcs/client.go             ← Put, Get, SignedPutURL, media serve
  bq/
    writer.go               ← batched BQ inserts (100 rows or 500ms flush)
    query.go                ← ListTraces (parameterized), GetTrace, with cursor pagination
  handlers/
    traces.go               ← POST /v1/traces, GET /v1/traces, GET /v1/traces/:id, SSE tail
    steps.go                ← POST /v1/traces/:id/steps (NDJSON)
    media.go                ← POST /v1/media/upload (proxy), /signed-url, GET /v1/media/serve
    metrics.go              ← CRUD metrics + record events
    search.go               ← POST /v1/search (PostgreSQL FTS)
    incidents.go             ← CRUD incidents + trigger detection
    clusters.go              ← CRUD clusters + trigger discovery
    annotations.go           ← CRUD annotations + labels
    saved_filters.go         ← CRUD saved filter presets
    admin.go                 ← PATCH /v1/admin/traces/bulk (BQ UPDATE + GCS rewrite)
    auth.go                  ← POST /v1/signup, orgs CRUD
    projects.go, keys.go, members.go, billing.go, webhooks.go
  embeddings/worker.go      ← extracts text from traces, stores in Postgres for FTS
  incidents/detector.go     ← background: groups error traces, calls Claude for root cause
  clusters/
    discoverer.go            ← fetches embeddings, runs k-means, labels via Claude
    kmeans.go                ← pure-Go k-means with cosine distance
  store/                     ← Postgres CRUD (pgx, hand-written SQL)
  sse/hub.go                 ← in-memory pub-sub for live tail
  models/
    trace.go                 ← Go structs mirroring trace.schema.json
    rest.go                  ← request/response DTOs
  ids/ids.go                 ← ULID generators (tr_, st_, org_, proj_, tk_, met_, inc_, clu_, ann_, sf_)
```

**Auth model:**
- **API keys** (SDK traffic): `x-api-key` or `Authorization: Bearer tk_...`. SHA-256 fingerprint for fast DB lookup, argon2id verify. Scoped to a project.
- **Dashboard JWT** (browser traffic): HS256, minted by NextAuth with `{sub, email, orgs}` claims. Verified by Go API via shared `JWT_SECRET`.
- **EitherAuth**: read endpoints accept both (so SDKs and dashboard can both list traces).

**Ingest flow:**
1. SDK POSTs full trace JSON to `POST /v1/traces`
2. Pipeline validates, generates `gcs_uri = gs://{bucket}/projects/{project_id}/traces/{trace_id}.json`
3. Uploads JSON to GCS
4. Builds flat BQ row (traces table) + per-step rows (steps table)
5. Enqueues on batched BQ writer (flushes every 100 rows or 500ms)
6. Stores extracted text in `trace_embeddings.text_content` for FTS
7. Publishes trace_id on SSE hub for live tail
8. Returns `{trace_id, ingest_status: "accepted"}` before BQ flush completes

### 2. Python SDK (`observability/sdk-python/`)

**Package:** `theta-observability` (hatchling, pydantic v2, httpx)

**Key classes:**
- `TraceClient(api_key, project, base_url)` — main entry point
- `Trace` — context manager, auto-times, captures exceptions
- `Step` — nested context manager with parent_step_id via ContextVar stack
- `AgentContext` + `wrap_agent()` — two-line agent instrumentation
- `BatchSender` — background thread, bounded queue, exponential backoff retries
- `upload_media()` — proxy upload via `POST /v1/media/upload`

**DX patterns:**
```python
# Zero-config (env vars)
from theta_observability import trace
with trace("my-agent") as t:
    ...

# Explicit
client = TraceClient(api_key="...", project="...")
with client.trace(name="checkout", run_type="prod") as t:
    with t.step(name="plan", type="llm", model="claude-sonnet-4-6") as s:
        s.log_message(role="user", text="Buy milk")
        s.set_token_usage(input=900, output=120)
    t.attach_image("screenshot.png")

# Agent wrapping
@client.wrap_agent("support-agent")
def agent(ctx, query):
    result = call_llm(query)
    ctx.on_complete(result)
    return result
result, run_id = agent("help me")
client.record_metric("task_adherence", run_id, passed=True)
```

**Integrations:** `wrap_openai(client)`, `wrap_anthropic(client)` — monkey-patch LLM SDK calls to auto-emit `llm` steps with token usage.

### 3. Node SDK (`observability/sdk-node/`)

**Package:** `@theta/observability` (tsup ESM+CJS+dts, zod schemas)

Symmetrical API to Python but callback-based:
```ts
await client.trace({ name: "checkout" }, async (t) => {
  await t.step({ name: "plan", type: "llm" }, (s) => {
    s.logMessage({ role: "user", text: "Buy milk" });
  });
});
```

Uses `AsyncLocalStorage` for nested step parenting. `wrapOpenAI` / `wrapAnthropic` via Proxy.

### 4. Next.js Dashboard (`observability/dashboard/`)

**Stack:** Next.js 16.1.7, React 19, Tailwind 4, shadcn (base-mira preset), recharts, NextAuth v5.

**Architecture:**
```
src/
  app/
    page.tsx                    ← marketing landing (auth'd users → redirect to traces)
    (auth)/login/page.tsx       ← Google OAuth via signIn() from next-auth/react
    (auth)/signup/page.tsx      ← same, redirects to /onboarding
    onboarding/                 ← create org → project → API key → wait for first trace
    [org]/
      layout.tsx                ← sidebar (AppSidebar), workspace resolver from Postgres
      page.tsx                  ← org overview (stats, charts, recent traces)
      [project]/
        layout.tsx              ← validates project exists (pass-through)
        traces/page.tsx         ← Live Traces (filter bar + table + saved views)
        traces/[traceId]/       ← trace detail (step rail + messages + annotations)
        metrics/                ← metric cards with pass rates
        incidents/              ← incident list + detail with root cause
        clusters/               ← cluster grid + detail
        experiments/            ← baseline vs experiment comparison
        settings/{keys,members,webhooks,billing,data-retention}/
    docs/                       ← 25-page documentation site (layout + sidebar + CodeBlock)
  components/
    app-sidebar.tsx             ← sidebar nav with org switcher
    user-menu.tsx               ← avatar + name + logout (signOut from next-auth/react)
    trace-list/                 ← filter-bar, trace-table, trace-row, saved-views, status
    trace-detail/               ← header, tabs, step-rail, messages-view, tool-call-card, annotations, modalities/*
    charts/                     ← latency-histogram, token-cost-over-time (recharts)
    settings/                   ← api-key-table, members-table, etc.
    docs/                       ← code-block (sugar-high syntax highlighting), callout, param-table
    ui/                         ← shadcn components (button, badge, card, dialog, table, tabs, etc.)
  lib/
    auth.ts                     ← NextAuth v5 config, ensureDefaultOrg, mintGoApiJwt
    api.ts                      ← server-only fetch wrapper calling Go API with JWT from session
    workspace.ts                ← Postgres queries for org/project resolution by slug
    types.ts                    ← TypeScript types mirroring trace schema
    env.ts                      ← zod-validated env vars
  actions/                      ← "use server" wrappers for API calls
  middleware.ts                 ← route protection (unauthed → /login)
```

**Data flow:**
1. User signs in via Google OAuth → NextAuth creates session + JWT
2. Server components call `auth()` to get session, then `apiFetch()` to call Go API with JWT in `Authorization: Bearer`
3. Go API verifies JWT, returns data from BQ (traces) or Postgres (metrics, incidents, etc.)
4. Client components use server actions for mutations (create annotation, save filter, etc.)
5. Media attachments render via `GET /v1/media/serve?uri=gs://...` which streams from GCS

### 5. Storage

**Google Cloud Storage (GCS):**
- Trace JSON blobs: `gs://{bucket}/projects/{project_id}/traces/{trace_id}.json`
- Media attachments: `gs://{bucket}/projects/{project_id}/traces/{trace_id}/attachments/{filename}`
- SDKs upload via `POST /v1/media/upload` (proxy through Go API)

**BigQuery:**
- `traces` table: one row per trace, partitioned by `ingest_date`, clustered by `(project_id, status)`
- `steps` table: one row per step
- Used for: list traces with filters, get trace metadata, cursor pagination

**PostgreSQL (pgvector-enabled):**
- Control plane: `users`, `orgs`, `org_members`, `projects`, `api_keys`, `sessions`, `accounts`
- Observability: `metrics`, `metric_events`, `incidents`, `incident_traces`, `clusters`, `cluster_traces`, `annotations`, `saved_filters`
- Search: `trace_embeddings` (text_content for FTS, vector column for future embedding search)
- Extensions: `pgcrypto`, `citext`, `vector`

---

## Feature Map

| Feature | Go API | Python SDK | Node SDK | Dashboard |
|---------|--------|------------|----------|-----------|
| Trace ingest | POST /v1/traces | `client.trace()` | `client.trace()` | traces list + detail |
| Steps | stored in trace JSON | `t.step()` context mgr | `t.step()` callback | step rail + messages |
| Media upload | POST /v1/media/upload | `t.attach_image/audio/video/sensor/file()` | `t.attachImage/Audio/Video/File()` | inline rendering via /v1/media/serve |
| Agent wrapping | — | `@client.wrap_agent()` | `client.wrapAgent()` | traces show agent name |
| Metrics | CRUD + record events | `client.record_metric()` | `client.recordMetric()` | metrics page + trace badges |
| Incidents | detect + CRUD | — | — | incidents page + root cause |
| Clusters | discover + CRUD | — | — | clusters page |
| Search | POST /v1/search (FTS) | — | — | filter bar semantic toggle |
| Annotations | CRUD + labels | `t.annotate()` → persisted | — | annotations tab + filter |
| Saved filters | CRUD per project | — | — | saved views pills |
| Admin bulk-patch | PATCH /v1/admin/traces/bulk | — | — | — |
| OpenAI integration | — | `wrap_openai()` | `wrapOpenAI()` | — |
| Anthropic integration | — | `wrap_anthropic()` | `wrapAnthropic()` | — |

---

## Auth & Multi-tenancy

```
Organization (org)
  └── Project (project)
        ├── API Keys (scoped to project)
        ├── Traces (stored in BQ + GCS)
        ├── Metrics (stored in Postgres)
        ├── Incidents (stored in Postgres)
        ├── Clusters (stored in Postgres)
        ├── Annotations (stored in Postgres)
        └── Saved Filters (stored in Postgres)

Users ──┬── org_members (role: owner/admin/member/viewer)
        └── can belong to multiple orgs
```

---

## Local Development

```bash
# Start infra (Postgres + fake-gcs + BQ emulator)
cd observability && docker compose -f docker-compose.dev.yml up -d postgres fake-gcs bq-emulator

# Apply migrations
psql -U theta -d theta_obs -f schema/postgres/001_init.sql
# ... through 007_saved_filters.sql

# Start Go API
cd api-go && go run ./cmd/server

# Start dashboard
cd dashboard && npm run dev

# Install Python SDK
cd sdk-python && pip install -e .

# Run demo
THETA_API_KEY=tk_... THETA_PROJECT=proj_... python examples/chatbot-python/chatbot.py
```

---

## Test Suite

| Suite | Count | What it covers |
|-------|-------|----------------|
| Go unit (clusters) | 15 | k-means, cosine distance, vector ops |
| Go unit (embeddings) | 7 | text extraction, FTS, worker |
| Go unit (handlers) | 11 | request validation, error codes |
| Go unit (incidents) | 5 | pattern grouping, detector |
| Go unit (bq) | 2 | query helpers |
| Python SDK | 9 | trace commit, error status, nested steps, media upload, decorator |
| Node SDK | 7 | client, trace, batch sender |
| Integration | 24 | health, ingest, media, search, SDK e2e, incidents, dashboard pages |
| **Total** | **80+** | |

---

## Environment Variables

### Go API
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 8080 | HTTP port |
| ENV | No | dev | `dev` or `production` |
| DB_URL | Yes | — | Postgres connection string |
| GCS_ENDPOINT | No | — | fake-gcs URL for dev |
| GCS_BUCKET | No | theta-obs-dev | GCS bucket name |
| BQ_PROJECT | Yes | — | BigQuery project ID |
| BQ_DATASET | No | theta_observability | BQ dataset |
| BQ_ENDPOINT | No | — | BQ emulator URL for dev |
| JWT_SECRET | Yes | — | Shared with NextAuth for JWT verification |
| ANTHROPIC_API_KEY | No | — | For incident root cause + cluster labeling |

### Dashboard
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | No | http://localhost:8080 | Go API URL |
| NEXTAUTH_URL | No | http://localhost:3100 | Dashboard URL |
| NEXTAUTH_SECRET | Yes | — | NextAuth session encryption |
| JWT_SECRET | Yes | — | Shared with Go API |
| DATABASE_URL | Yes | — | Same Postgres as Go API |
| AUTH_GOOGLE_ID | Yes | — | Google OAuth client ID |
| AUTH_GOOGLE_SECRET | Yes | — | Google OAuth client secret |

### SDKs
| Variable | Description |
|----------|-------------|
| THETA_API_KEY | API key (any prefix: tk_, tobs_live_, etc.) |
| THETA_PROJECT | Project ID |
| THETA_BASE_URL | API endpoint (default: https://api.theta-observability.com) |
