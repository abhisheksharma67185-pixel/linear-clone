import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";

export default function APIIncidentsPage() {
  return (
    <>
      <h1>Incidents API</h1>
      <p>
        The Incidents API provides automated incident detection and management.
        Theta groups related error traces into incidents, identifies patterns,
        and lets you track resolution status.
      </p>

      {/* ── GET /v1/incidents ──────────────────────────── */}
      <h2>List Incidents</h2>
      <p>
        <code>GET /v1/incidents</code>{" "}
        <span className="ml-2 inline-block rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
          JWT
        </span>
      </p>
      <p>
        Returns incidents for a project, optionally filtered by status.
      </p>

      <h3>Query Parameters</h3>
      <ParamTable
        params={[
          { name: "project_id", type: "string", required: true, description: "Project ID to list incidents for." },
          { name: "status", type: "string", description: "Filter by incident status: 'open', 'investigating', 'resolved', or 'dismissed'." },
          { name: "limit", type: "integer", description: "Maximum number of incidents to return.", default: "20" },
        ]}
      />

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "items": [
    {
      "id": "inc_abc123",
      "project_id": "proj_xyz",
      "title": "Repeated timeout in checkout flow",
      "summary": "15 traces failed with timeout errors in the payment step over the last 2 hours.",
      "status": "open",
      "severity": "high",
      "error_pattern": "TimeoutError: payment gateway did not respond",
      "first_seen_at": "2025-01-15T08:30:00Z",
      "last_seen_at": "2025-01-15T10:30:00Z",
      "trace_count": 15,
      "created_at": "2025-01-15T10:31:00Z"
    }
  ]
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl "https://api.theta-observability.com/v1/incidents?project_id=proj_xyz&status=open" \\
  -H "Authorization: Bearer eyJhbGci..."`}
      </CodeBlock>

      <hr />

      {/* ── GET /v1/incidents/:id ──────────────────────── */}
      <h2>Get Incident Detail</h2>
      <p>
        <code>GET /v1/incidents/:id</code>{" "}
        <span className="ml-2 inline-block rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
          JWT
        </span>
      </p>
      <p>
        Returns full incident details including the list of associated trace
        IDs.
      </p>

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "id": "inc_abc123",
  "project_id": "proj_xyz",
  "title": "Repeated timeout in checkout flow",
  "summary": "15 traces failed with timeout errors in the payment step over the last 2 hours.",
  "status": "open",
  "root_cause": "Payment gateway latency spike",
  "severity": "high",
  "error_pattern": "TimeoutError: payment gateway did not respond",
  "first_seen_at": "2025-01-15T08:30:00Z",
  "last_seen_at": "2025-01-15T10:30:00Z",
  "trace_count": 15,
  "trace_ids": [
    "trc_001",
    "trc_002",
    "trc_003",
    "trc_004",
    "trc_005"
  ],
  "created_at": "2025-01-15T10:31:00Z"
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl https://api.theta-observability.com/v1/incidents/inc_abc123 \\
  -H "Authorization: Bearer eyJhbGci..."`}
      </CodeBlock>

      <hr />

      {/* ── PATCH /v1/incidents/:id ────────────────────── */}
      <h2>Update Incident Status</h2>
      <p>
        <code>PATCH /v1/incidents/:id</code>{" "}
        <span className="ml-2 inline-block rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
          JWT
        </span>
      </p>
      <p>
        Updates the status of an incident. Valid statuses are{" "}
        <code>open</code>, <code>investigating</code>, <code>resolved</code>,
        and <code>dismissed</code>.
      </p>

      <h3>Request Body</h3>
      <ParamTable
        params={[
          { name: "status", type: "string", required: true, description: "New status. One of: 'open', 'investigating', 'resolved', 'dismissed'." },
        ]}
      />

      <CodeBlock lang="json" title="PATCH /v1/incidents/inc_abc123">
        {`{
  "status": "investigating"
}`}
      </CodeBlock>

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "id": "inc_abc123",
  "project_id": "proj_xyz",
  "title": "Repeated timeout in checkout flow",
  "summary": "15 traces failed with timeout errors...",
  "status": "investigating",
  "severity": "high",
  "error_pattern": "TimeoutError: payment gateway did not respond",
  "first_seen_at": "2025-01-15T08:30:00Z",
  "last_seen_at": "2025-01-15T10:30:00Z",
  "trace_count": 15,
  "created_at": "2025-01-15T10:31:00Z"
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl -X PATCH https://api.theta-observability.com/v1/incidents/inc_abc123 \\
  -H "Authorization: Bearer eyJhbGci..." \\
  -H "Content-Type: application/json" \\
  -d '{"status":"investigating"}'`}
      </CodeBlock>

      <hr />

      {/* ── POST /v1/incidents/detect ──────────────────── */}
      <h2>Trigger Incident Detection</h2>
      <p>
        <code>POST /v1/incidents/detect</code>{" "}
        <span className="ml-2 inline-block rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
          JWT
        </span>
      </p>
      <p>
        Manually triggers the incident detection pipeline for a project. This
        analyzes recent error traces, identifies patterns, and creates or
        updates incidents. Detection also runs automatically on a schedule.
      </p>

      <h3>Request Body</h3>
      <ParamTable
        params={[
          { name: "project_id", type: "string", required: true, description: "Project ID to run detection for." },
        ]}
      />

      <CodeBlock lang="json" title="POST /v1/incidents/detect">
        {`{
  "project_id": "proj_xyz"
}`}
      </CodeBlock>

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "status": "detection_complete"
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl -X POST https://api.theta-observability.com/v1/incidents/detect \\
  -H "Authorization: Bearer eyJhbGci..." \\
  -H "Content-Type: application/json" \\
  -d '{"project_id":"proj_xyz"}'`}
      </CodeBlock>

      <Callout type="warning" title="Long-running operation">
        <p>
          Incident detection analyzes recent traces and may take several seconds
          to complete depending on the volume of error traces. The request blocks
          until detection finishes or times out (60 second server timeout).
        </p>
      </Callout>
    </>
  );
}
