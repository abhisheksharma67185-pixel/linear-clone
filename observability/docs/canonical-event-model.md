# Canonical Event Model

Theta’s canonical event envelope is the interoperability contract for systems that do not emit Theta-native traces directly.

It exists so browser agents, workflow engines, replay jobs, OpenTelemetry bridges, and custom runtimes can send a provider-neutral event stream and still land in the same Theta storage, query, and dashboard pipeline.

## Envelope

The schema is defined in [`schema/canonical-event.schema.json`](../schema/canonical-event.schema.json).

Top-level fields:

| Field | Type | Description |
|-------|------|-------------|
| `schema_version` | `string` | Current canonical envelope version. Today: `1.0` |
| `trace_id` | `string` | Optional caller-supplied trace identifier |
| `project_id` | `string` | Optional project identifier. API-key routes will scope it to the key’s project |
| `name` | `string` | Human-readable run name |
| `source` | `string` | External system or adapter name, e.g. `openclaw`, `langfuse`, `otel` |
| `kind` | `string` | Execution style, e.g. `agent_run`, `workflow_run`, `browser_session`, `backend_job` |
| `run_id` | `string` | External run identifier |
| `run_type` | `string` | Environment / lifecycle type |
| `use_case` | `string` | Product or workflow bucket |
| `user_id` | `string` | End-user identifier |
| `session_id` | `string` | Session identifier for correlation |
| `group` | `string` | Additional grouping key |
| `platform` | `string` | Runtime platform, e.g. `desktop`, `server`, `web` |
| `model` | `string` | Default model identifier for the run |
| `status` | `string` | Run status |
| `tags` | `string[]` | Free-form tags |
| `metadata` | `object` | Free-form JSON metadata |
| `correlation` | `object` | Cross-system correlation hints such as `request_id`, `root_trace_id`, `parent_trace_id` |
| `events` | `CanonicalEvent[]` | Provider-neutral event timeline |
| `attachments` | `ContentPart[]` | Run-level artifacts |

## Events

Each event can carry raw timeline data while still mapping into Theta’s trace viewer:

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | Generic event class such as `span`, `message`, `tool`, `artifact`, `action`, `metric`, `custom` |
| `step_id` | `string` | Logical step grouping key |
| `step_type` | `string` | Optional normalized Theta step type such as `llm`, `tool`, `retrieval`, `custom` |
| `name` | `string` | Event or span name |
| `role` | `string` | Message role when applicable |
| `status` | `string` | Event status |
| `started_at` / `ended_at` | `datetime` | Event timing |
| `latency_ms` | `integer` | Event duration in milliseconds |
| `message` | `Message` | Structured chat message |
| `tool_call` | `ToolCall` | Tool invocation payload |
| `attachment` | `ContentPart` | Artifact attached to the event |
| `sensor_frame` | `SensorFrame` | Sensor or frame payload |
| `value` | `any` | Free-form value for event classes Theta does not interpret yet |
| `metadata` | `object` | Free-form JSON metadata |

## Normalization Rules

- Theta preserves the raw event timeline under `trace.events` and `step.events`.
- Events sharing the same `step_id` are grouped into the same normalized step.
- `message`, `tool`, `artifact`, and `sensor_frame` payloads are promoted into the normalized step fields so the existing viewer and search surfaces continue to work.
- If no explicit step exists, Theta synthesizes a root step so imported runs still render in the trace viewer.
- Correlation and source metadata are stored under `metadata.theta_canonical`.

## Example

```json
{
  "schema_version": "1.0",
  "name": "browser-session",
  "source": "openclaw",
  "kind": "browser_session",
  "platform": "desktop",
  "session_id": "sess_123",
  "correlation": {
    "request_id": "req_123",
    "root_trace_id": "tr_root"
  },
  "events": [
    {
      "type": "span",
      "step_id": "browser_step",
      "step_type": "custom",
      "name": "browser_step",
      "status": "success",
      "started_at": "2026-04-19T10:00:00Z",
      "ended_at": "2026-04-19T10:00:03Z"
    },
    {
      "type": "message",
      "step_id": "browser_step",
      "message": {
        "role": "user",
        "content": [{ "type": "text", "text": "buy me shoes from amazon" }]
      }
    },
    {
      "type": "artifact",
      "step_id": "browser_step",
      "attachment": {
        "type": "image",
        "uri": "gs://theta-obs-dev/media/screenshot.png",
        "width": 1920,
        "height": 1080
      }
    }
  ]
}
```
