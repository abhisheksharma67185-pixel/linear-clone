# Theta Observability End-to-End System Guide

This document is the repo-level overview of what Theta Observability is, what has been built in this repository, how the system is structured, and how the major pieces work together end to end.

Use this file as the high-level reference before drilling into the API reference, SDK docs, or individual service code.

## 1. What Theta Is

Theta Observability is a full-stack observability platform for AI runtimes.

Its job is to let teams instrument any agent or workflow, send traces and artifacts into a central backend, and inspect those runs in a multi-tenant dashboard with filtering, search, metrics, incidents, monitors, clusters, and replay-oriented trace detail.

Theta is designed for:

- LLM applications and agent systems
- tool-heavy workflows
- multimodal runtimes that emit text, image, audio, video, sensor, or file artifacts
- browser, desktop, or computer-use traces
- evaluation and experiment runs
- generic backend jobs that need the same trace contract

The product is positioned around two ideas:

- `Observability`: traces, replay, artifacts, search, filters, dashboards, incidents, and investigation workflows
- `Reliability`: catch failures earlier, reduce regressions, debug faster, and trust production agents

## 2. What Has Been Built

This repository contains the complete product stack:

- A Go backend for ingest, auth, control plane, search, incidents, clusters, metrics, threads, monitors, media handling, imports, and exports
- A Next.js dashboard for onboarding, org/project management, trace exploration, metrics, incidents, clusters, threads, monitors, experiments, and settings
- A Python SDK for tracing, media upload, metrics, provider integrations, and generic instrumentation
- A Node.js SDK with the same core tracing model plus provider and framework integrations
- A canonical provider-neutral event model and generic ingest APIs
- A lightweight MCP server for IDE and agent workflows
- Local development infrastructure with Docker Compose
- API, SDK, schema, self-hosting, integration, and architecture documentation

## 3. Architecture At A Glance

```text
Applications / Agents / Jobs
    |
    |  SDK traces, canonical events, or bulk import
    v
+-----------------------------+
|        Go API Server        |
| chi router + auth + ingest  |
| media + metrics + search    |
| monitors + incidents        |
| clusters + threads + orgs   |
+-------------+---------------+
              |
              | writes / reads
   +----------+-----------+-----------------+
   |                      |                 |
   v                      v                 v
+---------+        +-------------+    +-------------+
|   GCS   |        |  BigQuery   |    |  Postgres   |
| raw JSON|        | trace index |    | control     |
| media   |        | step index  |    | plane + app |
+---------+        +-------------+    +-------------+
              ^
              |
              | JWT-authenticated reads and mutations
              |
+-----------------------------+
|     Next.js Dashboard       |
| App Router + NextAuth + UI  |
+-----------------------------+
```

In practice:

1. An SDK or external producer sends a trace payload or canonical event envelope to the Go API.
2. The API validates and normalizes the payload.
3. Raw trace JSON and media blobs are stored in object storage.
4. Query-friendly rows are written to BigQuery.
5. Control-plane and operational data live in Postgres.
6. The dashboard reads data through the same API using JWT auth.

## 4. Repository Map

Top-level areas in this repository:

- `api-go/`: Go backend
- `dashboard/`: Next.js product UI and in-app docs site
- `sdk-python/`: Python SDK package `theta-observability`
- `sdk-node/`: Node package `@theta/observability`
- `docs/`: markdown reference docs
- `examples/`: integration and usage examples
- `mcp/`: Theta MCP server
- `schema/`: JSON schema and related contracts
- `tests/`: higher-level integration coverage
- `docker-compose.dev.yml`: local stack
- `ARCHITECTURE.md`: service-level architecture reference
- `PRD.md`: product positioning and requirements

## 5. The Backend

The backend entrypoint is `api-go/cmd/server/main.go`.

It wires the router, middleware, storage clients, background workers, and route handlers. The current route map includes health endpoints plus 60+ application routes spanning ingest, search, metrics, organization management, threads, monitors, webhooks, billing, clusters, incidents, and admin actions.

### 5.1 Backend responsibilities

The Go API is responsible for:

- API key and JWT authentication
- trace ingestion
- generic canonical event ingest
- bulk import
- media upload and browser-safe media serving
- query APIs for traces and metrics
- search
- annotations and saved filters
- incidents and clusters
- threads and monitors
- org/project/member/key/webhook/billing operations
- interoperability exports like OTel-style trace export

### 5.2 Main internal packages

Important backend packages:

- `internal/auth/`: API key validation, JWT verification, auth middleware, password helpers
- `internal/ingest/`: payload normalization and ingest pipeline
- `internal/gcs/`: object storage access and path construction
- `internal/bq/`: BigQuery writes and queries
- `internal/store/`: Postgres-backed CRUD and relational state
- `internal/handlers/`: HTTP handlers
- `internal/incidents/`: incident detection logic
- `internal/clusters/`: clustering and discovery
- `internal/embeddings/`: text extraction and indexing worker
- `internal/sse/`: live tail event fanout
- `internal/models/`: trace, REST, and canonical model structs

### 5.3 Authentication model

The system supports two auth paths:

- `API keys` for SDKs and machine-to-machine ingest
- `JWT bearer tokens` for the dashboard and signed-in users

API keys are scoped to a project and resolve the org/project context used during ingest.

JWTs are used by the dashboard to call the Go API and access control-plane and read APIs as a user.

### 5.4 Ingest modes

Theta supports more than one way to send data:

- `POST /v1/traces`: native Theta trace payload ingest
- `POST /v1/events`: canonical event envelope ingest
- `POST /v1/imports/traces`: bulk import of trace payloads or canonical envelopes
- `POST /v1/traces/{id}/steps`: step append path

This matters because Theta is being built as a generic observability layer, not only an SDK-specific product.

### 5.5 Core ingest flow

The main ingest path is:

1. Request arrives at the API.
2. Auth is resolved to org and project context.
3. Payload is validated and normalized.
4. Raw trace JSON is written to object storage.
5. Flat rows for traces and steps are written to BigQuery.
6. Extracted text is indexed for search.
7. SSE live-tail subscribers are notified.
8. The API returns an accepted response.

The backend is structured so that the trace itself remains the source of truth, while BigQuery and Postgres serve query and application workflows.

## 6. Storage Architecture

Theta uses three storage layers because each one serves a different job.

### 6.1 Object storage

Object storage holds the canonical raw payloads and large artifacts.

Current path layout is tenant-aware:

- trace JSON: `orgs/{org_id}/projects/{project_id}/traces/{trace_id}.json`
- attachments: `orgs/{org_id}/projects/{project_id}/traces/{trace_id}/attachments/{filename}`

This layout is implemented in `api-go/internal/gcs/paths.go`.

Why object storage exists:

- preserve the full raw trace
- store large media without bloating query tables
- make replay and artifact retrieval possible
- support tenant-scoped cleanup and retention

### 6.2 BigQuery

BigQuery stores query-oriented trace and step rows.

This is what the system uses for:

- listing traces
- filtering
- pagination
- summary statistics
- trace-detail fetch paths that do not require re-reading the raw object

### 6.3 Postgres

Postgres stores application and control-plane state:

- users
- orgs and memberships
- projects
- API keys
- invites
- sessions and auth data
- webhooks
- usage events
- metrics and metric events
- incidents
- clusters
- annotations
- saved filters
- threads
- monitors
- search/index support tables

Postgres is the source of truth for tenant structure and operational state.

## 7. The Canonical Observability Model

Theta includes a versioned, provider-neutral event contract in `api-go/internal/models/canonical.go`.

The canonical envelope includes:

- top-level execution identity like trace, run, session, user, source, kind, and platform
- tags and arbitrary metadata
- correlation fields like request ID, parent trace ID, and root trace ID
- typed events for messages, tool calls, attachments, sensor frames, and generic values

This is the backbone of Theta’s generic ingest direction.

It allows systems that do not emit native Theta trace payloads to still integrate cleanly through:

- canonical event mapping
- bulk import
- export contracts
- adapter-based instrumentation

## 8. The SDK Layer

Theta ships with two first-party SDKs:

- Python: `theta-observability`
- Node.js / TypeScript: `@theta/observability`

The two SDKs are intentionally symmetrical at the concept level.

### 8.1 Shared SDK concepts

Both SDKs support:

- creating traces
- nested steps
- messages with typed content parts
- attachments and media upload
- metadata
- metrics
- provider and framework integrations
- fail-soft batching
- explicit flush behavior
- reading traces back from the API

The shared design goal is:

- one mental model across Python and Node
- minimal code required to start emitting useful traces
- compatibility with both native Theta traces and generic observability use cases

### 8.2 Python SDK

The Python package lives in `sdk-python/`.

Core modules include:

- `client.py`
- `trace.py`
- `metrics.py`
- `media.py`
- `batch.py`
- `agent.py`
- `decorator.py`

Key Python capabilities:

- trace and step context managers
- structured message logging
- multimodal attachments
- metric definition and metric-event recording
- decorator-based instrumentation
- background batch sender
- explicit close/flush semantics

Python integrations currently include:

- OpenAI
- Anthropic
- OpenClaw
- LangChain

### 8.3 Node SDK

The Node package lives in `sdk-node/`.

Core modules include:

- `client.ts`
- `trace.ts`
- `metrics.ts`
- `media.ts`
- `batch.ts`
- `agent.ts`
- `observe.ts`
- `async-context.ts`

Key Node capabilities:

- callback-based tracing
- nested step parenting via `AsyncLocalStorage`
- typed inputs through exported TypeScript types
- batch sender and flush behavior
- media helpers
- provider and framework integrations

Node exports integrations for:

- OpenAI
- Anthropic
- OpenClaw
- LangChain
- Next.js

### 8.4 Why the SDKs matter

The SDKs are the easiest adoption path, but they are not intended to be the only way data can reach Theta.

They provide:

- excellent developer experience for greenfield apps
- consistent trace semantics
- easy metadata capture
- attachment upload helpers
- wrapper-based instrumentation for common providers

## 9. Dashboard Architecture

The dashboard lives in `dashboard/` and is built with:

- Next.js App Router
- React 19
- Tailwind CSS 4
- shadcn/ui components
- NextAuth for authentication

### 9.1 Dashboard responsibilities

The dashboard is not a mock shell. It is the main operator interface for the system.

It handles:

- sign in and onboarding
- org and project navigation
- trace feed and filtering
- trace detail inspection
- metrics review
- incidents
- clusters
- experiments
- threads
- monitors
- API keys
- members and invites
- webhooks
- retention and billing settings
- product docs site

### 9.2 Main app structure

The important app routes include:

- marketing and public product pages
- auth routes for login, signup, invite flows
- onboarding flow
- org overview
- project-scoped traces, metrics, incidents, clusters, experiments, threads, and monitors
- settings surfaces for keys, members, webhooks, retention, and billing
- docs routes for API, SDK, concepts, and self-hosting

### 9.3 Trace viewer

The trace detail experience is one of the core product surfaces.

Key UI components include:

- step rail
- messages view
- JSON viewer
- annotations panel
- tool call cards
- modality renderers for image, audio, video, files, and sensor data

These components live primarily under `dashboard/src/components/trace-detail/`.

### 9.4 Filtering and search

The trace list supports:

- status filters
- model/platform/run-type filters
- time windows
- grouping
- semantic search
- saved views
- metadata-driven filtering

Metadata filters are important because the platform is designed to support customer-defined JSON metadata without requiring new hard-coded dashboard fields each time.

## 10. Product Features By Area

### 10.1 Core trace and replay features

- trace ingest
- step trees
- messages
- tool call rendering
- artifact viewing
- live tail
- JSON trace inspection

### 10.2 Analysis and investigation

- search
- saved filters
- annotations
- metrics
- incidents
- clusters
- experiments
- threads
- monitors

### 10.3 Tenant and control-plane features

- signup
- organization creation
- project creation
- member invites
- API keys
- webhooks
- usage
- billing hooks
- retention settings

### 10.4 Interoperability and extension features

- canonical event ingest
- bulk import
- OTel-style export
- MCP server
- SDK integrations for common model/framework paths

## 11. Organization and Project Isolation

Theta is built as a multi-tenant system.

The intended isolation model is:

- every org is a top-level tenant
- every project belongs to exactly one org
- every API key belongs to exactly one project
- every trace is ingested in an org/project context
- object storage paths carry org and project identifiers
- dashboard access is scoped by user membership

This is critical for:

- access control
- billing attribution
- retention policy enforcement
- export/import safety
- future enterprise features

## 12. Interoperability and External Surfaces

Theta already exposes several surfaces beyond the main trace path.

### 12.1 Generic ingest

The generic ingest layer exists so external systems can integrate without rewriting around the Theta trace schema.

Implemented surfaces:

- canonical event ingest
- bulk import
- metadata-preserving normalization

### 12.2 OTel-style export

Theta includes an export surface at `GET /v1/projects/{id}/exports/otel`.

This is for interoperability with teams or tools that expect OpenTelemetry-style output. It is an export path, not Theta’s primary ingest model.

### 12.3 MCP server

The repo includes a lightweight stdio MCP server documented in `docs/mcp-server.md`.

Current exposed tools include:

- list traces
- get trace
- search traces
- export OTel
- list threads
- list monitors

This lets IDEs and agents inspect Theta data directly.

## 13. Local Development and Deployment

Theta supports local development with `docker-compose.dev.yml`.

The development stack includes:

- dashboard
- API server
- Postgres
- fake GCS server
- BigQuery emulator

Important local URLs:

- dashboard: `http://localhost:3100`
- API: `http://localhost:8080`
- Postgres: `postgres://theta:theta@localhost:5432/theta_obs`
- fake GCS: `http://localhost:4443`
- BigQuery emulator: `http://localhost:9050`

There is also a self-hosting guide in `docs/self-hosting.md` covering:

- environment variables
- database setup
- object storage setup
- BigQuery setup
- Cloud Run deployment
- Kubernetes deployment
- production checklist

## 14. Typical End-to-End Flows

### 14.1 Greenfield SDK flow

1. User signs in to the dashboard.
2. User creates an org.
3. User creates a project.
4. User creates an API key.
5. User installs the Node or Python SDK.
6. Application emits traces and attachments.
7. User opens the trace list and detail views in the dashboard.

### 14.2 Generic integration flow

1. External system maps its runtime events into Theta’s canonical envelope.
2. Producer sends data to `POST /v1/events` or `POST /v1/imports/traces`.
3. Theta normalizes the payload into the native trace model.
4. Data becomes queryable in the same dashboard and APIs as SDK-originated traces.

### 14.3 Investigation flow

1. Operator filters traces by status, metadata, model, or run type.
2. Operator opens a trace.
3. Operator inspects step-level messages, artifacts, and tool calls.
4. Operator adds annotations or records metrics.
5. Operator uses incidents, clusters, threads, or monitors to move from one run to a broader reliability view.

## 15. Documentation Set

The main docs already in the repo are:

- `README.md`: project entrypoint
- `ARCHITECTURE.md`: architecture deep dive
- `PRD.md`: product definition and positioning
- `docs/api-reference.md`: route-level API reference
- `docs/trace-schema.md`: trace payload schema
- `docs/canonical-event-model.md`: provider-neutral event contract
- `docs/python-sdk.md`: Python SDK reference
- `docs/node-sdk.md`: Node SDK reference
- `docs/langchain-integration.md`: LangChain integration notes
- `docs/mcp-server.md`: MCP server reference
- `docs/self-hosting.md`: deployment and infra guide

This file is the cross-cutting overview that connects them.

## 16. Testing and Validation Strategy

The repo includes automated coverage across the backend, SDKs, and end-to-end flows.

Coverage areas include:

- Go handler and package tests
- Node SDK tests
- Python SDK tests
- integration and smoke tests
- dashboard build and lint validation

The intended validation bar for Theta is:

- backend routes compile and pass tests
- dashboard builds cleanly
- SDKs can emit traces successfully
- media upload and trace retrieval work
- auth and onboarding work
- storage layers are reachable in local development

## 17. What This System Is Optimized For

Theta is strongest when teams need:

- visibility into long, multi-step AI runs
- artifact-aware debugging
- a single trace model across text and multimodal evidence
- tenant-aware SaaS controls
- both SDK-based and adapter-based ingest paths
- a product UI that can be used by operators, not only developers

## 18. Where To Go Next

If you want more detail after this document:

- read `docs/canonical-event-model.md` for generic ingest contracts
- read `docs/api-reference.md` for exact endpoints
- read `docs/python-sdk.md` or `docs/node-sdk.md` for instrumentation usage
- read `docs/self-hosting.md` for deployment
- read `ARCHITECTURE.md` for backend component structure
