import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function TraceSchemaPage() {
  return (
    <>
      <h1>Trace Schema</h1>
      <p>
        Every trace ingested by Theta conforms to the{" "}
        <code>trace.schema.json</code> (v1.0) schema, which is aligned with the
        OpenTelemetry GenAI semantic conventions. This page documents each
        object and field in the schema.
      </p>

      <Callout type="info" title="Schema version">
        <p>
          The current schema version is <code>1.0</code>. All traces must include{" "}
          <code>{`"schema_version": "1.0"`}</code>. Future breaking changes will
          bump this version, and the API will continue to accept older versions
          with automatic migration.
        </p>
      </Callout>

      <h2>Trace (top-level)</h2>
      <p>
        A trace is the root object representing a single request, agent run, or
        workflow execution. It contains metadata, timing, token usage, and an
        ordered array of steps.
      </p>

      <ParamTable
        params={[
          { name: "schema_version", type: "string", required: true, description: "Schema version. Must be \"1.0\"." },
          { name: "trace_id", type: "string", required: true, description: "Unique trace identifier. ULID-style with tr_ prefix (e.g. tr_01J5KX...)." },
          { name: "project_id", type: "string", required: true, description: "Project the trace belongs to. Pattern: proj_[A-Za-z0-9]{4,}." },
          { name: "org_id", type: "string", description: "Organization ID. Pattern: org_[A-Za-z0-9]{4,}. Set by the API from the API key." },
          { name: "name", type: "string", required: true, description: "Human-readable trace name. 1-256 characters." },
          { name: "run_id", type: "string", description: "Groups related traces under one run. Max 128 chars." },
          { name: "run_type", type: "enum", description: "Classifies the run. One of: prod, eval, dev, test, replay, backfill, other." },
          { name: "use_case", type: "string", description: "Use case label for filtering (e.g. \"support\", \"onboarding\"). Max 128 chars." },
          { name: "user_id", type: "string", description: "End-user identifier. Max 256 chars." },
          { name: "group", type: "string", description: "Group label for segmentation. Max 128 chars." },
          { name: "platform", type: "enum", description: "Platform label. One of: web, mobile, desktop, server, robot, sim, cli, other." },
          { name: "model", type: "string", description: "Primary model used in this trace. Max 256 chars." },
          { name: "status", type: "enum", description: "Trace status. One of: success, error, running, cancelled." },
          { name: "error_message", type: "string", description: "Error message when status is error." },
          { name: "tags", type: "string[]", description: "Arbitrary string tags for filtering. Max 64 tags, each max 64 chars." },
          { name: "metadata", type: "object", description: "Free-form JSON metadata. Indexed as JSON in BigQuery." },
          { name: "started_at", type: "datetime", required: true, description: "ISO 8601 timestamp when the trace started." },
          { name: "ended_at", type: "datetime", description: "ISO 8601 timestamp when the trace ended." },
          { name: "latency_ms", type: "integer", description: "Total latency in milliseconds. Minimum 0." },
          { name: "token_usage", type: "TokenUsage", description: "Aggregated token usage across all steps." },
          { name: "cost_usd", type: "number", description: "Total cost in USD. Minimum 0." },
          { name: "steps", type: "Step[]", required: true, description: "Ordered array of steps within the trace." },
          { name: "annotations", type: "Annotation[]", description: "Human or automated annotations on the trace." },
        ]}
      />

      <h2>Step</h2>
      <p>
        Steps are the building blocks of a trace. Each step represents a single
        operation such as an LLM call, tool invocation, retrieval query, robotics
        action, or custom logic. Steps can be nested via{" "}
        <code>parent_step_id</code> to form a tree.
      </p>

      <ParamTable
        params={[
          { name: "step_id", type: "string", required: true, description: "Unique step identifier. Pattern: st_[A-Za-z0-9]{3,}." },
          { name: "parent_step_id", type: "string | null", description: "Parent step ID for nesting. Null for root-level steps." },
          { name: "index", type: "integer", description: "Zero-based execution order within the parent." },
          { name: "type", type: "enum", required: true, description: "Step type. One of: llm, tool, retrieval, robotics, human, annotation, custom." },
          { name: "name", type: "string", description: "Human-readable step name. Max 256 chars." },
          { name: "model", type: "string", description: "Model identifier (for LLM steps). Max 256 chars." },
          { name: "status", type: "enum", description: "Step status. One of: success, error, running, cancelled." },
          { name: "error_message", type: "string", description: "Error message when status is error." },
          { name: "started_at", type: "datetime", description: "ISO 8601 timestamp when the step started." },
          { name: "ended_at", type: "datetime", description: "ISO 8601 timestamp when the step ended." },
          { name: "latency_ms", type: "integer", description: "Step latency in milliseconds." },
          { name: "token_usage", type: "TokenUsage", description: "Token usage for this step." },
          { name: "cost_usd", type: "number", description: "Step cost in USD." },
          { name: "messages", type: "Message[]", description: "Chat-style messages (for LLM steps)." },
          { name: "tool_calls", type: "ToolCall[]", description: "Tool invocations made during this step." },
          { name: "sensor_frames", type: "SensorFrame[]", description: "Sensor data frames (for robotics steps)." },
          { name: "retrieval", type: "object", description: "Retrieval context with query and results array (for retrieval steps)." },
          { name: "metadata", type: "object", description: "Free-form JSON metadata for this step." },
          { name: "annotations", type: "Annotation[]", description: "Annotations on this step." },
        ]}
      />

      <Callout type="info" title="Robotics steps">
        <p>
          When <code>type</code> is <code>&quot;robotics&quot;</code>, the step must include
          either <code>sensor_frames</code> or <code>messages</code> (or both).
          This constraint is enforced by the schema.
        </p>
      </Callout>

      <h2>Message</h2>
      <p>
        Messages represent chat-style interactions within an LLM step. Content
        can be a plain string or a structured array of content parts supporting
        text, images, audio, video, sensor data, and file attachments.
      </p>

      <ParamTable
        params={[
          { name: "role", type: "enum", required: true, description: "Message role. One of: system, user, assistant, tool, developer, function." },
          { name: "name", type: "string", description: "Optional name for the message author. Max 256 chars." },
          { name: "content", type: "string | ContentPart[]", required: true, description: "Plain text string or array of multimodal content parts." },
          { name: "tool_call_id", type: "string", description: "ID of the tool call this message is responding to (for role: tool)." },
          { name: "metadata", type: "object", description: "Free-form metadata for this message." },
        ]}
      />

      <h3>Content Parts</h3>
      <p>
        When <code>content</code> is an array, each element is a typed content
        part. The <code>type</code> field determines the schema:
      </p>

      <ParamTable
        params={[
          { name: "text", type: "ContentPart", description: "Text content. Fields: type (\"text\"), text (string)." },
          { name: "image", type: "ContentPart", description: "Image. Fields: type (\"image\"), uri or data_base64, mime (default image/png), width, height, alt." },
          { name: "audio", type: "ContentPart", description: "Audio. Fields: type (\"audio\"), uri or data_base64, mime (default audio/mpeg), duration_ms, sample_rate_hz, transcript." },
          { name: "video", type: "ContentPart", description: "Video. Fields: type (\"video\"), uri (required), mime (default video/mp4), duration_ms, width, height, fps, poster_uri." },
          { name: "sensor", type: "ContentPart", description: "Sensor data. Fields: type (\"sensor\"), modality (required), uri (required), mime, rate_hz, shape, units." },
          { name: "file", type: "ContentPart", description: "Generic file. Fields: type (\"file\"), uri (required), mime (default application/octet-stream), name, size_bytes." },
        ]}
      />

      <h2>ToolCall</h2>
      <p>
        Tool calls record invocations of external tools or functions. Arguments
        can be a structured object or a raw JSON string as emitted by some
        providers.
      </p>

      <ParamTable
        params={[
          { name: "id", type: "string", required: true, description: "Unique tool call identifier." },
          { name: "name", type: "string", required: true, description: "Tool or function name. Max 256 chars." },
          { name: "arguments", type: "object | string", description: "Tool arguments. Object when structured, string for raw JSON." },
          { name: "result", type: "any", description: "Tool result value. Can be object, array, string, number, boolean, or null." },
          { name: "error", type: "string", description: "Error message if the tool call failed." },
          { name: "started_at", type: "datetime", description: "ISO 8601 timestamp when the tool call started." },
          { name: "ended_at", type: "datetime", description: "ISO 8601 timestamp when the tool call ended." },
          { name: "latency_ms", type: "integer", description: "Tool call latency in milliseconds." },
        ]}
      />

      <h2>SensorFrame</h2>
      <p>
        Sensor frames capture robotics and IoT sensor data within a step.
        Supported modalities include joint state, pose, IMU, lidar, depth,
        force/torque, gripper, camera, tactile, and custom.
      </p>

      <ParamTable
        params={[
          { name: "modality", type: "enum", required: true, description: "Sensor modality. One of: joint_state, pose, imu, lidar, depth, force_torque, gripper, camera, tactile, custom." },
          { name: "uri", type: "string", required: true, description: "URI to the sensor data (gs:// or https://)." },
          { name: "mime", type: "string", description: "MIME type of the sensor data." },
          { name: "fps", type: "number", description: "Frames per second (for camera/video data)." },
          { name: "rate_hz", type: "number", description: "Sampling rate in Hz." },
          { name: "duration_ms", type: "integer", description: "Duration in milliseconds." },
          { name: "shape", type: "integer[]", description: "Tensor shape of the data (e.g. [7] for 7-DOF joint state)." },
          { name: "units", type: "string", description: "Physical units (e.g. \"radians\", \"m/s^2\", \"N\")." },
          { name: "started_at", type: "datetime", description: "ISO 8601 timestamp when recording started." },
          { name: "ended_at", type: "datetime", description: "ISO 8601 timestamp when recording ended." },
          { name: "metadata", type: "object", description: "Free-form metadata for the sensor frame." },
        ]}
      />

      <h2>TokenUsage</h2>
      <p>
        Token usage is recorded at both the step and trace level. Trace-level
        usage is typically auto-aggregated from steps by the SDK.
      </p>

      <ParamTable
        params={[
          { name: "input", type: "integer", description: "Number of input (prompt) tokens." },
          { name: "output", type: "integer", description: "Number of output (completion) tokens." },
          { name: "total", type: "integer", description: "Total tokens. Usually input + output." },
          { name: "cached_input", type: "integer", description: "Number of input tokens served from cache." },
          { name: "reasoning", type: "integer", description: "Number of reasoning/thinking tokens (for models that expose this)." },
        ]}
      />

      <h2>Annotation</h2>
      <p>
        Annotations provide human or automated feedback on traces, steps,
        messages, tool calls, or attachments. They support multiple kinds:
        comments, labels, scores, ratings, and corrections.
      </p>

      <ParamTable
        params={[
          { name: "id", type: "string", required: true, description: "Unique annotation identifier." },
          { name: "kind", type: "enum", required: true, description: "Annotation kind. One of: comment, label, score, rating, correction." },
          { name: "author_id", type: "string", description: "User ID of the annotation author." },
          { name: "author_email", type: "string", description: "Email address of the annotation author." },
          { name: "target", type: "enum", description: "What the annotation targets. One of: trace, step, message, tool_call, attachment.", default: "trace" },
          { name: "target_id", type: "string", description: "ID of the targeted object (step_id, tool call id, etc.)." },
          { name: "text", type: "string", description: "Free-text comment or note." },
          { name: "label", type: "string", description: "Classification label (e.g. \"good\", \"hallucination\")." },
          { name: "score", type: "number", description: "Numeric score (e.g. 0.0 to 1.0)." },
          { name: "rating", type: "enum", description: "Quick rating. One of: up, down, neutral." },
          { name: "created_at", type: "datetime", description: "ISO 8601 timestamp when the annotation was created." },
          { name: "metadata", type: "object", description: "Free-form metadata for the annotation." },
        ]}
      />

      <h2>Full Example</h2>
      <p>
        A complete trace with an LLM step, a tool step, and a nested custom step:
      </p>

      <CodeBlock lang="json" title="trace.json">
        {`{
  "schema_version": "1.0",
  "trace_id": "tr_01J5KXM3QWERTY",
  "project_id": "proj_abc123",
  "name": "checkout-agent",
  "run_id": "run_20240115_001",
  "run_type": "prod",
  "use_case": "checkout",
  "user_id": "usr_456",
  "platform": "web",
  "model": "claude-sonnet-4-20250514",
  "status": "success",
  "tags": ["checkout", "v2", "high-value"],
  "metadata": {
    "session_id": "sess_789",
    "cart_total": 149.99
  },
  "started_at": "2025-01-15T10:30:00.000Z",
  "ended_at": "2025-01-15T10:30:02.350Z",
  "latency_ms": 2350,
  "token_usage": {
    "input": 1200,
    "output": 350,
    "total": 1550,
    "cached_input": 800
  },
  "cost_usd": 0.0047,
  "steps": [
    {
      "step_id": "st_plan01",
      "parent_step_id": null,
      "index": 0,
      "type": "llm",
      "name": "plan",
      "model": "claude-sonnet-4-20250514",
      "status": "success",
      "started_at": "2025-01-15T10:30:00.000Z",
      "ended_at": "2025-01-15T10:30:01.200Z",
      "latency_ms": 1200,
      "token_usage": { "input": 800, "output": 200, "total": 1000 },
      "cost_usd": 0.003,
      "messages": [
        {
          "role": "system",
          "content": "You are a checkout assistant."
        },
        {
          "role": "user",
          "content": [
            { "type": "text", "text": "Complete my order" },
            { "type": "image", "uri": "gs://theta-obs-dev/cart-screenshot.png", "mime": "image/png" }
          ]
        },
        {
          "role": "assistant",
          "content": "I'll process your checkout now. Let me verify inventory."
        }
      ]
    },
    {
      "step_id": "st_tool01",
      "parent_step_id": "st_plan01",
      "index": 1,
      "type": "tool",
      "name": "inventory-check",
      "status": "success",
      "started_at": "2025-01-15T10:30:01.200Z",
      "ended_at": "2025-01-15T10:30:01.900Z",
      "latency_ms": 700,
      "tool_calls": [
        {
          "id": "tc_inv01",
          "name": "check_inventory",
          "arguments": { "sku": "WIDGET-42", "quantity": 2 },
          "result": { "available": true, "stock": 15 },
          "latency_ms": 650
        }
      ]
    },
    {
      "step_id": "st_confirm01",
      "parent_step_id": null,
      "index": 2,
      "type": "llm",
      "name": "confirm",
      "model": "claude-sonnet-4-20250514",
      "status": "success",
      "started_at": "2025-01-15T10:30:01.900Z",
      "ended_at": "2025-01-15T10:30:02.350Z",
      "latency_ms": 450,
      "token_usage": { "input": 400, "output": 150, "total": 550 },
      "cost_usd": 0.0017,
      "messages": [
        {
          "role": "assistant",
          "content": "Your order has been confirmed! Shipping in 2-3 business days."
        }
      ]
    }
  ],
  "annotations": [
    {
      "id": "ann_01",
      "kind": "rating",
      "author_email": "reviewer@example.com",
      "target": "trace",
      "rating": "up",
      "text": "Handled checkout correctly",
      "created_at": "2025-01-15T11:00:00.000Z"
    }
  ]
}`}
      </CodeBlock>

      <Callout type="tip">
        <p>
          The SDKs handle ID generation, timestamps, latency calculation, and
          token aggregation automatically. You only need to provide the full JSON
          structure when using the <Link href="/docs/api/traces">REST API</Link> directly.
        </p>
      </Callout>
    </>
  );
}
