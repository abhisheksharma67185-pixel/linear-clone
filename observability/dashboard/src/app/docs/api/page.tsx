import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export default function APIOverviewPage() {
  return (
    <>
      <h1>API Reference</h1>
      <p>
        The Theta Observability REST API lets you ingest traces, query data,
        manage metrics, and trigger incident detection programmatically. All
        endpoints live under a single base URL and follow consistent conventions
        for authentication, errors, and pagination.
      </p>

      <h2>Base URL</h2>
      <CodeBlock lang="text">
        {`https://api.theta-observability.com`}
      </CodeBlock>
      <p>
        All paths in this reference are relative to the base URL. For
        self-hosted deployments, replace the host with your own instance address.
      </p>

      <h2>Authentication</h2>
      <p>
        The API supports two authentication methods. Every endpoint documents
        which methods it accepts.
      </p>
      <h3>API Key</h3>
      <p>
        Project-scoped API keys are created in the dashboard under
        <strong> Settings &gt; API Keys</strong>. Pass the key via
        the <code>x-api-key</code> header or the <code>Authorization: Bearer</code> header.
      </p>
      <CodeBlock lang="bash" title="API Key via header">
        {`curl https://api.theta-observability.com/v1/traces \\
  -H "x-api-key: tobs_live_abc123..."`}
      </CodeBlock>
      <CodeBlock lang="bash" title="API Key via Bearer token">
        {`curl https://api.theta-observability.com/v1/traces \\
  -H "Authorization: Bearer tobs_live_abc123..."`}
      </CodeBlock>

      <h3>JWT (Dashboard Sessions)</h3>
      <p>
        Dashboard users authenticate with a JWT issued at login. The token is
        sent as <code>Authorization: Bearer &lt;jwt&gt;</code>. JWT auth is
        required for control-plane endpoints such as creating metrics, managing
        incidents, and admin operations.
      </p>

      <Callout type="info" title="Either Auth">
        <p>
          Some read endpoints (e.g. listing traces, searching, recording metric
          events) accept <strong>either</strong> an API key or a JWT. These are
          marked with the &quot;Either&quot; auth badge in this reference.
        </p>
      </Callout>

      <h2>Error Format</h2>
      <p>
        All errors return a JSON body with a top-level <code>error</code> object
        containing a machine-readable <code>code</code> and a human-readable
        <code>message</code>.
      </p>
      <CodeBlock lang="json" title="Error response">
        {`{
  "error": {
    "code": "bad_request",
    "message": "project_id required"
  }
}`}
      </CodeBlock>
      <p>
        Common error codes include <code>bad_request</code>,{" "}
        <code>unauthorized</code>, <code>forbidden</code>,{" "}
        <code>not_found</code>, <code>ingest_failed</code>, and{" "}
        <code>query_failed</code>.
      </p>

      <h2>Pagination</h2>
      <p>
        List endpoints use cursor-based pagination. The response includes a
        <code> next_cursor</code> field. Pass it as the <code>cursor</code> query
        parameter on the next request to fetch the following page. When
        <code> next_cursor</code> is empty or absent, you have reached the end.
      </p>
      <CodeBlock lang="bash" title="Paginated request">
        {`curl "https://api.theta-observability.com/v1/traces?project_id=proj_abc&limit=50&cursor=eyJ0..."`}
      </CodeBlock>

      <h2>Rate Limits</h2>
      <p>
        Ingest endpoints (<code>POST /v1/traces</code>,{" "}
        <code>POST /v1/traces/:id/steps</code>) enforce a per-key rate limit of
        <strong> 1,000 requests per minute</strong>. Read endpoints allow up to
        <strong> 200 requests per minute</strong> per key or JWT. If you exceed
        the limit, the API returns <code>429 Too Many Requests</code> with a
        <code> Retry-After</code> header.
      </p>

      <h2>Versioning</h2>
      <p>
        The API is versioned via the URL path prefix (<code>/v1/</code>).
        Breaking changes will be introduced under a new version prefix. Additive
        changes (new fields, new endpoints) may be added to <code>v1</code> without
        a version bump.
      </p>

      <h2>Request Limits</h2>
      <p>
        Trace ingest bodies are limited to <strong>10 MiB</strong>. Step append
        bodies are limited to <strong>20 MiB</strong>. Media uploads are limited
        to <strong>64 MiB</strong>. Search request bodies are limited to{" "}
        <strong>1 MiB</strong>.
      </p>
    </>
  );
}
