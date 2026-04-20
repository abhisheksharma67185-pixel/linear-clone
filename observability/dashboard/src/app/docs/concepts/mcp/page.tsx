import { CodeBlock } from "@/components/docs/code-block";

export default function MCPConceptPage() {
  return (
    <>
      <h1>IDE MCP Server</h1>
      <p>
        Theta ships a lightweight MCP server so IDE agents and coding tools can
        inspect traces, search runs, list monitor configs, and export OTLP data
        without going through the dashboard UI.
      </p>

      <h2>Configuration</h2>
      <CodeBlock lang="bash">
        {`export THETA_BASE_URL=http://localhost:8080
export THETA_API_KEY=tobs_live_...
export THETA_PROJECT_ID=proj_123

python mcp/theta_observability_server.py`}
      </CodeBlock>

      <h2>Available Tools</h2>
      <ul>
        <li><code>theta_list_traces</code></li>
        <li><code>theta_get_trace</code></li>
        <li><code>theta_search_traces</code></li>
        <li><code>theta_export_otel</code></li>
        <li><code>theta_list_threads</code></li>
        <li><code>theta_list_monitors</code></li>
      </ul>

      <h2>Why It Matters</h2>
      <p>
        This keeps Theta generic. IDE agents, assistants, or automation tools can
        consume observability data through a stable tool surface instead of having
        to speak the dashboard API directly.
      </p>
    </>
  );
}
