import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function AuthPage() {
  return (
    <>
      <h1>Authentication</h1>
      <p>
        Theta uses two authentication mechanisms: API keys for SDK and API
        traffic, and JWTs for dashboard sessions. Both are scoped to the
        multi-tenant org/project hierarchy.
      </p>

      <h2>Multi-Tenant Model</h2>
      <p>
        Theta is organized into a three-level hierarchy. All data isolation and
        access control flows through this structure:
      </p>
      <ul>
        <li>
          <strong>Organizations</strong> are the top-level billing and team
          boundary. Each org has a unique slug and a plan (free, pro, team,
          enterprise).
        </li>
        <li>
          <strong>Projects</strong> belong to an organization. Each project has
          its own traces, API keys, and retention settings.
        </li>
        <li>
          <strong>API keys</strong> are scoped to a single project. A key can
          only read/write traces within its project.
        </li>
      </ul>

      <h3>Roles</h3>
      <p>
        Organization members are assigned one of four roles, enforced in the{" "}
        <code>org_members</code> table:
      </p>

      <ParamTable
        params={[
          { name: "owner", type: "role", description: "Full control. Can delete the org, manage billing, transfer ownership, and manage all members." },
          { name: "admin", type: "role", description: "Can manage projects, API keys, members (except owners), and view all data." },
          { name: "member", type: "role", description: "Can create traces, view project data, and manage their own API keys." },
          { name: "viewer", type: "role", description: "Read-only access to traces and dashboards. Cannot create keys or modify data." },
        ]}
      />

      <h2>API Keys</h2>
      <p>
        API keys are the primary authentication method for the SDKs and the
        REST API. They are scoped to a single project and carry a set of
        permission scopes.
      </p>

      <h3>Key Format</h3>
      <p>
        Theta recognizes the following key prefixes:
      </p>
      <ul>
        <li>
          <code>tk_</code> -- legacy prefix, still supported.
        </li>
        <li>
          <code>tobs_live_</code> -- production API key.
        </li>
        <li>
          <code>tobs_test_</code> -- test/development API key.
        </li>
      </ul>
      <p>
        All keys must be at least 16 characters long. The prefix is stored as
        the visible portion in the database; the full secret is never stored.
      </p>

      <h3>Key Scopes</h3>
      <p>
        Each key has an array of scopes that control what operations it can
        perform. Default scopes are <code>traces:write</code> and{" "}
        <code>traces:read</code>.
      </p>

      <h3>Creating API Keys</h3>
      <p>
        Keys can be created through the dashboard UI or the admin API:
      </p>
      <CodeBlock lang="bash" title="Create via API">
        {`curl -X POST https://api.theta-observability.com/v1/projects/proj_abc123/keys \\
  -H "Authorization: Bearer <dashboard-jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "production-ingest",
    "scopes": ["traces:write", "traces:read"]
  }'`}
      </CodeBlock>

      <Callout type="warning" title="Save your key">
        <p>
          The full API key is only returned once at creation time. After that,
          only the prefix is visible. If you lose the key, you must revoke it
          and create a new one.
        </p>
      </Callout>

      <h3>Using API Keys</h3>
      <p>
        Pass the API key in either the <code>x-api-key</code> header or the{" "}
        <code>Authorization: Bearer</code> header:
      </p>
      <CodeBlock lang="bash" title="x-api-key header">
        {`curl https://api.theta-observability.com/v1/traces \\
  -H "x-api-key: tobs_live_abc123..."
`}
      </CodeBlock>
      <CodeBlock lang="bash" title="Authorization header">
        {`curl https://api.theta-observability.com/v1/traces \\
  -H "Authorization: Bearer tobs_live_abc123..."
`}
      </CodeBlock>

      <h3>Key Security</h3>
      <p>
        API key authentication uses a two-step process for both speed and
        security:
      </p>
      <ol>
        <li>
          <strong>SHA-256 fingerprint</strong> -- the API hashes the incoming
          key with SHA-256 and uses the fingerprint for a fast index lookup in
          the <code>api_keys</code> table.
        </li>
        <li>
          <strong>argon2id verification</strong> -- once the candidate row is
          found, the full key is verified against the stored{" "}
          <code>key_hash</code> (argon2id). This prevents timing attacks and
          ensures the raw key is never stored.
        </li>
      </ol>

      <Callout type="info" title="Key revocation">
        <p>
          Revoked keys have a non-null <code>revoked_at</code> timestamp. The
          API checks this before proceeding with verification, so revocation
          takes effect immediately.
        </p>
      </Callout>

      <h2>Dashboard JWT</h2>
      <p>
        The Next.js dashboard authenticates users via NextAuth v5 (Google OAuth
        or email/password). When the dashboard makes requests to the Go API, it
        includes a short-lived HS256 JWT.
      </p>

      <h3>How it works</h3>
      <ol>
        <li>
          The user signs in via NextAuth on the dashboard (Google OAuth or
          credentials).
        </li>
        <li>
          NextAuth mints an HS256 JWT containing the user ID, email, and org
          memberships. The signing secret is the shared{" "}
          <code>JWT_SECRET</code> environment variable.
        </li>
        <li>
          The dashboard sends this JWT in the <code>Authorization: Bearer</code>{" "}
          header on every request to the Go API.
        </li>
        <li>
          The Go API verifies the JWT signature using the same{" "}
          <code>JWT_SECRET</code> (or validates against a JWKS endpoint if{" "}
          <code>JWT_JWKS_URL</code> is configured).
        </li>
      </ol>

      <h3>JWT Claims</h3>
      <ParamTable
        params={[
          { name: "sub / user_id", type: "string", description: "The authenticated user's ID (e.g. usr_...)." },
          { name: "email", type: "string", description: "The user's email address." },
          { name: "orgs", type: "string[]", description: "Array of org IDs the user belongs to." },
        ]}
      />

      <h3>Dual-Auth Endpoints</h3>
      <p>
        Some read endpoints (e.g. fetching traces, searching) accept either an
        API key or a dashboard JWT. The Go API{" "}
        <code>EitherAuthMiddleware</code> tries API key authentication first
        (if the token has a <code>tk_</code> or <code>tobs_</code> prefix or
        does not contain a dot), then falls back to JWT parsing.
      </p>

      <CodeBlock lang="go" title="Auth resolution order">
        {`// 1. Extract token from Authorization: Bearer or x-api-key header
// 2. If token has tk_ or tobs_ prefix, or has no dots → try API key auth
// 3. If token contains dots → try JWT verification
// 4. Attach APIKeyContext or UserContext to the request context`}
      </CodeBlock>

      <Callout type="tip">
        <p>
          In production, set <code>JWT_JWKS_URL</code> to the dashboard's JWKS
          endpoint (e.g.{" "}
          <code>https://dashboard.example.com/api/auth/jwks</code>) instead of
          relying on a shared <code>JWT_SECRET</code>. This enables key
          rotation without redeploying the API.
        </p>
      </Callout>
    </>
  );
}
