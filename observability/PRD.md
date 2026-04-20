# Theta Observability PRD

Status: Draft for implementation alignment  
Last updated: 2026-04-20  
Scope: External SaaS and self-hosted observability platform for AI agents and multimodal runs

## 1. Product Summary

Theta Observability is a full-stack observability platform for AI agents, LLM applications, and multimodal systems. It provides SDKs that instrument agent execution, an ingest API that stores and indexes traces, and a dashboard that helps teams inspect runs, debug failures, evaluate quality, and manage organizations, projects, members, and API keys.

## 1.1 Positioning

Theta is positioned as:

`The reliability and observability platform for AI runtimes.`

This positioning is intentional:

- `Observability` explains what Theta does today: traces, replay-oriented inspection, artifacts, filters, search, incidents, monitors, and investigation workflows.
- `Reliability` explains the customer outcome Theta should deliver: catch failures earlier, reduce regressions, debug faster, and trust production agents and workflows.

Theta should not be positioned as only:

- prompt tooling
- model serving
- a generic BI layer
- a dashboard-only tracing product

Theta should be positioned around runtime visibility and production trust for:

- AI agents
- computer-use and desktop/browser workflows
- multimodal systems
- tool-heavy and long-running automated workflows
- backend jobs and evaluation runs that need the same trace contract

Theta is positioned for teams building:
- Text-first agents and copilots
- Multimodal assistants that handle image, audio, and video
- Robotics or embodied systems that emit sensor data
- Evaluation and experimentation workflows
- Internal and external SaaS deployments that require organization-level isolation

## 2. Problem Statement

Teams shipping AI agents struggle with four recurring problems:

1. Agent execution is opaque.
Applications call models, tools, retrieval systems, and external services, but teams cannot reliably reconstruct what happened in a single run.

2. Multimodal evidence is fragmented.
Logs often preserve text but drop images, audio, video, and robotics sensor streams, which makes debugging incomplete.

3. Evaluation data is disconnected from production traces.
Metrics, annotations, incidents, experiments, and clusters are often tracked in separate systems rather than attached directly to the trace history.

4. Operational ownership is weak.
Organizations need project separation, API keys, access control, retention controls, usage visibility, and auditable storage paths that map cleanly to tenants.

Theta must solve these problems with a system that is easy to adopt from application code, operationally safe to run in production, and inspectable from a polished dashboard.

## 3. Target Users

### Primary users

- AI application engineers
- Agent platform teams
- Applied AI researchers
- MLOps / platform engineers
- Robotics engineers working with multimodal execution traces

### Secondary users

- Product managers reviewing agent quality
- Support teams debugging customer-facing runs
- Security and compliance teams auditing data retention and access
- External customers of the hosted SaaS

## 4. Goals

### Core goals

1. Make every important agent run reconstructable from one trace.
2. Support first-class multimodal evidence: text, image, audio, video, sensor, and generic files.
3. Provide lightweight SDK adoption for Node.js and Python.
4. Support metadata-rich filtering so customers can segment traces using their own JSON structure.
5. Deliver organization- and project-scoped tenancy across API, storage, and dashboard access.
6. Expose operational tooling for keys, members, webhooks, retention, usage, incidents, experiments, and clusters.
7. Support both hosted SaaS and self-hosted developer environments.

### Quality goals

1. Fail-soft SDK behavior in production applications.
2. Low-friction local development with Docker-based dependencies.
3. Deterministic end-to-end validation for SDKs and ingest.
4. Clear documentation that matches the implemented contract.

## 5. Non-Goals

1. Theta is not a model-serving platform.
2. Theta is not a data-labeling suite for large offline datasets.
3. Theta is not a generic BI warehouse replacement.
4. Theta is not a workflow orchestrator for agent execution.

## 6. Product Principles

1. The trace is the source of truth.
2. Multimodal support is a first-class requirement, not an add-on.
3. User-defined metadata must remain flexible and queryable.
4. Tenancy boundaries must be explicit in storage and access control.
5. The SDK surface must be small, ergonomic, and predictable.
6. The dashboard should expose the real system state, not demo-only placeholders.

## 7. Core User Journeys

### 7.1 First-time onboarding

1. User signs in.
2. User creates an organization.
3. User creates a project.
4. User creates an API key.
5. User installs the SDK.
6. User sends the first trace.
7. User sees the trace appear in the dashboard and can inspect messages, media, metrics, and metadata.

### 7.2 Production debugging

1. Engineer filters traces by status, run type, model, tags, and metadata JSON paths.
2. Engineer opens a trace detail view.
3. Engineer inspects the step tree, messages, tool calls, attachments, and sensor frames.
4. Engineer adds annotations or records metrics.
5. Engineer flags the trace or links it to an incident.

### 7.3 Evaluation workflow

1. Team records traces from evaluation runs.
2. Team records metrics against those traces.
3. Team compares experiment runs and baselines.
4. Team uses saved filters, clusters, and incidents to inspect patterns in failure cases.

### 7.4 Multimodal / robotics debugging

1. Agent emits image, audio, video, file, and sensor payloads.
2. Theta stores those assets under the correct org/project trace path.
3. Dashboard renders image, audio, video, generic file, and sensor artifacts in context.
4. Team can replay the full run without reconstructing assets from separate systems.

## 8. Functional Requirements

### 8.1 SDKs

Theta must provide production-usable Node.js and Python SDKs with:

- Trace creation
- Nested step creation
- Automatic step parenting
- Message logging with typed content parts
- Step-level and trace-level attachments
- Robotics sensor frame logging
- Metadata and nested metadata-path helpers
- Metric creation and metric-event recording
- Agent wrappers
- Batch sending with retries
- Flush and shutdown primitives
- Trace list and trace detail read APIs
- Integrations for OpenAI, Anthropic, and OpenClaw-compatible clients

The SDKs must support:

- Long-form conversation traces
- Multimodal uploads from file paths, bytes, buffers, streams, and URLs
- Fail-soft media upload and batch behavior
- Local testability with custom HTTP/fetch clients

### 8.2 Ingest API

The Go API must support:

- Auth via API keys and signed-in dashboard users
- Trace ingestion
- Trace listing with server-side filtering
- Trace detail retrieval
- Media proxy uploads and browser-safe serving
- Metrics and metric events
- Annotations
- Saved filters
- Search
- Incidents
- Clusters
- Members and invites
- Projects and organizations
- Webhooks
- Usage and billing-facing usage summaries

### 8.3 Metadata filtering

The product must support customer-defined JSON metadata on traces and steps.

Requirements:

- SDKs must provide simple metadata setters and dot-path setters.
- The list-traces API must support repeated metadata filter pairs.
- The dashboard must discover metadata keys from real traces and allow users to create filters against them.
- Customers must be able to filter traces using new metadata fields without code changes in the dashboard.

### 8.4 Dashboard

The dashboard must include:

- Organization overview
- Trace feed with filtering and saved views
- Trace detail with steps, messages, tool calls, attachments, and sensor frames
- Metrics
- Incidents
- Clusters
- Experiments
- API keys
- Members
- Webhooks
- Retention
- Billing / usage
- Public product, legal, and auth-adjacent routes

### 8.5 Organization and project isolation

Isolation requirements:

- Every project belongs to exactly one organization.
- Every API key belongs to exactly one project.
- Trace ingest from an API key must always be scoped to that key’s project and org.
- Storage paths must be org- and project-scoped.
- Dashboard access must only expose data for orgs a user belongs to.

### 8.6 Storage and data model

Theta must store:

- Raw traces and media in object storage
- Flat query rows in BigQuery
- Operational and relational state in Postgres

Object storage keys must follow an org/project hierarchy:

`orgs/{org_id}/projects/{project_id}/traces/{trace_id}...`

This requirement exists to support:

- Tenant isolation
- Easier auditing
- Simpler cleanup and retention workflows
- Clear billing/usage attribution

## 9. Non-Functional Requirements

### 9.1 Reliability

- The ingest path should accept valid traces and return quickly.
- Background indexing or enrichment must not block the happy path.
- SDK failures must not crash the host application by default.
- Batch submission must retry transient failures.

### 9.2 Performance

- Dashboard trace list queries must be server-filtered.
- Trace detail fetches should return the full persisted payload in one request.
- Media should be streamed through safe endpoints for browser playback.

### 9.3 Security

- API keys must be hashed at rest.
- User dashboard access must be org-scoped.
- Legal/public routes must remain accessible without auth loops.
- Sensitive uploads must not depend on unsafe direct client-side credentials.

### 9.4 Privacy and compliance

- The product must expose retention settings and document expected data handling.
- Usage and media storage must be attributable by org/project.
- Trace payloads may include customer data, so export, retention, and deletion flows must remain explicit.

### 9.5 Developer experience

- Local stack bootstrapping must work through Docker Compose and `.env` configuration.
- SDK reference docs must reflect the real API surface.
- E2E validation scripts must be deterministic and runnable without third-party model dependencies.

## 10. Success Metrics

### Adoption metrics

- Time from key generation to first visible trace
- Percentage of active projects emitting traces weekly
- SDK install to first successful trace conversion rate

### Product quality metrics

- Trace ingest success rate
- Media upload success rate
- Trace list query latency
- Trace detail fetch latency
- Dashboard error rate
- Percentage of traces with metadata suitable for filtering

### Workflow metrics

- Percentage of incidents linked to traces
- Percentage of evaluation traces with recorded metrics
- Saved-filter usage rate
- Percentage of multimodal traces with renderable attachments

## 11. Release Acceptance Criteria

Theta is release-ready when:

1. A new user can sign in, create an org, create a project, create an API key, and see the first trace.
2. Node and Python SDKs can emit and read back long-form multimodal traces end to end.
3. Metadata filtering works in API, SDKs, and dashboard.
4. Trace detail renders step messages, tool calls, attachments, and sensor frames.
5. Object storage paths are org- and project-scoped.
6. API, SDK, dashboard, and integration tests pass in the local stack.
7. Docs describe the current SDK and API contracts accurately.

## 12. Current Gaps To Track

These items should remain visible until closed:

- Stripe billing flows need full webhook-grade implementation if billing moves beyond placeholder usage views.
- OpenAPI must be kept in sync with the implemented server routes and payloads.
- Hosted auth flows still need full browser-driven QA for external OAuth providers.
- Long-term pagination, retention enforcement, and data export/delete workflows should be validated at higher scale.

## 13. Feature Status

### 13.1 Shipped today

These capabilities are implemented and should be treated as part of the current product surface.

- Multi-tenant control plane: organizations, projects, invites, members, API keys, usage views, retention settings, and project-scoped resources.
- Trace ingestion: native `POST /v1/traces`, generic `POST /v1/events`, bulk import via `POST /v1/imports/traces`, and step append.
- Canonical event model: provider-neutral envelope for external systems, adapters, replay jobs, and imported traces.
- Multimodal evidence handling: image, audio, video, file, and sensor attachments plus browser-safe media serving.
- Storage separation by tenant: object paths are org- and project-scoped.
- Trace investigation surface: trace list, trace detail, annotations, saved filters, search, and live tail.
- Reliability primitives: metrics, metric events, incidents, clusters, monitors, and conversation threads.
- Desktop/computer-use import path: imported desktop traces with screenshot artifacts and action metadata.
- Node and Python SDKs: trace creation, nested steps, attachments, batching, metrics, agent wrappers, and read APIs.
- SDK integrations: OpenAI, Anthropic, LangChain, OpenClaw, and Next.js helpers.
- Export and interoperability surface: OTel-style export and MCP server support.
- Self-hosting and local stack: Docker-based dev environment and E2E stack validation.

### 13.2 Partially shipped / needs hardening

These capabilities exist, but the product has not fully earned the claim without more implementation, QA, or operational depth.

- Reliability workflows: incidents and monitors exist, but alert execution, escalation, and remediation workflows are still thin.
- Replay for computer-use traces: screenshots render, but the full action timeline and replay UX are not yet first-class.
- Dynamic metadata filtering: metadata filters exist, but field discovery, typed operators, and no-code filter authoring still need work.
- Experiments, clusters, and threads: real surfaces exist, but they still need deeper workflows, comparison tooling, and cross-trace navigation.
- Search: full-text search works; semantic search depends on enrichment configuration and needs stronger validation at scale.
- Webhooks, retention, and billing: control-plane endpoints and settings exist, but deeper production-grade delivery and billing behavior still need hardening.
- Auth and onboarding: functional in local/dev flows, but hosted browser-grade QA and edge-case handling are still incomplete.
- OTel interoperability: export exists; native ingest and broader translation coverage are still incomplete.
- Documentation and API contract sync: docs are strong, but OpenAPI and implementation need continuous lockstep validation.
- Scaling behavior: pagination, delete/export flows, retention enforcement, and large-volume validation still need systematic testing.

### 13.3 Must build next

These are the highest-value additions required for Theta to fully justify `reliability + observability` as a durable category position.

- First-class replay viewer for desktop, browser, and mobile traces.
- Unified action/event schema and renderer for click, type, scroll, drag, navigate, wait, ask-user, tool result, and custom actions.
- Dynamic metadata field discovery with typed filtering and saved query support.
- Stable query DSL and API-backed reusable investigation workflows.
- Cross-trace correlation for sessions, request IDs, parent/root traces, releases, and user journeys.
- Real monitor execution engine with alert policies, state transitions, notification delivery, history, and suppression.
- Regression and drift detection tied to traces, releases, prompts, models, and experiments.
- Queue-backed ingest with retries, deduplication, idempotency keys, backpressure handling, and dead-letter support.
- Native OTel ingest and adapter-based import/export for external systems.
- Governance layer: audit logs, fine-grained RBAC, redaction, PII scrubbing, and policy inheritance.
- Enterprise identity and provisioning: SSO and SCIM.
- Explicit export, delete, and retention enforcement workflows with scale validation.
- BYO storage / warehouse modes and declarative infrastructure setup for enterprise deployments.

## 14. Roadmap

### Phase 1

- Stable ingest and trace inspection
- Node and Python SDK parity
- Metadata filters
- Multimodal trace detail
- Org/project isolation

### Phase 2

- Stronger experiments UX
- Richer cluster and incident workflows
- Better metric authoring and evaluator pipelines
- Webhook delivery observability

### Phase 3

- Enterprise-grade retention enforcement
- Full billing automation
- Audit logs
- Export and deletion tooling
- Large-scale query and storage optimization

## 15. Out of Scope For This PRD

- New model provider wrappers beyond the currently supported integrations
- Workflow orchestration and scheduling
- Human labeling marketplace functionality
- Automated prompt optimization systems
