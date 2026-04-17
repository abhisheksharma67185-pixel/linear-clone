import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";

export default function APISearchPage() {
  return (
    <>
      <h1>Search API</h1>
      <p>
        The Search API provides full-text and semantic search over your traces.
        It uses PostgreSQL full-text search under the hood and enriches results
        with trace metadata from the data warehouse.
      </p>

      {/* ── POST /v1/search ────────────────────────────── */}
      <h2>Search Traces</h2>
      <p>
        <code>POST /v1/search</code>{" "}
        <span className="ml-2 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
          Either
        </span>
      </p>
      <p>
        Performs a search query across traces in a project. Results are ranked
        by relevance and enriched with trace metadata including name, status,
        timestamps, and tags.
      </p>

      <h3>Request Body</h3>
      <ParamTable
        params={[
          { name: "query", type: "string", required: true, description: "The search query string." },
          { name: "project_id", type: "string", required: true, description: "Project ID to search within." },
          { name: "limit", type: "integer", description: "Maximum number of results to return (1-100).", default: "50" },
        ]}
      />

      <CodeBlock lang="json" title="POST /v1/search">
        {`{
  "query": "checkout timeout error",
  "project_id": "proj_xyz",
  "limit": 10
}`}
      </CodeBlock>

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "results": [
    {
      "trace_id": "trc_abc123",
      "name": "checkout-agent",
      "status": "error",
      "score": 0.87,
      "user_id": "usr_456",
      "started_at": "2025-01-15T10:30:00Z",
      "tags": ["checkout", "v2"]
    },
    {
      "trace_id": "trc_def456",
      "name": "payment-flow",
      "status": "error",
      "score": 0.72,
      "started_at": "2025-01-15T09:15:00Z",
      "tags": ["payments"]
    }
  ],
  "query": "checkout timeout error"
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl -X POST https://api.theta-observability.com/v1/search \\
  -H "x-api-key: tobs_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{"query":"checkout timeout error","project_id":"proj_xyz","limit":10}'`}
      </CodeBlock>

      <Callout type="info" title="Semantic search">
        <p>
          When the <code>ANTHROPIC_API_KEY</code> environment variable is
          configured on the server, search results also include semantic
          (embedding-based) matches in addition to full-text keyword matches.
        </p>
      </Callout>
    </>
  );
}
