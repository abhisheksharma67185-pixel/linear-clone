# theta-observability — Go ingest API

Multi-tenant observability ingest service. Accepts trace JSON, stores raw payloads in GCS, indexes summary rows in BigQuery via the Storage Write API, and maintains the control plane in Postgres.

## Quick start

```bash
go mod tidy
go build ./...

export DB_URL=postgres://obs:obs@localhost:5432/obs?sslmode=disable
export GCS_ENDPOINT=http://localhost:4443
export GCS_BUCKET=theta-obs-dev
export BQ_PROJECT=local
export BQ_DATASET=theta_observability
export BQ_ENDPOINT=http://localhost:9050
export JWT_SECRET=dev-secret
export ALLOWED_ORIGINS=http://localhost:3000
go run ./cmd/server
```

## Endpoints

See `openapi/openapi.yaml` or `GET /v1/openapi.json`.

## Layout

See `internal/` — handlers are real; BQ writer buffers `100 rows | 500ms`; ingest pipeline is synchronous GCS upload + async BQ append.

## Follow-ups

- `go mod tidy` to populate `go.sum`.
- Add goose migrations under `migrations/`.
- Wire sqlc code generation (stub at `sqlc.yaml`).
- Replace Stripe webhook stub with full signature verification.
