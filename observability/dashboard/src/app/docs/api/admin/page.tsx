import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";

export default function ApiAdminPage() {
  return (
    <>
      <h1>Admin API</h1>
      <p>
        Administrative endpoints for bulk operations on traces. These require
        dashboard JWT authentication with owner-level access.
      </p>

      <hr />

      <h2>PATCH /v1/admin/traces/bulk</h2>
      <p>
        Bulk update traces matching a filter. Updates both the BigQuery index and
        the GCS trace JSON files. Auth: <strong>JWT</strong> (owner role).
      </p>

      <Callout type="warning" title="Destructive operation">
        <p>
          This endpoint modifies trace data in place. Use the <code>dry_run</code> flag
          to preview changes before applying them.
        </p>
      </Callout>

      <h3>Request Body</h3>
      <CodeBlock lang="json" title="Request">
        {`{
  "filter": {
    "user_id": "usr_old_123",
    "project_id": "proj_123"
  },
  "set": {
    "run_id": "run_new_456",
    "tags": ["migrated", "v2"]
  },
  "dry_run": true
}`}
      </CodeBlock>

      <h3>Filter Fields</h3>
      <ParamTable
        params={[
          { name: "user_id", type: "string", description: "Filter by user ID." },
          { name: "run_id", type: "string", description: "Filter by run ID." },
          { name: "project_id", type: "string", description: "Filter by project ID." },
          { name: "org_id", type: "string", description: "Filter by organization ID." },
          { name: "use_case", type: "string", description: "Filter by use case." },
          { name: "group", type: "string", description: "Filter by group." },
          { name: "platform", type: "string", description: "Filter by platform." },
          { name: "model", type: "string", description: "Filter by model." },
        ]}
      />

      <h3>Patchable Fields</h3>
      <ParamTable
        params={[
          { name: "run_id", type: "string", description: "Update the run ID." },
          { name: "run_type", type: "string", description: "Update the run type." },
          { name: "use_case", type: "string", description: "Update the use case." },
          { name: "group", type: "string", description: "Update the group." },
          { name: "tags", type: "string[]", description: "Replace the tags array." },
        ]}
      />

      <Callout type="info">
        <p>
          Identity fields (trace_id, project_id, org_id) and timing fields (started_at,
          ended_at, latency_ms) are not patchable.
        </p>
      </Callout>

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "matched": 42,
  "updated": 42,
  "gcs_rewritten": 40,
  "gcs_failed": 2,
  "sample_trace_ids": ["tr_001", "tr_002", "tr_003"],
  "changed_fields": ["run_id", "tags"],
  "dry_run": false,
  "duration_ms": 3400
}`}
      </CodeBlock>

      <h3>Dry Run</h3>
      <p>
        Set <code>"dry_run": true</code> to preview the changes without applying them.
        The response shows how many traces would be affected:
      </p>
      <CodeBlock lang="json" title="200 OK (dry run)">
        {`{
  "matched": 42,
  "updated": 0,
  "gcs_rewritten": 0,
  "gcs_failed": 0,
  "sample_trace_ids": ["tr_001", "tr_002", "tr_003"],
  "changed_fields": ["run_id", "tags"],
  "dry_run": true,
  "duration_ms": 850
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash" title="curl">
        {`curl -X PATCH https://api.theta-observability.com/v1/admin/traces/bulk \\
  -H "Authorization: Bearer eyJ..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "filter": {"user_id": "usr_old"},
    "set": {"run_id": "run_new"},
    "dry_run": false
  }'`}
      </CodeBlock>
    </>
  );
}
