import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function SelfHostingPage() {
  return (
    <>
      <h1>Self-Hosting</h1>
      <p>
        Theta Observability can be fully self-hosted. This guide covers local
        development with Docker Compose, environment configuration, database
        migrations, and production deployment.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li><strong>Docker</strong> and Docker Compose v2+</li>
        <li><strong>Go 1.23+</strong> (for building the API from source)</li>
        <li><strong>Node.js 20+</strong> (for building the dashboard from source)</li>
        <li><strong>Python 3.10+</strong> (for the Python SDK, optional)</li>
      </ul>

      <h2>Quick Start</h2>
      <p>
        The fastest way to get a full local stack running is with the dev
        compose file. This starts Postgres (with pgvector), a GCS emulator,
        a BigQuery emulator, the Go API, and the Next.js dashboard:
      </p>
      <CodeBlock lang="bash" title="Start all services">
        {`git clone https://github.com/theta-rl-labs/observability.git
cd observability
docker compose -f docker-compose.dev.yml up`}
      </CodeBlock>
      <p>
        Once healthy, the services are available at:
      </p>
      <ul>
        <li><strong>API</strong>: <code>http://localhost:8080</code></li>
        <li><strong>Dashboard</strong>: <code>http://localhost:3100</code></li>
        <li><strong>Postgres</strong>: <code>localhost:5432</code> (user: theta, password: theta, db: theta_obs)</li>
        <li><strong>Fake GCS</strong>: <code>http://localhost:4443</code></li>
        <li><strong>BigQuery emulator</strong>: <code>http://localhost:9050</code></li>
      </ul>

      <h2>Services Breakdown</h2>

      <h3>postgres (pgvector/pgvector:pg16)</h3>
      <p>
        The control-plane database storing organizations, projects, API keys,
        users, sessions, and usage events. Uses the pgvector extension for
        future embedding search. Data is persisted in a Docker volume.
      </p>

      <h3>fake-gcs (fsouza/fake-gcs-server)</h3>
      <p>
        A local emulator for Google Cloud Storage. The API stores raw trace
        JSON and media blobs (images, audio, video, sensor data) here. The
        bucket <code>theta-obs-dev</code> is automatically seeded on startup.
      </p>

      <h3>bq-emulator (bigquery-emulator)</h3>
      <p>
        A local BigQuery emulator. The API streams a denormalized copy of
        each trace into BigQuery for fast analytical queries, filtering, and
        search.
      </p>

      <h3>migrate (goose)</h3>
      <p>
        A one-shot container that runs{" "}
        <Link href="https://github.com/pressly/goose">goose</Link> migrations
        against Postgres. It applies all SQL files in{" "}
        <code>schema/postgres/</code> and exits. The API container waits for
        this to complete before starting.
      </p>

      <h3>api (Go)</h3>
      <p>
        The Go ingest and query API. Handles trace ingestion, media uploads,
        search, and admin operations. Built from <code>./api-go</code>.
      </p>

      <h3>dashboard (Next.js)</h3>
      <p>
        The Next.js dashboard for viewing traces, managing projects, and
        configuring API keys. Built from <code>./dashboard</code>.
      </p>

      <h2>Environment Variables</h2>
      <p>
        Copy <code>.env.example</code> to <code>.env</code> and configure for
        your environment. The table below documents every variable:
      </p>

      <h3>API Server</h3>
      <ParamTable
        params={[
          { name: "PORT", type: "string", description: "HTTP port for the API server.", default: "8080" },
          { name: "ENV", type: "string", description: "Environment name. \"dev\" enables development mode. Use \"production\" in prod.", default: "dev" },
          { name: "LOG_LEVEL", type: "string", description: "Log verbosity level.", default: "info" },
          { name: "ALLOWED_ORIGINS", type: "string", description: "Comma-separated list of allowed CORS origins.", default: "http://localhost:3000" },
        ]}
      />

      <h3>Database</h3>
      <ParamTable
        params={[
          { name: "DB_URL", type: "string", required: true, description: "Postgres connection string. Example: postgres://theta:theta@localhost:5432/theta_obs?sslmode=disable" },
        ]}
      />

      <h3>Object Storage (GCS)</h3>
      <ParamTable
        params={[
          { name: "GCS_ENDPOINT", type: "string", description: "GCS API endpoint. Set for local dev (fake-gcs-server). Leave unset in production to use Google's default endpoint." },
          { name: "GCS_PUBLIC_HOST", type: "string", description: "Public URL prefix for GCS objects. Used to construct signed/public URLs returned to clients." },
          { name: "GCS_BUCKET", type: "string", description: "GCS bucket name for trace JSON and media blobs.", default: "theta-obs-dev" },
          { name: "STORAGE_EMULATOR_HOST", type: "string", description: "Consumed by the google-cloud-storage Go client to route requests to the emulator. Set to \"localhost:4443\" for local dev." },
          { name: "GOOGLE_APPLICATION_CREDENTIALS", type: "string", description: "Path to a GCP service account JSON file. Required in production for signed URLs and bucket access." },
        ]}
      />

      <h3>BigQuery</h3>
      <ParamTable
        params={[
          { name: "BQ_PROJECT", type: "string", description: "GCP project ID for BigQuery.", default: "theta-obs-dev" },
          { name: "BQ_DATASET", type: "string", description: "BigQuery dataset name.", default: "theta_observability" },
          { name: "BQ_ENDPOINT", type: "string", description: "Custom BigQuery endpoint. Only used with the emulator." },
          { name: "BIGQUERY_EMULATOR_HOST", type: "string", description: "Consumed by the BigQuery Go client to route requests to the emulator. Set to \"localhost:9050\" for local dev." },
        ]}
      />

      <h3>Authentication</h3>
      <ParamTable
        params={[
          { name: "JWT_SECRET", type: "string", required: true, description: "Shared HS256 secret for signing and verifying dashboard JWTs. Must match between the API and the dashboard." },
          { name: "JWT_JWKS_URL", type: "string", description: "JWKS endpoint URL for JWT verification. In production, prefer JWKS over a shared secret for key rotation support." },
          { name: "NEXTAUTH_URL", type: "string", description: "Canonical URL of the dashboard for NextAuth callbacks.", default: "http://localhost:3100" },
          { name: "NEXTAUTH_SECRET", type: "string", required: true, description: "Secret used by NextAuth to encrypt session cookies. Must be a long random string in production." },
        ]}
      />

      <h3>OAuth Providers</h3>
      <ParamTable
        params={[
          { name: "GOOGLE_OAUTH_CLIENT_ID", type: "string", description: "Google OAuth client ID for NextAuth sign-in." },
          { name: "GOOGLE_OAUTH_CLIENT_SECRET", type: "string", description: "Google OAuth client secret." },
        ]}
      />

      <h3>Dashboard</h3>
      <ParamTable
        params={[
          { name: "NEXT_PUBLIC_API_URL", type: "string", description: "Public URL of the Go API, used by the browser.", default: "http://localhost:8080" },
          { name: "API_URL_INTERNAL", type: "string", description: "Internal URL of the Go API, used for server-side requests (e.g. within Docker network).", default: "http://localhost:8080" },
          { name: "DATABASE_URL", type: "string", description: "Postgres connection string used by the dashboard for NextAuth session storage." },
        ]}
      />

      <h3>Third-Party Services</h3>
      <ParamTable
        params={[
          { name: "ANTHROPIC_API_KEY", type: "string", description: "Anthropic API key for AI-powered features (trace analysis, search)." },
          { name: "RESEND_API_KEY", type: "string", description: "Resend API key for transactional emails (invites, alerts)." },
          { name: "RESEND_FROM_EMAIL", type: "string", description: "Sender email address for transactional emails.", default: "no-reply@theta.observability" },
          { name: "STRIPE_SECRET_KEY", type: "string", description: "Stripe secret key for billing." },
          { name: "STRIPE_PUBLISHABLE_KEY", type: "string", description: "Stripe publishable key for client-side billing." },
          { name: "STRIPE_WEBHOOK_SECRET", type: "string", description: "Stripe webhook signing secret." },
        ]}
      />

      <h2>Database Migrations</h2>
      <p>
        Migrations live in <code>schema/postgres/</code> and are managed by{" "}
        <Link href="https://github.com/pressly/goose">goose</Link>. The Docker
        Compose stack runs them automatically. To run manually:
      </p>
      <CodeBlock lang="bash" title="Run migrations with goose">
        {`# Install goose
go install github.com/pressly/goose/v3/cmd/goose@latest

# Apply all pending migrations
GOOSE_DRIVER=postgres \\
GOOSE_DBSTRING="postgres://theta:theta@localhost:5432/theta_obs?sslmode=disable" \\
goose -dir schema/postgres up`}
      </CodeBlock>
      <CodeBlock lang="bash" title="Or apply with psql directly">
        {`psql "postgres://theta:theta@localhost:5432/theta_obs" \\
  -f schema/postgres/001_init.sql`}
      </CodeBlock>

      <h2>Creating Your First Org, Project, and API Key</h2>
      <p>
        After the stack is running and migrations have applied, bootstrap your
        first organization, project, and API key:
      </p>
      <CodeBlock lang="bash" title="1. Create a user and org">
        {`# Sign up through the dashboard at http://localhost:3100
# or insert directly into Postgres:
psql "postgres://theta:theta@localhost:5432/theta_obs" -c "
  INSERT INTO users (id, email, name)
  VALUES ('usr_admin01', 'admin@example.com', 'Admin');

  INSERT INTO orgs (id, name, slug, created_by)
  VALUES ('org_first', 'My Org', 'my-org', 'usr_admin01');

  INSERT INTO org_members (org_id, user_id, role)
  VALUES ('org_first', 'usr_admin01', 'owner');
"`}
      </CodeBlock>
      <CodeBlock lang="bash" title="2. Create a project">
        {`psql "postgres://theta:theta@localhost:5432/theta_obs" -c "
  INSERT INTO projects (id, org_id, name, slug, created_by)
  VALUES ('proj_first', 'org_first', 'My Project', 'my-project', 'usr_admin01');
"`}
      </CodeBlock>
      <CodeBlock lang="bash" title="3. Create an API key via the API">
        {`# Use the dashboard JWT or create a key directly.
# Via the admin API (requires a dashboard JWT):
curl -X POST http://localhost:8080/v1/projects/proj_first/keys \\
  -H "Authorization: Bearer <your-dashboard-jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "dev-key", "scopes": ["traces:write", "traces:read"]}'

# The response includes the full key (only shown once):
# { "key": "tobs_live_abc123...", "prefix": "tobs_live_abc1", ... }`}
      </CodeBlock>
      <CodeBlock lang="bash" title="4. Send your first trace">
        {`curl -X POST http://localhost:8080/v1/traces \\
  -H "x-api-key: tobs_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "schema_version": "1.0",
    "trace_id": "tr_test001",
    "project_id": "proj_first",
    "name": "hello-world",
    "started_at": "2025-01-15T10:00:00Z",
    "steps": [{
      "step_id": "st_001",
      "type": "llm",
      "name": "greet",
      "status": "success",
      "messages": [
        {"role": "user", "content": "Hello!"},
        {"role": "assistant", "content": "Hello! How can I help you?"}
      ]
    }]
  }'`}
      </CodeBlock>

      <h2>Production Deployment</h2>
      <p>
        For production, replace the Docker Compose emulators with managed
        cloud services:
      </p>

      <h3>Recommended Architecture</h3>
      <ul>
        <li>
          <strong>API</strong>: Deploy to Google Cloud Run (or any container
          platform). Set <code>ENV=production</code>. The API is stateless and
          scales horizontally.
        </li>
        <li>
          <strong>Dashboard</strong>: Deploy to Vercel (or any Node.js host).
          Set <code>NEXT_PUBLIC_API_URL</code> to your API&apos;s public URL and{" "}
          <code>API_URL_INTERNAL</code> to its internal/VPC URL.
        </li>
        <li>
          <strong>Database</strong>: Use Cloud SQL for PostgreSQL (or any
          managed Postgres with the pgvector extension). Set{" "}
          <code>DB_URL</code> with SSL mode enabled.
        </li>
        <li>
          <strong>Object Storage</strong>: Use a real GCS bucket. Leave{" "}
          <code>GCS_ENDPOINT</code> unset so the client uses Google&apos;s default
          endpoint. Set <code>GOOGLE_APPLICATION_CREDENTIALS</code> to a
          service account with Storage Object Admin permissions.
        </li>
        <li>
          <strong>BigQuery</strong>: Use a real BigQuery dataset. Leave{" "}
          <code>BIGQUERY_EMULATOR_HOST</code> unset. Set{" "}
          <code>BQ_PROJECT</code> and <code>BQ_DATASET</code> to your GCP
          project and dataset.
        </li>
      </ul>

      <Callout type="warning" title="Secrets in production">
        <p>
          Never use the default dev secrets in production. Generate strong random
          values for <code>JWT_SECRET</code>, <code>NEXTAUTH_SECRET</code>, and
          all API keys. Use a secrets manager (e.g. Google Secret Manager, AWS
          Secrets Manager) to inject them as environment variables.
        </p>
      </Callout>

      <h3>Production Environment Checklist</h3>
      <CodeBlock lang="bash" title=".env.production (example)">
        {`ENV=production
PORT=8080
DB_URL=postgres://theta:STRONG_PASSWORD@/theta_obs?host=/cloudsql/project:region:instance&sslmode=require

# Real GCS — no endpoint override
GCS_BUCKET=my-org-theta-observability
GOOGLE_APPLICATION_CREDENTIALS=/secrets/gcs-sa.json

# Real BigQuery — no emulator
BQ_PROJECT=my-gcp-project
BQ_DATASET=theta_observability

# Auth
JWT_SECRET=<64-char-random-string>
JWT_JWKS_URL=https://dashboard.example.com/api/auth/jwks
NEXTAUTH_URL=https://dashboard.example.com
NEXTAUTH_SECRET=<64-char-random-string>

# OAuth
GOOGLE_OAUTH_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...

# Optional services
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_live_...`}
      </CodeBlock>

      <h2>Health Checks</h2>
      <p>
        The Go API exposes two health check endpoints for load balancers and
        orchestrators:
      </p>
      <ParamTable
        params={[
          { name: "GET /healthz", type: "endpoint", description: "Liveness probe. Returns 200 if the process is running. Does not check dependencies." },
          { name: "GET /readyz", type: "endpoint", description: "Readiness probe. Returns 200 only when the API can reach Postgres, GCS, and BigQuery. Use this for load balancer health checks." },
        ]}
      />
      <CodeBlock lang="bash" title="Check health">
        {`# Liveness
curl http://localhost:8080/healthz
# {"status":"ok"}

# Readiness
curl http://localhost:8080/readyz
# {"status":"ready","postgres":"ok","gcs":"ok","bigquery":"ok"}`}
      </CodeBlock>

      <Callout type="tip">
        <p>
          On Cloud Run, set the startup probe to <code>/healthz</code> and the
          liveness probe to <code>/readyz</code> with a 5-second interval. This
          ensures traffic is only routed to instances that have established all
          backend connections.
        </p>
      </Callout>
    </>
  );
}
