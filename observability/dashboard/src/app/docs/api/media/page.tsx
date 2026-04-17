import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";

export default function APIMediaPage() {
  return (
    <>
      <h1>Media API</h1>
      <p>
        The Media API provides two paths for uploading attachments (images,
        audio, video, documents) associated with traces. Use signed URLs for
        direct-to-storage uploads, or the proxy upload endpoint as a fallback.
      </p>

      {/* ── POST /v1/media/signed-url ──────────────────── */}
      <h2>Get Signed Upload URL</h2>
      <p>
        <code>POST /v1/media/signed-url</code>{" "}
        <span className="ml-2 inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
          API Key
        </span>
      </p>
      <p>
        Returns a time-limited signed URL that clients can <code>PUT</code> to
        directly, bypassing the API server for the actual upload. The signed URL
        expires after 15 minutes.
      </p>

      <h3>Request Body</h3>
      <ParamTable
        params={[
          { name: "content_type", type: "string", required: true, description: "MIME type of the file (e.g. 'image/png', 'audio/wav')." },
          { name: "trace_id", type: "string", description: "Trace ID to associate the attachment with. Auto-generated if omitted." },
          { name: "filename", type: "string", description: "Desired filename. Auto-generated if omitted. Slashes and '..' are sanitized." },
          { name: "size_bytes", type: "integer", description: "File size in bytes (informational)." },
        ]}
      />

      <CodeBlock lang="json" title="POST /v1/media/signed-url">
        {`{
  "content_type": "image/png",
  "trace_id": "trc_abc123",
  "filename": "screenshot.png",
  "size_bytes": 204800
}`}
      </CodeBlock>

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "url": "https://storage.googleapis.com/bucket/projects/.../screenshot.png?X-Goog-Signature=...",
  "gs_uri": "gs://bucket/projects/proj_xyz/traces/trc_abc123/attachments/screenshot.png",
  "expires_at": "2025-01-15T10:45:00Z"
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`# Step 1: Get the signed URL
curl -X POST https://api.theta-observability.com/v1/media/signed-url \\
  -H "x-api-key: tobs_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{"content_type":"image/png","trace_id":"trc_abc123","filename":"screenshot.png"}'

# Step 2: Upload directly to the signed URL
curl -X PUT "SIGNED_URL_FROM_STEP_1" \\
  -H "Content-Type: image/png" \\
  --data-binary @screenshot.png`}
      </CodeBlock>

      <hr />

      {/* ── POST /v1/media/upload ──────────────────────── */}
      <h2>Proxy Upload</h2>
      <p>
        <code>POST /v1/media/upload</code>{" "}
        <span className="ml-2 inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
          API Key
        </span>
      </p>
      <p>
        Streams the raw request body directly to cloud storage via the API
        server. This is the fallback path used by SDKs when signed URLs are not
        supported (e.g. local development with fake-gcs). Maximum body size is
        64 MiB.
      </p>

      <h3>Query Parameters</h3>
      <ParamTable
        params={[
          { name: "trace_id", type: "string", description: "Trace ID to associate the upload with. Auto-generated if omitted." },
          { name: "name", type: "string", description: "Desired filename. Auto-generated if omitted." },
        ]}
      />

      <h3>Headers</h3>
      <ParamTable
        params={[
          { name: "Content-Type", type: "string", description: "MIME type of the uploaded file.", default: "application/octet-stream" },
        ]}
      />

      <h3>Request Body</h3>
      <p>Raw file bytes.</p>

      <h3>Response</h3>
      <CodeBlock lang="json" title="200 OK">
        {`{
  "url": "",
  "gs_uri": "gs://bucket/projects/proj_xyz/traces/trc_abc123/attachments/screenshot.png",
  "expires_at": "2025-01-15T11:30:00Z"
}`}
      </CodeBlock>

      <h3>curl Example</h3>
      <CodeBlock lang="bash">
        {`curl -X POST "https://api.theta-observability.com/v1/media/upload?trace_id=trc_abc123&name=screenshot.png" \\
  -H "x-api-key: tobs_live_abc123" \\
  -H "Content-Type: image/png" \\
  --data-binary @screenshot.png`}
      </CodeBlock>

      <Callout type="tip">
        <p>
          Prefer the signed URL flow for production workloads. It offloads
          bandwidth from the API server and supports parallel uploads directly
          to cloud storage.
        </p>
      </Callout>
    </>
  );
}
