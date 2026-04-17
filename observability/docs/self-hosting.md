# Self-Hosting Guide

Deploy Theta Observability on your own infrastructure.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Docker Compose (Development)](#docker-compose-development)
- [Environment Variables Reference](#environment-variables-reference)
- [Database Setup](#database-setup)
- [GCS Bucket Setup](#gcs-bucket-setup)
- [BigQuery Dataset Setup](#bigquery-dataset-setup)
- [Production Deployment](#production-deployment)
- [Monitoring](#monitoring)

---

## Prerequisites

### Development

- Docker 24+ and Docker Compose v2
- 4 GB RAM minimum (BigQuery emulator is memory-intensive)
- GNU Make (optional, for convenience targets)

### Production

- Go 1.22+ (to build the API from source, or use the Docker image)
- Node.js 18+ (to build the dashboard from source, or use the Docker image)
- PostgreSQL 16+ (with pgvector extension recommended)
- Google Cloud Storage bucket
- BigQuery dataset
- A domain and TLS termination (nginx, Caddy, Cloud Load Balancer, etc.)

---

## Architecture Overview

```
                                +------------------+
                                |   Dashboard      |
                                |   (Next.js)      |
                                |   :3100          |
                                +--------+---------+
                                         |
                                         v
+-----------+    HTTPS    +------------------+     +------------------+
|  SDKs     | ---------> |   Go API         | --> |  GCS             |
|  (Python, |            |   :8080          |     |  (trace JSON +   |
|   Node)   |            |                  |     |   media blobs)   |
+-----------+            |                  |     +------------------+
                         |                  |
                         |                  | --> +------------------+
                         |                  |     |  BigQuery        |
                         |                  |     |  (search index)  |
                         +--------+---------+     +------------------+
                                  |
                                  v
                         +------------------+
                         |  PostgreSQL      |
                         |  (control plane) |
                         +------------------+
```

---

## Docker Compose (Development)

The `docker-compose.dev.yml` file starts the entire stack locally.

```bash
docker compose -f docker-compose.dev.yml up
```

### Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | `pgvector/pgvector:pg16` | 5432 | Control plane database |
| `fake-gcs` | `fsouza/fake-gcs-server` | 4443 | GCS emulator |
| `bq-emulator` | `ghcr.io/goccy/bigquery-emulator` | 9050 | BigQuery emulator |
| `migrate` | `ghcr.io/pressly/goose` | -- | One-shot migration runner |
| `api` | Built from `./api-go` | 8080 | Go ingest + control plane API |
| `dashboard` | Built from `./dashboard` | 3100 | Next.js dashboard |

### Startup order

1. `postgres`, `fake-gcs`, `bq-emulator` start in parallel
2. `migrate` waits for `postgres` to be healthy, then runs goose migrations
3. `api` waits for all dependencies + successful migration
4. `dashboard` waits for `api`

### Volumes

| Volume | Purpose |
|--------|---------|
| `postgres-data` | Persistent Postgres data |
| `gcs-data` | Persistent fake-GCS storage |

### Seeding

After the stack is running, seed a demo organization:

```bash
make obs-seed
```

This creates an organization, project, and API key. The key is printed to stdout.

---

## Environment Variables Reference

### API Server

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `8080` | HTTP listen port |
| `ENV` | No | `dev` | Environment name (`dev`, `staging`, `production`) |
| `LOG_LEVEL` | No | `info` | Log level (`debug`, `info`, `warn`, `error`) |
| `DB_URL` | Yes | -- | PostgreSQL connection string |
| `GCS_BUCKET` | Yes | -- | GCS bucket name for trace JSON and media |
| `GCS_ENDPOINT` | No | Google default | GCS API endpoint (set for fake-gcs) |
| `GCS_PUBLIC_HOST` | No | Google default | Public hostname for GCS URLs |
| `STORAGE_EMULATOR_HOST` | No | -- | GCS emulator host (consumed by google-cloud-storage SDK) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Prod | -- | Path to service account JSON |
| `BQ_PROJECT` | Yes | -- | BigQuery project ID |
| `BQ_DATASET` | Yes | -- | BigQuery dataset name |
| `BIGQUERY_EMULATOR_HOST` | No | -- | BigQuery emulator host (unset in production) |
| `JWT_SECRET` | Yes | -- | Shared secret for JWT verification |
| `JWT_JWKS_URL` | No | -- | JWKS endpoint for JWT verification (preferred over shared secret in production) |
| `STRIPE_SECRET_KEY` | No | -- | Stripe secret key for billing |
| `STRIPE_WEBHOOK_SECRET` | No | -- | Stripe webhook signature secret |
| `STRIPE_PRICE_TRACES_INGESTED` | No | -- | Stripe price ID for trace ingestion metering |
| `STRIPE_PRICE_MEDIA_STORAGE_GB` | No | -- | Stripe price ID for media storage metering |

### Dashboard (Next.js)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3100` | HTTP listen port |
| `NODE_ENV` | No | `development` | Node environment |
| `NEXT_PUBLIC_API_URL` | Yes | -- | Public URL of the Go API (client-side fetches) |
| `API_URL_INTERNAL` | No | Same as `NEXT_PUBLIC_API_URL` | Internal URL of the Go API (server-side fetches) |
| `DATABASE_URL` | Yes | -- | PostgreSQL connection string (same DB as Go API) |
| `NEXTAUTH_URL` | Yes | -- | Canonical URL of the dashboard |
| `NEXTAUTH_SECRET` | Yes | -- | NextAuth session encryption secret |
| `JWT_SECRET` | Yes | -- | Shared secret for minting API JWTs (must match Go API) |
| `GOOGLE_OAUTH_CLIENT_ID` | No | -- | Google OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | No | -- | Google OAuth client secret |
| `RESEND_API_KEY` | No | -- | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | No | `no-reply@theta.observability` | Sender email address |

### SDK Configuration

These are set in the environment where your application runs:

| Variable | Description |
|----------|-------------|
| `THETA_API_KEY` | API key for SDK authentication |
| `THETA_PROJECT` | Project ID |
| `THETA_BASE_URL` | API base URL (default: production) |

---

## Database Setup

### PostgreSQL

Theta requires PostgreSQL 16+ with the `pgvector` extension (used for embedding-based search).

#### Create the database

```sql
CREATE DATABASE theta_obs;
CREATE USER theta WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE theta_obs TO theta;
```

#### Run migrations

Migrations are managed with [goose](https://github.com/pressly/goose) and live in `schema/postgres/`.

```bash
# Using the goose CLI
export GOOSE_DRIVER=postgres
export GOOSE_DBSTRING="host=localhost port=5432 user=theta password=... dbname=theta_obs sslmode=require"
export GOOSE_MIGRATION_DIR=./schema/postgres
goose up
```

Or use the Docker image:

```bash
docker run --rm \
  -e GOOSE_DRIVER=postgres \
  -e GOOSE_DBSTRING="host=db.example.com port=5432 user=theta password=... dbname=theta_obs sslmode=require" \
  -e GOOSE_MIGRATION_DIR=/migrations \
  -v $(pwd)/schema/postgres:/migrations:ro \
  ghcr.io/pressly/goose:latest up
```

---

## GCS Bucket Setup

### Create the bucket

```bash
gsutil mb -p YOUR_PROJECT -l us-central1 gs://your-theta-obs-bucket
```

### Configure CORS (for signed URL uploads)

```bash
cat > cors.json << 'EOF'
[
  {
    "origin": ["https://your-dashboard.example.com"],
    "method": ["PUT", "GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set cors.json gs://your-theta-obs-bucket
```

### Service account

Create a service account with `Storage Object Admin` on the bucket:

```bash
gcloud iam service-accounts create theta-obs-api
gsutil iam ch serviceAccount:theta-obs-api@YOUR_PROJECT.iam.gserviceaccount.com:objectAdmin gs://your-theta-obs-bucket
gcloud iam service-accounts keys create key.json --iam-account=theta-obs-api@YOUR_PROJECT.iam.gserviceaccount.com
```

Set `GOOGLE_APPLICATION_CREDENTIALS=./key.json` on the API server.

### Storage layout

The API writes files to:

```
gs://bucket/p/{project_id}/tr/{trace_id}/trace.json       # Trace payload
gs://bucket/p/{project_id}/tr/{trace_id}/att/{id}.{ext}    # Media attachments
```

---

## BigQuery Dataset Setup

### Create the dataset

```bash
bq --location=us mk --dataset YOUR_PROJECT:theta_observability
```

### Create tables

The table schemas are in `schema/bigquery/`. Apply them with:

```bash
bq mk --table YOUR_PROJECT:theta_observability.traces schema/bigquery/traces.json
bq mk --table YOUR_PROJECT:theta_observability.steps schema/bigquery/steps.json
```

Tables are partitioned by `ingest_date` and clustered on `(project_id, status)` for query performance.

### Production vs. emulator

| Feature | Production | Emulator |
|---------|-----------|----------|
| Write API | Storage Write API (fast, streaming) | Legacy `tabledata.insertAll` |
| Partitioning | Enforced | Metadata-only |
| IAM | Required | Disabled |
| JSON columns | Native | String round-trip |

The Go API auto-detects `BIGQUERY_EMULATOR_HOST` and falls back to legacy inserts when set.

---

## Production Deployment

### Cloud Run

The API and dashboard can be deployed as Cloud Run services.

#### API

```bash
# Build and push
docker build -t gcr.io/YOUR_PROJECT/theta-obs-api ./api-go
docker push gcr.io/YOUR_PROJECT/theta-obs-api

# Deploy
gcloud run deploy theta-obs-api \
  --image gcr.io/YOUR_PROJECT/theta-obs-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars "DB_URL=...,GCS_BUCKET=...,BQ_PROJECT=...,BQ_DATASET=..." \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1
```

#### Dashboard

```bash
docker build -t gcr.io/YOUR_PROJECT/theta-obs-dashboard ./dashboard
docker push gcr.io/YOUR_PROJECT/theta-obs-dashboard

gcloud run deploy theta-obs-dashboard \
  --image gcr.io/YOUR_PROJECT/theta-obs-dashboard \
  --platform managed \
  --region us-central1 \
  --set-env-vars "NEXT_PUBLIC_API_URL=https://api.your-domain.com,DATABASE_URL=..." \
  --allow-unauthenticated
```

### Kubernetes

A minimal Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: theta-obs-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: theta-obs-api
  template:
    metadata:
      labels:
        app: theta-obs-api
    spec:
      containers:
        - name: api
          image: gcr.io/YOUR_PROJECT/theta-obs-api:latest
          ports:
            - containerPort: 8080
          env:
            - name: PORT
              value: "8080"
            - name: DB_URL
              valueFrom:
                secretKeyRef:
                  name: theta-obs-secrets
                  key: db-url
            - name: GCS_BUCKET
              value: your-theta-obs-bucket
            - name: BQ_PROJECT
              value: your-gcp-project
            - name: BQ_DATASET
              value: theta_observability
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: theta-obs-secrets
                  key: jwt-secret
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /readyz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: theta-obs-api
spec:
  selector:
    app: theta-obs-api
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
```

### Production checklist

- [ ] PostgreSQL with SSL (`sslmode=require` in `DB_URL`)
- [ ] Strong, unique values for `JWT_SECRET` and `NEXTAUTH_SECRET`
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account with GCS and BigQuery permissions
- [ ] CORS configured on the GCS bucket for the dashboard domain
- [ ] TLS termination in front of the API and dashboard
- [ ] `ENV=production` set on the API server
- [ ] `BIGQUERY_EMULATOR_HOST` **not set** (so the API uses the real Storage Write API)
- [ ] `GCS_ENDPOINT` and `STORAGE_EMULATOR_HOST` **not set** (so the API uses real GCS)
- [ ] Horizontal scaling: the API is stateless and can scale to many replicas
- [ ] Consider Cloud SQL with read replicas for high-traffic dashboards

---

## Monitoring

### Health endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /healthz` | Liveness probe (always 200 if running) |
| `GET /readyz` | Readiness probe (200 if Postgres is reachable) |

### Key metrics to monitor

- API request latency (p50, p95, p99)
- Trace ingestion rate (traces/second)
- GCS upload latency and error rate
- BigQuery insert latency
- Postgres connection pool utilization
- Batch sender queue depth (SDK-side)

### Logging

Set `LOG_LEVEL=info` for production. The API emits structured JSON logs.

For SDK-side debugging:

**Python:**
```python
import logging
logging.getLogger("theta_observability").setLevel(logging.DEBUG)
```

**Node.js:**
```typescript
const client = new TraceClient({ debug: true });
```

---

*See also: [REST API Reference](./api-reference.md) | [Trace Schema](./trace-schema.md) | [Python SDK](./python-sdk.md) | [Node.js SDK](./node-sdk.md)*
