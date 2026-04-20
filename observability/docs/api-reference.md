# REST API Reference

Complete reference for the Theta Observability ingest and control-plane API.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Error Format](#error-format)
- [Trace Endpoints](#trace-endpoints)
  - [POST /v1/traces -- Ingest a trace](#post-v1traces)
  - [POST /v1/events -- Ingest a canonical event envelope](#post-v1events)
  - [POST /v1/imports/traces -- Bulk import traces or envelopes](#post-v1importstraces)
  - [GET /v1/traces -- List traces](#get-v1traces)
  - [GET /v1/traces/:id -- Get trace detail](#get-v1tracesid)
  - [POST /v1/traces/:id/steps -- Append steps](#post-v1tracesidsteps)
  - [GET /v1/traces/:id/tail -- Live tail (SSE)](#get-v1tracesidtail)
- [Media Endpoints](#media-endpoints)
  - [POST /v1/media/upload -- Upload media](#post-v1mediaupload)
  - [POST /v1/media/signed-url -- Get signed URL](#post-v1mediasigned-url)
- [Search](#search)
  - [POST /v1/search -- Semantic search](#post-v1search)
- [Metrics Endpoints](#metrics-endpoints)
  - [POST /v1/metrics -- Create metric](#post-v1metrics)
  - [GET /v1/metrics -- List metrics](#get-v1metrics)
  - [POST /v1/metrics/:id/events -- Record metric event](#post-v1metricsidevent)
  - [GET /v1/metrics/:id/events -- List metric events](#get-v1metricsideventlist)
  - [GET /v1/traces/:id/metrics -- Trace metric events](#get-v1tracesidmetrics)
- [Incident Endpoints](#incident-endpoints)
  - [GET /v1/incidents -- List incidents](#get-v1incidents)
  - [GET /v1/incidents/:id -- Incident detail](#get-v1incidentsid)
  - [PATCH /v1/incidents/:id -- Update incident](#patch-v1incidentsid)
  - [POST /v1/incidents/detect -- Trigger detection](#post-v1incidentsdetect)
- [Cluster Endpoints](#cluster-endpoints)
  - [GET /v1/clusters -- List clusters](#get-v1clusters)
  - [GET /v1/clusters/:id -- Cluster detail](#get-v1clustersid)
  - [POST /v1/clusters/discover -- Trigger discovery](#post-v1clustersdiscover)
- [Admin Endpoints](#admin-endpoints)
  - [PATCH /v1/admin/traces/bulk -- Bulk update](#patch-v1admintrace-bulk)
- [Account & Organization Endpoints](#account--organization-endpoints)
  - [POST /v1/signup -- Create account](#post-v1signup)
  - [GET /v1/orgs -- List organizations](#get-v1orgs)
  - [POST /v1/orgs -- Create organization](#post-v1orgs)
  - [GET /v1/orgs/:org_id/members -- List members](#get-v1orgsmembers)
  - [POST /v1/invites -- Invite member](#post-v1invites)
  - [POST /v1/invites/accept -- Accept invite](#post-v1invitesaccept)
- [Project & Key Endpoints](#project--key-endpoints)
  - [GET /v1/projects -- List projects](#get-v1projects)
  - [POST /v1/projects -- Create project](#post-v1projects)
  - [GET /v1/projects/:id -- Get project](#get-v1projectsid)
  - [GET /v1/projects/:id/keys -- List API keys](#get-v1projectsidkeys)
  - [POST /v1/projects/:id/keys -- Create API key](#post-v1projectsidkeys)
  - [DELETE /v1/projects/:id/keys/:key_id -- Revoke API key](#delete-v1projectsidkeyskey_id)
- [Usage & Billing](#usage--billing)
  - [GET /v1/usage -- Current usage](#get-v1usage)
- [Health Checks](#health-checks)

---

## Overview

The Theta Observability API is a multi-tenant REST API that handles trace ingestion, media storage, search, metrics, incident detection, and organizational management. It is built in Go with chi router, backed by GCS, BigQuery, and Postgres.

All request and response bodies are JSON unless otherwise noted.

---

## Authentication

The API supports two authentication methods:

### API Key (SDK / programmatic access)

Pass your API key in the `x-api-key` header:

```
x-api-key: tk_live_...
```

API keys are scoped to a project. Use them for trace ingestion, media upload, and metric recording.

### Bearer Token (dashboard / JWT)

Pass a JWT in the `Authorization` header:

```
Authorization: Bearer eyJhbG...
```

Bearer tokens are used by the dashboard for org/project management endpoints. They are minted by the NextAuth layer.

### Which to use

| Endpoint group | Auth method |
|----------------|-------------|
| Trace ingestion (`POST /v1/traces`, `POST /v1/events`, bulk import, media, metrics) | API key |
| Trace reads (`GET /v1/traces`, search, clusters, incidents) | API key or Bearer |
| Org/project management | Bearer |
| Signup | None |
| Health checks | None |

---

## Base URL

| Environment | URL |
|-------------|-----|
| Production | `https://api.theta-observability.com` |
| Local development | `http://localhost:8080` |

---

## Error Format

Errors follow a consistent structure:

```json
{
  "error": {
    "code": "not_found",
    "message": "Trace tr_01HW... not found"
  }
}
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| `400` | Invalid request body or parameters |
| `401` | Missing or invalid authentication |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate email on signup) |
| `422` | Validation error |
| `429` | Rate limited |
| `500` | Internal server error |

---

## Trace Endpoints

### POST /v1/traces

Ingest a complete trace. This is the primary endpoint used by the SDKs.

**Auth:** API key

**Request body:** A [Trace payload](./trace-schema.md) (JSON).

```bash
curl -X POST https://api.theta-observability.com/v1/traces \
  -H "x-api-key: tk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "schema_version": "1.0",
    "trace_id": "tr_01HWabc123",
    "project_id": "proj_abc",
    "name": "checkout-agent",
    "status": "success",
    "started_at": "2026-04-15T12:00:00Z",
    "ended_at": "2026-04-15T12:00:02Z",
    "latency_ms": 2000,
    "token_usage": { "input": 900, "output": 120, "total": 1020 },
    "steps": [
      {
        "step_id": "st_001",
        "type": "llm",
        "name": "plan",
        "model": "claude-sonnet-4-6",
        "status": "success",
        "started_at": "2026-04-15T12:00:00Z",
        "ended_at": "2026-04-15T12:00:01Z",
        "latency_ms": 1000,
        "messages": [
          { "role": "user", "content": [{ "type": "text", "text": "Buy milk" }] },
          { "role": "assistant", "content": [{ "type": "text", "text": "Navigating to store..." }] }
        ],
        "token_usage": { "input": 900, "output": 120, "total": 1020 }
      }
    ]
  }'
```

**Response (202 Accepted):**

```json
{
  "trace_id": "tr_01HWabc123",
  "ingest_status": "accepted",
  "gcs_uri": "gs://theta-obs/orgs/org_abc/projects/proj_abc/traces/tr_01HWabc123.json"
}
```

---

### POST /v1/events

Ingest a provider-neutral canonical event envelope. Theta normalizes the envelope into the standard trace pipeline so search, incidents, clustering, and the dashboard work without custom code.

**Auth:** API key

**Request body:** See [Canonical Event Model](./canonical-event-model.md).

```bash
curl -X POST https://api.theta-observability.com/v1/events \
  -H "x-api-key: tk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "schema_version": "1.0",
    "name": "browser-session",
    "source": "openclaw",
    "kind": "browser_session",
    "platform": "desktop",
    "events": [
      {
        "type": "message",
        "step_id": "browser_step",
        "message": {
          "role": "user",
          "content": [{ "type": "text", "text": "buy me shoes from amazon" }]
        }
      }
    ]
  }'
```

**Response (202 Accepted):**

```json
{
  "trace_id": "tr_01HWabc123",
  "ingest_status": "accepted",
  "gcs_uri": "gs://theta-obs/orgs/org_abc/projects/proj_abc/traces/tr_01HWabc123.json",
  "normalized": true,
  "source": "canonical_event_envelope"
}
```

---

### POST /v1/imports/traces

Bulk import either Theta-native trace payloads or canonical event envelopes. Supports JSON arrays and NDJSON (`application/x-ndjson`).

**Auth:** API key

```bash
curl -X POST https://api.theta-observability.com/v1/imports/traces \
  -H "x-api-key: tk_live_..." \
  -H "Content-Type: application/json" \
  -d '[
    { "schema_version": "1.0", "trace_id": "tr_native", "name": "native", "status": "success", "started_at": "2026-04-15T12:00:00Z", "steps": [] },
    { "schema_version": "1.0", "name": "canonical", "events": [] }
  ]'
```

**Response (202 Accepted or 207 Multi-Status):**

```json
{
  "accepted": 2,
  "failed": 0,
  "items": [
    { "index": 0, "kind": "trace", "trace_id": "tr_native", "status": "accepted" },
    { "index": 1, "kind": "canonical_envelope", "trace_id": "tr_01HWbulk123", "status": "accepted" }
  ]
}
```

---

### GET /v1/traces

List traces with optional filters. Results are paginated via cursor.

**Auth:** API key or Bearer

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `project_id` | string | Filter by project (inferred from API key if omitted) |
| `status` | string | `success`, `error`, or `running` |
| `platform` | string | `web`, `mobile`, `desktop`, `server`, `robot`, `sim`, `cli`, `other` |
| `model` | string | Filter by model name |
| `user_id` | string | Filter by end-user ID |
| `run_id` | string | Filter by run ID |
| `run_type` | string | Filter by run type |
| `use_case` | string | Filter by use case |
| `group` | string | Filter by group |
| `tags` | string | Comma-separated tag filter |
| `meta_key` | string | Metadata key to filter by. Supports dot-paths like `workflow.stage` |
| `meta_value` | string | Metadata value paired with the preceding `meta_key` |
| `since` | datetime | Start of time range (ISO 8601) |
| `until` | datetime | End of time range (ISO 8601) |
| `limit` | integer | Max results per page (default: 50) |
| `cursor` | string | Pagination cursor from previous response |

To filter on trace metadata, send repeated `meta_key` / `meta_value` pairs in order. For example, `meta_key=workflow.stage&meta_value=checkout` matches traces whose metadata contains `{ "workflow": { "stage": "checkout" } }`.

```bash
curl "https://api.theta-observability.com/v1/traces?status=error&meta_key=workflow.stage&meta_value=checkout&limit=10" \
  -H "x-api-key: tk_live_..."
```

**Response (200 OK):**

```json
{
  "items": [
    {
      "trace_id": "tr_01HWabc123",
      "project_id": "proj_abc",
      "name": "checkout-agent",
      "status": "error",
      "platform": "web",
      "model": "gpt-4o",
      "user_id": "user_456",
      "metadata": {
        "workflow": { "stage": "checkout" }
      },
      "started_at": "2026-04-15T12:00:00Z",
      "latency_ms": 3500,
      "total_tokens": 1020,
      "cost_usd": 0.0034,
      "step_count": 3,
      "has_media": true,
      "tags": ["checkout", "v2"]
    }
  ],
  "next_cursor": "eyJpZCI6InRyXzAxSFci..."
}
```

---

### GET /v1/traces/:id

Get full trace detail including the raw trace JSON and all steps.

**Auth:** API key or Bearer

```bash
curl "https://api.theta-observability.com/v1/traces/tr_01HWabc123" \
  -H "x-api-key: tk_live_..."
```

**Response (200 OK):** The full [Trace payload](./trace-schema.md) as stored in GCS.

**Response (404 Not Found):**

```json
{
  "error": {
    "code": "not_found",
    "message": "Trace tr_01HWabc123 not found"
  }
}
```

---

### POST /v1/traces/:id/steps

Append steps to an existing trace. Accepts a JSON array of step objects or NDJSON (one step per line).

**Auth:** API key

```bash
curl -X POST "https://api.theta-observability.com/v1/traces/tr_01HWabc123/steps" \
  -H "x-api-key: tk_live_..." \
  -H "Content-Type: application/json" \
  -d '[
    {
      "step_id": "st_002",
      "type": "tool",
      "name": "browser.click",
      "status": "success",
      "started_at": "2026-04-15T12:00:01Z",
      "ended_at": "2026-04-15T12:00:02Z",
      "latency_ms": 500,
      "tool_calls": [
        {
          "id": "tc_001",
          "name": "browser.click",
          "arguments": { "selector": "#buy" },
          "result": { "ok": true }
        }
      ]
    }
  ]'
```

**Response (202 Accepted):**

```json
{
  "accepted": 1
}
```

---

### GET /v1/traces/:id/tail

Live tail of a trace via Server-Sent Events (SSE). Used by the dashboard onboarding flow to detect the first trace arrival.

**Auth:** API key, Bearer, or cookie

```bash
curl -N "https://api.theta-observability.com/v1/traces/tr_01HWabc123/tail" \
  -H "x-api-key: tk_live_..."
```

**Response:** `text/event-stream` with step events as they arrive.

---

## Media Endpoints

### POST /v1/media/upload

Upload a media file directly through the API proxy. The API streams the body to GCS and returns the resulting `gs://` URI. This is the primary upload path used by both SDKs.

**Auth:** API key

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `trace_id` | string | Associate the upload with a trace |
| `name` | string | Original filename |

**Headers:**

| Header | Value |
|--------|-------|
| `Content-Type` | The MIME type of the file (e.g. `image/png`, `audio/wav`) |

```bash
curl -X POST "https://api.theta-observability.com/v1/media/upload?trace_id=tr_01HWabc123&name=screenshot.png" \
  -H "x-api-key: tk_live_..." \
  -H "Content-Type: image/png" \
  --data-binary @screenshot.png
```

**Response (200 OK):**

```json
{
  "gs_uri": "gs://theta-obs/p/proj_abc/tr/tr_01HWabc123/att/att_01HW.png"
}
```

---

### POST /v1/media/signed-url

Request a V4 signed URL for direct-to-GCS upload. Alternative to the proxy upload endpoint for large files.

**Auth:** API key

**Request body:**

```json
{
  "content_type": "image/png",
  "size_bytes": 1048576,
  "filename": "screenshot.png"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content_type` | string | Yes | MIME type |
| `size_bytes` | integer | No | File size in bytes |
| `filename` | string | No | Original filename |

```bash
curl -X POST https://api.theta-observability.com/v1/media/signed-url \
  -H "x-api-key: tk_live_..." \
  -H "Content-Type: application/json" \
  -d '{ "content_type": "image/png", "filename": "screenshot.png" }'
```

**Response (200 OK):**

```json
{
  "url": "https://storage.googleapis.com/theta-obs/p/proj_abc/tr/.../att_01HW.png?X-Goog-Signature=...",
  "gs_uri": "gs://theta-obs/p/proj_abc/tr/.../att_01HW.png",
  "expires_at": "2026-04-15T13:00:00Z"
}
```

After receiving the signed URL, `PUT` the file bytes directly to it:

```bash
curl -X PUT "$SIGNED_URL" \
  -H "Content-Type: image/png" \
  --data-binary @screenshot.png
```

---

## Search

### POST /v1/search

Semantic search across trace content.

**Auth:** API key or Bearer

**Request body:**

```json
{
  "query": "password reset failure",
  "project_id": "proj_abc",
  "limit": 20
}
```

```bash
curl -X POST https://api.theta-observability.com/v1/search \
  -H "x-api-key: tk_live_..." \
  -H "Content-Type: application/json" \
  -d '{ "query": "password reset failure", "limit": 10 }'
```

**Response (200 OK):**

```json
{
  "results": [
    {
      "trace_id": "tr_01HWabc123",
      "name": "support-agent",
      "score": 0.92,
      "snippet": "User asked to reset password but received error...",
      "started_at": "2026-04-15T11:30:00Z"
    }
  ]
}
```

---

## Metrics Endpoints

### POST /v1/metrics

Create a metric definition.

**Auth:** Bearer

**Request body:**

```json
{
  "name": "task_adherence",
  "type": "automated",
  "evaluator_prompt": "Did the agent complete the task? Answer pass or fail."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique metric name |
| `type` | string | Yes | `"automated"`, `"human"`, `"hybrid"` |
| `evaluator_prompt` | string | No | LLM prompt for automated evaluation |

```bash
curl -X POST https://api.theta-observability.com/v1/metrics \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{ "name": "task_adherence", "type": "automated" }'
```

---

### GET /v1/metrics

List all metric definitions for the project.

**Auth:** Bearer

```bash
curl "https://api.theta-observability.com/v1/metrics" \
  -H "Authorization: Bearer eyJhbG..."
```

---

### POST /v1/metrics/:id/events

Record a metric event against a trace.

**Auth:** API key or Bearer

**Request body:**

```json
{
  "trace_id": "tr_01HWabc123",
  "value": {
    "passed": true,
    "score": 0.95,
    "label": "positive"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trace_id` | string | Yes | The trace to evaluate |
| `value` | object | Yes | Metric value (any combination of `passed`, `score`, `label`) |

```bash
curl -X POST "https://api.theta-observability.com/v1/metrics/task_adherence/events" \
  -H "x-api-key: tk_live_..." \
  -H "Content-Type: application/json" \
  -d '{ "trace_id": "tr_01HWabc123", "value": { "passed": true } }'
```

---

### GET /v1/metrics/:id/events

List recorded events for a metric.

**Auth:** Bearer

```bash
curl "https://api.theta-observability.com/v1/metrics/task_adherence/events" \
  -H "Authorization: Bearer eyJhbG..."
```

---

### GET /v1/traces/:id/metrics

Get all metric events recorded against a specific trace.

**Auth:** API key or Bearer

```bash
curl "https://api.theta-observability.com/v1/traces/tr_01HWabc123/metrics" \
  -H "x-api-key: tk_live_..."
```

---

## Incident Endpoints

### GET /v1/incidents

List detected incidents.

**Auth:** Bearer

```bash
curl "https://api.theta-observability.com/v1/incidents" \
  -H "Authorization: Bearer eyJhbG..."
```

---

### GET /v1/incidents/:id

Get incident detail.

**Auth:** Bearer

```bash
curl "https://api.theta-observability.com/v1/incidents/inc_01HW..." \
  -H "Authorization: Bearer eyJhbG..."
```

---

### PATCH /v1/incidents/:id

Update incident status (e.g. acknowledge, resolve).

**Auth:** Bearer

**Request body:**

```json
{
  "status": "resolved"
}
```

```bash
curl -X PATCH "https://api.theta-observability.com/v1/incidents/inc_01HW..." \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{ "status": "resolved" }'
```

---

### POST /v1/incidents/detect

Trigger incident detection manually.

**Auth:** Bearer

```bash
curl -X POST "https://api.theta-observability.com/v1/incidents/detect" \
  -H "Authorization: Bearer eyJhbG..."
```

---

## Cluster Endpoints

### GET /v1/clusters

List trace clusters.

**Auth:** Bearer

```bash
curl "https://api.theta-observability.com/v1/clusters" \
  -H "Authorization: Bearer eyJhbG..."
```

---

### GET /v1/clusters/:id

Get cluster detail including member traces.

**Auth:** Bearer

```bash
curl "https://api.theta-observability.com/v1/clusters/cl_01HW..." \
  -H "Authorization: Bearer eyJhbG..."
```

---

### POST /v1/clusters/discover

Trigger cluster discovery.

**Auth:** Bearer

```bash
curl -X POST "https://api.theta-observability.com/v1/clusters/discover" \
  -H "Authorization: Bearer eyJhbG..."
```

---

## Admin Endpoints

### PATCH /v1/admin/traces/bulk

Bulk update traces (e.g. change status, add tags).

**Auth:** Bearer (admin)

**Request body:**

```json
{
  "trace_ids": ["tr_01HWabc123", "tr_01HWdef456"],
  "update": {
    "tags": { "add": ["reviewed"] }
  }
}
```

```bash
curl -X PATCH "https://api.theta-observability.com/v1/admin/traces/bulk" \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{ "trace_ids": ["tr_01HWabc123"], "update": { "tags": { "add": ["reviewed"] } } }'
```

---

## Account & Organization Endpoints

### POST /v1/signup

Create a new user account and default organization.

**Auth:** None

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Jane Doe",
  "org_name": "Acme Corp"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Email address |
| `password` | string | Yes | Password |
| `name` | string | No | Display name |
| `org_name` | string | No | Organization name (defaults to user's name) |

```bash
curl -X POST https://api.theta-observability.com/v1/signup \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "securePassword123", "name": "Jane Doe" }'
```

**Response (201 Created):** Account and organization details.

**Response (409 Conflict):** Email already in use.

---

### GET /v1/orgs

List organizations for the authenticated user.

**Auth:** Bearer

```bash
curl "https://api.theta-observability.com/v1/orgs" \
  -H "Authorization: Bearer eyJhbG..."
```

---

### POST /v1/orgs

Create a new organization.

**Auth:** Bearer

**Request body:**

```json
{
  "name": "Acme Corp",
  "slug": "acme"
}
```

---

### GET /v1/orgs/:org_id/members

List members of an organization.

**Auth:** Bearer

```bash
curl "https://api.theta-observability.com/v1/orgs/org_abc/members" \
  -H "Authorization: Bearer eyJhbG..."
```

---

### POST /v1/invites

Invite a user to an organization.

**Auth:** Bearer

---

### POST /v1/invites/accept

Accept an organization invite.

**Auth:** Bearer

---

## Project & Key Endpoints

### GET /v1/projects

List projects in an organization.

**Auth:** Bearer

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `org_id` | string | Yes | Organization ID |

```bash
curl "https://api.theta-observability.com/v1/projects?org_id=org_abc" \
  -H "Authorization: Bearer eyJhbG..."
```

---

### POST /v1/projects

Create a new project.

**Auth:** Bearer

---

### GET /v1/projects/:id

Get project details.

**Auth:** Bearer

```bash
curl "https://api.theta-observability.com/v1/projects/proj_abc" \
  -H "Authorization: Bearer eyJhbG..."
```

---

### GET /v1/projects/:id/keys

List API keys for a project.

**Auth:** Bearer

```bash
curl "https://api.theta-observability.com/v1/projects/proj_abc/keys" \
  -H "Authorization: Bearer eyJhbG..."
```

**Response (200 OK):**

```json
[
  {
    "id": "key_01HW...",
    "project_id": "proj_abc",
    "name": "Production",
    "prefix": "tk_live_abc1",
    "created_at": "2026-04-01T00:00:00Z",
    "last_used_at": "2026-04-15T11:00:00Z"
  }
]
```

---

### POST /v1/projects/:id/keys

Create a new API key. The plaintext key is returned only once in the response.

**Auth:** Bearer

```bash
curl -X POST "https://api.theta-observability.com/v1/projects/proj_abc/keys" \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{ "name": "CI Pipeline" }'
```

---

### DELETE /v1/projects/:id/keys/:key_id

Revoke an API key. The key becomes immediately unusable.

**Auth:** Bearer

```bash
curl -X DELETE "https://api.theta-observability.com/v1/projects/proj_abc/keys/key_01HW..." \
  -H "Authorization: Bearer eyJhbG..."
```

---

## Usage & Billing

### GET /v1/usage

Get current-period usage for an organization.

**Auth:** Bearer

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `org_id` | string | Yes | Organization ID |

```bash
curl "https://api.theta-observability.com/v1/usage?org_id=org_abc" \
  -H "Authorization: Bearer eyJhbG..."
```

---

## Health Checks

### GET /healthz

Liveness probe. Returns `200 OK` if the server is running.

**Auth:** None

```bash
curl https://api.theta-observability.com/healthz
```

### GET /readyz

Readiness probe. Returns `200 OK` if the server can reach Postgres; `503` otherwise.

**Auth:** None

```bash
curl https://api.theta-observability.com/readyz
```

### GET /v1/openapi.json

Returns the OpenAPI 3.1 specification as JSON.

**Auth:** None

```bash
curl https://api.theta-observability.com/v1/openapi.json
```

---

*See also: [Python SDK](./python-sdk.md) | [Node.js SDK](./node-sdk.md) | [Trace Schema](./trace-schema.md)*
