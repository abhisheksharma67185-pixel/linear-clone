import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";

export default function APIEventsPage() {
  return (
    <>
      <h1>Generic Events API</h1>
      <p>
        The generic events surface accepts a versioned canonical envelope so
        external systems can map their own spans, actions, artifacts, and metrics
        into Theta without rewriting around the Theta SDK.
      </p>

      <h2>POST /v1/events</h2>
      <p>
        Send a canonical event envelope for immediate ingestion. This is the
        preferred route for adapters, collectors, and framework bridges.
      </p>
      <CodeBlock lang="json">
        {`{
  "schema_version": "2026-04-01",
  "trace": {
    "trace_id": "tr_ext_123",
    "name": "desktop-agent-run",
    "status": "success",
    "platform": "desktop"
  },
  "events": [
    {
      "type": "artifact",
      "name": "desktop_screenshot",
      "step_id": "st_1",
      "attachment": {
        "type": "image",
        "uri": "https://example.com/frame.jpg",
        "width": 1920,
        "height": 1080
      }
    }
  ]
}`}
      </CodeBlock>

      <h2>POST /v1/imports/traces</h2>
      <p>
        Bulk import canonical trace payloads. Use this for historical backfills,
        replay jobs, and migration flows from external observability systems.
      </p>

      <h3>Key Fields</h3>
      <ParamTable
        params={[
          { name: "schema_version", type: "string", required: true, description: "Canonical schema version." },
          { name: "trace", type: "object", required: true, description: "Top-level trace metadata and identity." },
          { name: "events", type: "array", description: "Ordered event list covering messages, tools, artifacts, and metrics." },
          { name: "steps", type: "array", description: "Optional explicit step hierarchy when the source system already exposes spans." },
        ]}
      />

      <h2>OTel Export</h2>
      <p>
        Once ingested, canonical traces can be exported in OTLP-style JSON via
        <code> GET /v1/projects/:id/exports/otel</code>.
      </p>
    </>
  );
}
