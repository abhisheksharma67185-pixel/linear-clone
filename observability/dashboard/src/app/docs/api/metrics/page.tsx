import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";

export default function APIMetricsPage() {
  return (
    <>
      <h1>Metrics API</h1>
      <p>
        The Metrics API lets you define custom evaluation metrics, record events
        against traces, and query metric results. Metrics can be of type
        <code> automated</code> (evaluated by a prompt) or <code>observed</code>{" "}
        (reported by your code).
      </p>

      {/* ── POST /v1/metrics ───────────────────────────── */}
      <h2>Create a Metric</h2>
      <p>
        <code>POST /v1/metrics</code>{" "}
        <span className="ml-2 inline-block rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
          JWT
        </span>
      </p>
      <p>
        Creates a new metric definition scoped to a project. Requires JWT
        authentication and membership in the project&apos;s organization.
      </p>

      <h3>Request Body</h3>
      <ParamTable
        params={[
          { name: "project_id", type: "string", required: true, description: "Project to scope the metric to." },
          { name: "name", type: "string", required: true, description: "Human-readable metric name." },
          { name: "type", type: "string", required: true, description: "Metric type: 'automated' or 'observed'." },
          { name: "evaluator_prompt", type: "string", description: "LLM prompt used for automated evaluation." },
          { name: "description", type: "string", description: "Optional description of what this metric measures." },
        ]}
      />

      <CodeBlock lang="json" title="POST /v1/metrics">
        {`{
  "project_id": "proj_xyz",
  "name": "response_relevance",
  "type": "automated",
  "evaluator_prompt": "Rate the relevance of the assistant response to the user query on a 0-1 scale.",
  "description": "Measures how relevant the LLM response is to the user's question."
}`}
      </CodeBlock>

      <h3>Response</h3>
      <CodeBlock lang="json" title="201 Created">
        {`{
  "id": "met_abc123",
  "project_id": "proj_xyz",
  "name": "response_relevance",
  "type": "automated",
  "evaluator_prompt": "Rate the relevance of the assistant response...",
  "description": "Measures how relevant the LLM response is to the user's question.",
  "created_at": "2025-01-15T10:30:00Z"
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl -X POST https://api.theta-observability.com/v1/metrics \\
  -H "Authorization: Bearer eyJhbGci..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": "proj_xyz",
    "name": "response_relevance",
    "type": "automated",
    "evaluator_prompt": "Rate the relevance on a 0-1 scale."
  }'`}
      </CodeBlock>

      <hr />

      {/* ── GET /v1/metrics ────────────────────────────── */}
      <h2>List Metrics</h2>
      <p>
        <code>GET /v1/metrics</code>{" "}
        <span className="ml-2 inline-block rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
          JWT
        </span>
      </p>
      <p>
        Returns all metric definitions for a project. Requires JWT
        authentication and membership in the project&apos;s organization.
      </p>

      <h3>Query Parameters</h3>
      <ParamTable
        params={[
          { name: "project_id", type: "string", required: true, description: "Project ID to list metrics for." },
        ]}
      />

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "items": [
    {
      "id": "met_abc123",
      "project_id": "proj_xyz",
      "name": "response_relevance",
      "type": "automated",
      "evaluator_prompt": "Rate the relevance...",
      "description": "Measures response relevance.",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl "https://api.theta-observability.com/v1/metrics?project_id=proj_xyz" \\
  -H "Authorization: Bearer eyJhbGci..."`}
      </CodeBlock>

      <hr />

      {/* ── POST /v1/metrics/:id/events ────────────────── */}
      <h2>Record a Metric Event</h2>
      <p>
        <code>POST /v1/metrics/:id/events</code>{" "}
        <span className="ml-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
          Either
        </span>
      </p>
      <p>
        Records an evaluation event for a metric against a specific trace. The
        <code> :id</code> parameter can be either a metric ID (e.g.{" "}
        <code>met_abc123</code>) or a metric name. When using a metric name, an
        API key is required so the project can be inferred.
      </p>

      <h3>Request Body</h3>
      <ParamTable
        params={[
          { name: "trace_id", type: "string", required: true, description: "ID of the trace being evaluated." },
          { name: "passed", type: "boolean", description: "Whether the trace passed this metric (for pass/fail metrics)." },
          { name: "score", type: "number", description: "Numeric score (for scored metrics, e.g. 0.0 to 1.0)." },
          { name: "label", type: "string", description: "Categorical label (for classification metrics)." },
          { name: "metadata", type: "object", description: "Arbitrary JSON metadata for this event." },
        ]}
      />

      <CodeBlock lang="json" title="POST /v1/metrics/met_abc123/events">
        {`{
  "trace_id": "trc_abc123",
  "passed": true,
  "score": 0.95,
  "label": "relevant"
}`}
      </CodeBlock>

      <h3>Response</h3>
      <CodeBlock lang="json" title="201 Created">
        {`{
  "id": "mev_def456",
  "metric_id": "met_abc123",
  "trace_id": "trc_abc123",
  "passed": true,
  "score": 0.95,
  "label": "relevant",
  "evaluated_at": "2025-01-15T10:31:00Z"
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl -X POST https://api.theta-observability.com/v1/metrics/met_abc123/events \\
  -H "x-api-key: tobs_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{"trace_id":"trc_abc123","passed":true,"score":0.95}'`}
      </CodeBlock>

      <Callout type="info" title="Name-based lookup">
        <p>
          You can use the metric name instead of the ID in the URL path (e.g.{" "}
          <code>/v1/metrics/response_relevance/events</code>). This requires API
          key authentication so the project can be resolved from the key. If the
          named metric does not exist yet, Theta creates an <code>observed</code>{" "}
          metric definition automatically on first write.
        </p>
      </Callout>

      <hr />

      {/* ── GET /v1/metrics/:id/events ─────────────────── */}
      <h2>List Metric Events</h2>
      <p>
        <code>GET /v1/metrics/:id/events</code>{" "}
        <span className="ml-2 inline-block rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
          JWT
        </span>
      </p>
      <p>
        Returns recent events for a specific metric, ordered by most recent
        first.
      </p>

      <h3>Query Parameters</h3>
      <ParamTable
        params={[
          { name: "limit", type: "integer", description: "Maximum number of events to return.", default: "50" },
        ]}
      />

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "items": [
    {
      "id": "mev_def456",
      "metric_id": "met_abc123",
      "metric_name": "response_relevance",
      "trace_id": "trc_abc123",
      "passed": true,
      "score": 0.95,
      "label": "relevant",
      "evaluated_at": "2025-01-15T10:31:00Z"
    }
  ]
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl "https://api.theta-observability.com/v1/metrics/met_abc123/events?limit=20" \\
  -H "Authorization: Bearer eyJhbGci..."`}
      </CodeBlock>

      <hr />

      {/* ── GET /v1/traces/:id/metrics ─────────────────── */}
      <h2>Get Trace Metrics</h2>
      <p>
        <code>GET /v1/traces/:id/metrics</code>{" "}
        <span className="ml-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
          Either
        </span>
      </p>
      <p>
        Returns all metric events associated with a specific trace, across all
        metrics.
      </p>

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "items": [
    {
      "id": "mev_def456",
      "metric_id": "met_abc123",
      "metric_name": "response_relevance",
      "trace_id": "trc_abc123",
      "passed": true,
      "score": 0.95,
      "label": "relevant",
      "evaluated_at": "2025-01-15T10:31:00Z"
    },
    {
      "id": "mev_ghi789",
      "metric_id": "met_xyz789",
      "metric_name": "toxicity",
      "trace_id": "trc_abc123",
      "passed": true,
      "score": 0.02,
      "evaluated_at": "2025-01-15T10:31:05Z"
    }
  ]
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl https://api.theta-observability.com/v1/traces/trc_abc123/metrics \\
  -H "x-api-key: tobs_live_abc123"`}
      </CodeBlock>
    </>
  );
}
