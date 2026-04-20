import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";

export default function APITracesPage() {
  return (
    <>
      <h1>Traces API</h1>
      <p>
        The Traces API lets you ingest full traces, list and filter stored
        traces, retrieve a single trace with its full JSON payload, and append
        steps to an existing trace.
      </p>

      {/* ── POST /v1/traces ─────────────────────────────── */}
      <h2>Ingest a Trace</h2>
      <p>
        <code>POST /v1/traces</code>{" "}
        <span className="ml-2 inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
          API Key
        </span>
      </p>
      <p>
        Accepts a full trace JSON object and runs it through the ingest
        pipeline. The <code>project_id</code> is automatically set from the
        authenticated API key.
      </p>

      <h3>Request Body</h3>
      <CodeBlock lang="json" title="POST /v1/traces">
        {`{
  "trace_id": "trc_abc123",
  "name": "checkout-agent",
  "run_id": "run_001",
  "run_type": "prod",
  "use_case": "checkout",
  "user_id": "usr_456",
  "group": "vip",
  "platform": "web",
  "model": "gpt-4o",
  "status": "success",
  "tags": ["checkout", "v2"],
  "metadata": { "session_id": "sess_789" },
  "started_at": "2025-01-15T10:30:00Z",
  "ended_at": "2025-01-15T10:30:02Z",
  "latency_ms": 2000,
  "token_usage": { "input": 500, "output": 120, "total": 620 },
  "cost_usd": 0.0032,
  "steps": [
    {
      "step_id": "step_001",
      "type": "llm",
      "name": "plan",
      "model": "gpt-4o",
      "status": "success",
      "started_at": "2025-01-15T10:30:00Z",
      "ended_at": "2025-01-15T10:30:01Z",
      "latency_ms": 1000,
      "input_tokens": 500,
      "output_tokens": 120,
      "messages": [
        { "role": "user", "content": [{ "type": "text", "text": "Plan the checkout flow" }] },
        { "role": "assistant", "content": [{ "type": "text", "text": "Here is the plan..." }] }
      ]
    }
  ]
}`}
      </CodeBlock>

      <h3>Response</h3>
      <CodeBlock lang="json" title="202 Accepted">
        {`{
  "trace_id": "trc_abc123",
  "ingest_status": "accepted",
  "gcs_uri": "gs://bucket/orgs/org_.../projects/proj_.../traces/trc_abc123.json"
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl -X POST https://api.theta-observability.com/v1/traces \\
  -H "x-api-key: tobs_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "trace_id": "trc_abc123",
    "name": "checkout-agent",
    "status": "success",
    "steps": []
  }'`}
      </CodeBlock>

      <h3>Python Example</h3>
      <CodeBlock lang="python">
        {`import requests

resp = requests.post(
    "https://api.theta-observability.com/v1/traces",
    headers={"x-api-key": "tobs_live_abc123"},
    json={
        "trace_id": "trc_abc123",
        "name": "checkout-agent",
        "status": "success",
        "steps": [],
    },
)
print(resp.json())  # {"trace_id": "trc_abc123", "ingest_status": "accepted", ...}`}
      </CodeBlock>

      <h3>Node.js Example</h3>
      <CodeBlock lang="javascript">
        {`const resp = await fetch("https://api.theta-observability.com/v1/traces", {
  method: "POST",
  headers: {
    "x-api-key": "tobs_live_abc123",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    trace_id: "trc_abc123",
    name: "checkout-agent",
    status: "success",
    steps: [],
  }),
});
const data = await resp.json();
console.log(data); // { trace_id: "trc_abc123", ingest_status: "accepted", ... }`}
      </CodeBlock>

      <Callout type="info" title="Body size limit">
        <p>
          The trace payload is limited to <strong>10 MiB</strong>. For larger
          traces, ingest the initial trace and then append steps separately
          via <code>POST /v1/traces/:id/steps</code>.
        </p>
      </Callout>

      <hr />

      {/* ── GET /v1/traces ──────────────────────────────── */}
      <h2>List Traces</h2>
      <p>
        <code>GET /v1/traces</code>{" "}
        <span className="ml-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
          Either
        </span>
      </p>
      <p>
        Returns a paginated list of traces matching the given filters. When
        authenticated with an API key, the <code>project_id</code> defaults to
        the key&apos;s project. JWT-authenticated requests must provide
        <code> project_id</code> explicitly.
      </p>

      <h3>Query Parameters</h3>
      <ParamTable
        params={[
          { name: "project_id", type: "string", description: "Filter by project. Required for JWT auth; auto-set for API key auth." },
          { name: "status", type: "string", description: "Filter by trace status (e.g. 'success', 'error')." },
          { name: "platform", type: "string", description: "Filter by platform label (e.g. 'web', 'ios')." },
          { name: "model", type: "string", description: "Filter by primary model name." },
          { name: "user_id", type: "string", description: "Filter by end-user ID." },
          { name: "run_id", type: "string", description: "Filter by run ID." },
          { name: "run_type", type: "string", description: "Filter by run type (e.g. 'prod', 'eval')." },
          { name: "use_case", type: "string", description: "Filter by use case label." },
          { name: "group", type: "string", description: "Filter by group label." },
          { name: "tags", type: "string", description: "Comma-separated list of tags to filter by." },
          { name: "meta_key", type: "string", description: "Metadata key to filter by. Supports dot paths like 'workflow.stage'." },
          { name: "meta_value", type: "string", description: "Metadata value paired with the preceding meta_key." },
          { name: "since", type: "string", description: "ISO 8601 datetime. Only return traces started after this time." },
          { name: "until", type: "string", description: "ISO 8601 datetime. Only return traces started before this time." },
          { name: "cursor", type: "string", description: "Pagination cursor from a previous response." },
          { name: "limit", type: "integer", description: "Maximum number of traces to return.", default: "50" },
        ]}
      />

      <Callout type="info" title="Metadata filters">
        <p>
          Send repeated <code>meta_key</code> / <code>meta_value</code> pairs to filter on
          JSON metadata. For example, <code>meta_key=workflow.stage</code> with{" "}
          <code>meta_value=checkout</code> matches traces whose metadata contains{" "}
          <code>{`{ "workflow": { "stage": "checkout" } }`}</code>.
        </p>
      </Callout>

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "items": [
    {
      "trace_id": "trc_abc123",
      "project_id": "proj_xyz",
      "name": "checkout-agent",
      "status": "success",
      "platform": "web",
      "model": "gpt-4o",
      "user_id": "usr_456",
      "metadata": {
        "workflow": { "stage": "checkout" }
      },
      "started_at": "2025-01-15T10:30:00Z",
      "latency_ms": 2000,
      "total_tokens": 620,
      "cost_usd": 0.0032,
      "step_count": 3,
      "has_media": false,
      "tags": ["checkout", "v2"]
    }
  ],
  "next_cursor": "eyJ0cmFjZV9pZCI6InRyY18uLi4ifQ=="
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl "https://api.theta-observability.com/v1/traces?project_id=proj_xyz&status=error&meta_key=workflow.stage&meta_value=checkout&limit=10" \\
  -H "x-api-key: tobs_live_abc123"`}
      </CodeBlock>

      <hr />

      {/* ── GET /v1/traces/:id ──────────────────────────── */}
      <h2>Get Trace Detail</h2>
      <p>
        <code>GET /v1/traces/:id</code>{" "}
        <span className="ml-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
          Either
        </span>
      </p>
      <p>
        Returns the trace metadata from the index (BigQuery) and the full trace
        JSON from object storage (GCS). If the GCS object is missing, the
        <code> trace</code> field will be <code>null</code>.
      </p>

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "meta": {
    "trace_id": "trc_abc123",
    "project_id": "proj_xyz",
    "name": "checkout-agent",
    "status": "success",
    "platform": "web",
    "model": "gpt-4o",
    "user_id": "usr_456",
    "started_at": "2025-01-15T10:30:00Z",
    "latency_ms": 2000,
    "total_tokens": 620,
    "cost_usd": 0.0032,
    "step_count": 3,
    "has_media": false,
    "tags": ["checkout", "v2"]
  },
  "trace": {
    "trace_id": "trc_abc123",
    "name": "checkout-agent",
    "status": "success",
    "steps": [ ]
  }
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl https://api.theta-observability.com/v1/traces/trc_abc123 \\
  -H "x-api-key: tobs_live_abc123"`}
      </CodeBlock>

      <hr />

      {/* ── POST /v1/traces/:id/steps ───────────────────── */}
      <h2>Append Steps</h2>
      <p>
        <code>POST /v1/traces/:id/steps</code>{" "}
        <span className="ml-2 inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
          API Key
        </span>
      </p>
      <p>
        Appends one or more steps to an existing trace. Accepts either a JSON
        array or NDJSON (one step per line, with{" "}
        <code>Content-Type: application/x-ndjson</code>).
      </p>

      <h3>Request Body</h3>
      <CodeBlock lang="json" title="POST /v1/traces/trc_abc123/steps">
        {`[
  {
    "step_id": "step_002",
    "parent_step_id": "step_001",
    "type": "tool",
    "name": "search_db",
    "status": "success",
    "started_at": "2025-01-15T10:30:01Z",
    "ended_at": "2025-01-15T10:30:01.5Z",
    "latency_ms": 500,
    "tool_calls": [
      {
        "id": "tc_1",
        "name": "search_db",
        "arguments": { "query": "user preferences" },
        "result": { "count": 42 }
      }
    ]
  }
]`}
      </CodeBlock>

      <h3>Response</h3>
      <CodeBlock lang="json" title="202 Accepted">
        {`{
  "trace_id": "trc_abc123",
  "steps_queued": 1
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl -X POST https://api.theta-observability.com/v1/traces/trc_abc123/steps \\
  -H "x-api-key: tobs_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '[{"step_id":"step_002","type":"tool","name":"search_db","status":"success"}]'`}
      </CodeBlock>

      <Callout type="tip">
        <p>
          For streaming SDKs that send steps incrementally, use NDJSON format
          with <code>Content-Type: application/x-ndjson</code>. Each line is
          parsed as a separate step object. Body limit is 20 MiB.
        </p>
      </Callout>
    </>
  );
}
