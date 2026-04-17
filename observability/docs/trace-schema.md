# Trace Schema Reference

Documentation for the Theta Observability trace payload format. The canonical schema is defined in [`schema/trace.schema.json`](../schema/trace.schema.json) (JSON Schema draft 2020-12).

## Table of Contents

- [Overview](#overview)
- [Top-Level Trace Fields](#top-level-trace-fields)
- [Steps](#steps)
- [Messages](#messages)
- [Content Parts](#content-parts)
  - [Text](#text)
  - [Image](#image)
  - [Audio](#audio)
  - [Video](#video)
  - [Sensor](#sensor)
  - [File](#file)
- [Tool Calls](#tool-calls)
- [Sensor Frames](#sensor-frames)
- [Annotations](#annotations)
- [Token Usage](#token-usage)
- [Example Trace](#example-trace)

---

## Overview

A trace represents one complete agent execution. It contains a flat or nested list of steps, each of which captures a discrete unit of work (an LLM call, a tool invocation, a retrieval lookup, a robotics action, etc.).

```
trace
 +-- steps[]
 |    +-- messages[]          (chat-format: role + content parts)
 |    +-- tool_calls[]        (function/tool invocations)
 |    +-- sensor_frames[]     (robotics sensor data)
 |    +-- annotations[]       (human/automated labels)
 +-- annotations[]            (trace-level annotations)
```

The schema is OTel-GenAI-aligned and versioned. The current version is `1.0`.

---

## Top-Level Trace Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema_version` | `string` | Yes | Always `"1.0"` |
| `trace_id` | `string` | Yes | Unique ID with `tr_` prefix (e.g. `tr_01HWabc123`) |
| `project_id` | `string` | Yes | Project ID with `proj_` prefix |
| `org_id` | `string` | No | Organization ID with `org_` prefix (server-set) |
| `name` | `string` | Yes | Human-readable trace name (1-256 chars) |
| `run_id` | `string` | No | Group related traces (max 128 chars) |
| `run_type` | `string` | No | One of: `prod`, `eval`, `dev`, `test`, `replay`, `backfill`, `other` |
| `use_case` | `string` | No | Use case label (max 128 chars) |
| `user_id` | `string` | No | End-user identifier (max 256 chars) |
| `group` | `string` | No | Grouping key (max 128 chars) |
| `platform` | `string` | No | One of: `web`, `mobile`, `desktop`, `server`, `robot`, `sim`, `cli`, `other` |
| `model` | `string` | No | Primary model name (max 256 chars) |
| `status` | `string` | No | One of: `success`, `error`, `running`, `cancelled` |
| `error_message` | `string` | No | Error description when status is `error` |
| `tags` | `string[]` | No | Up to 64 tags, each max 64 chars |
| `metadata` | `object` | No | Free-form JSON. Indexed as JSON in BigQuery |
| `started_at` | `datetime` | Yes | ISO 8601 timestamp |
| `ended_at` | `datetime` | No | ISO 8601 timestamp |
| `latency_ms` | `integer` | No | End-to-end latency in milliseconds |
| `token_usage` | `object` | No | Aggregated [token usage](#token-usage) |
| `cost_usd` | `number` | No | Total cost in USD |
| `steps` | `Step[]` | Yes | Array of [step objects](#steps) |
| `annotations` | `Annotation[]` | No | Trace-level [annotations](#annotations) |

### ID Formats

| Prefix | Entity | Pattern |
|--------|--------|---------|
| `tr_` | Trace | `^tr_[A-Za-z0-9]{6,}$` |
| `proj_` | Project | `^proj_[A-Za-z0-9]{4,}$` |
| `org_` | Organization | `^org_[A-Za-z0-9]{4,}$` |
| `st_` | Step | `^st_[A-Za-z0-9]{3,}$` |

---

## Steps

A step is a single logical span inside a trace. Steps can be nested via `parent_step_id`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `step_id` | `string` | Yes | Unique ID with `st_` prefix |
| `parent_step_id` | `string \| null` | No | Parent step ID for nesting |
| `index` | `integer` | No | Execution order (0-based) |
| `type` | `string` | Yes | Step type (see below) |
| `name` | `string` | No | Human-readable name (max 256 chars) |
| `model` | `string` | No | Model name for LLM steps (max 256 chars) |
| `status` | `string` | No | `success`, `error`, `running`, or `cancelled` |
| `error_message` | `string` | No | Error description |
| `started_at` | `datetime` | No | ISO 8601 timestamp |
| `ended_at` | `datetime` | No | ISO 8601 timestamp |
| `latency_ms` | `integer` | No | Step latency in milliseconds |
| `token_usage` | `object` | No | [Token usage](#token-usage) for this step |
| `cost_usd` | `number` | No | Cost in USD |
| `messages` | `Message[]` | No | Chat [messages](#messages) |
| `tool_calls` | `ToolCall[]` | No | [Tool calls](#tool-calls) |
| `sensor_frames` | `SensorFrame[]` | No | [Sensor frames](#sensor-frames) |
| `retrieval` | `object` | No | Retrieval context (see below) |
| `metadata` | `object` | No | Free-form JSON |
| `annotations` | `Annotation[]` | No | Step-level [annotations](#annotations) |

### Step Types

| Type | Semantics | Typical contents |
|------|-----------|-----------------|
| `llm` | A language model call | `messages`, `token_usage`, `model` |
| `tool` | A tool or function invocation | `tool_calls`, or `messages` with tool results |
| `retrieval` | A RAG or search query | `retrieval` object with query and results |
| `robotics` | A robotics action or sensor reading | `sensor_frames` and/or `messages` |
| `human` | A human-in-the-loop interaction | `messages` |
| `annotation` | A labeling or review step | `annotations` |
| `custom` | Anything else | Any fields |

### Retrieval Object

The `retrieval` field on a step with `type: "retrieval"`:

| Field | Type | Description |
|-------|------|-------------|
| `query` | `string` | The search query |
| `results` | `object[]` | Array of retrieved documents |
| `results[].id` | `string` | Document ID |
| `results[].score` | `number` | Relevance score |
| `results[].text` | `string` | Document text or snippet |
| `results[].uri` | `string` | Document URI |

### Conditional Validation

- Steps with `type: "robotics"` must contain either `sensor_frames` or `messages` (or both).

---

## Messages

Messages follow the chat-message format used by OpenAI, Anthropic, and other providers.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | `string` | Yes | `system`, `user`, `assistant`, `tool`, `developer`, or `function` |
| `name` | `string` | No | Participant name (max 256 chars) |
| `content` | `string \| ContentPart[]` | Yes | Plain text or array of [content parts](#content-parts) |
| `tool_call_id` | `string` | No | References a tool call (for `tool` role messages) |
| `metadata` | `object` | No | Free-form JSON |

---

## Content Parts

Message content can be a plain string or an array of typed content parts. Each part represents one piece of multimodal content.

### Text

```json
{
  "type": "text",
  "text": "Hello, world!"
}
```

| Field | Type | Required |
|-------|------|----------|
| `type` | `"text"` | Yes |
| `text` | `string` | Yes |

### Image

```json
{
  "type": "image",
  "uri": "gs://bucket/path/screenshot.png",
  "mime": "image/png",
  "width": 1920,
  "height": 1080,
  "alt": "Screenshot of the checkout page"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"image"` | Yes | |
| `uri` | `string` | Yes* | `gs://` or `https://` URI |
| `data_base64` | `string` | Yes* | Base64-encoded image data |
| `mime` | `string` | No | MIME type (default: `image/png`) |
| `width` | `integer` | No | Width in pixels |
| `height` | `integer` | No | Height in pixels |
| `alt` | `string` | No | Alt text description |

*Either `uri` or `data_base64` is required.

### Audio

```json
{
  "type": "audio",
  "uri": "gs://bucket/path/recording.wav",
  "mime": "audio/wav",
  "duration_ms": 5000,
  "sample_rate_hz": 16000,
  "transcript": "Hello, how can I help you?"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"audio"` | Yes | |
| `uri` | `string` | Yes* | URI |
| `data_base64` | `string` | Yes* | Base64-encoded audio |
| `mime` | `string` | No | MIME type (default: `audio/mpeg`) |
| `duration_ms` | `integer` | No | Duration in milliseconds |
| `sample_rate_hz` | `integer` | No | Sample rate |
| `transcript` | `string` | No | Text transcript |

*Either `uri` or `data_base64` is required.

### Video

```json
{
  "type": "video",
  "uri": "gs://bucket/path/clip.mp4",
  "mime": "video/mp4",
  "duration_ms": 10000,
  "width": 1280,
  "height": 720,
  "fps": 30.0,
  "poster_uri": "gs://bucket/path/poster.jpg"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"video"` | Yes | |
| `uri` | `string` | Yes | URI |
| `mime` | `string` | No | MIME type (default: `video/mp4`) |
| `duration_ms` | `integer` | No | Duration in milliseconds |
| `width` | `integer` | No | Width in pixels |
| `height` | `integer` | No | Height in pixels |
| `fps` | `number` | No | Frames per second |
| `poster_uri` | `string` | No | Thumbnail image URI |

### Sensor

```json
{
  "type": "sensor",
  "modality": "joint_state",
  "uri": "gs://bucket/path/joints.parquet",
  "mime": "application/octet-stream",
  "rate_hz": 100.0,
  "shape": [7],
  "units": "radians"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"sensor"` | Yes | |
| `modality` | `string` | Yes | See modality table below |
| `uri` | `string` | Yes | URI |
| `mime` | `string` | No | MIME type |
| `rate_hz` | `number` | No | Sampling rate in Hz |
| `shape` | `integer[]` | No | Data shape (e.g. `[7]` for 7-DOF joint state) |
| `units` | `string` | No | Measurement units |

**Sensor modalities:**

| Modality | Description |
|----------|-------------|
| `joint_state` | Robot joint angles/velocities |
| `pose` | 6-DOF position and orientation |
| `imu` | Inertial measurement unit data |
| `lidar` | LiDAR point cloud |
| `depth` | Depth image/map |
| `force_torque` | Force/torque sensor |
| `gripper` | Gripper state |
| `camera` | Camera image stream |
| `tactile` | Tactile sensor |
| `custom` | Any other sensor type |

### File

```json
{
  "type": "file",
  "uri": "gs://bucket/path/output.json",
  "mime": "application/json",
  "name": "output.json",
  "size_bytes": 4096
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"file"` | Yes | |
| `uri` | `string` | Yes | URI |
| `mime` | `string` | No | MIME type (default: `application/octet-stream`) |
| `name` | `string` | No | Original filename |
| `size_bytes` | `integer` | No | File size in bytes |

---

## Tool Calls

Tool calls represent function invocations by an LLM or agent.

```json
{
  "id": "tc_01HW...",
  "name": "browser.click",
  "arguments": { "selector": "#buy-button" },
  "result": { "ok": true, "element": "button" },
  "latency_ms": 250
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique tool call ID |
| `name` | `string` | Yes | Tool/function name (max 256 chars) |
| `arguments` | `object \| string` | No | Arguments passed to the tool |
| `result` | `any` | No | Return value (object, array, string, number, boolean, or null) |
| `error` | `string` | No | Error message if the tool call failed |
| `started_at` | `datetime` | No | ISO 8601 timestamp |
| `ended_at` | `datetime` | No | ISO 8601 timestamp |
| `latency_ms` | `integer` | No | Execution time in milliseconds |

The `arguments` field accepts either a structured object or a raw JSON string (as emitted by some providers).

---

## Sensor Frames

Sensor frames are used in `robotics` steps to capture time-series sensor data.

```json
{
  "modality": "joint_state",
  "uri": "gs://bucket/path/joints.parquet",
  "mime": "application/octet-stream",
  "fps": 100.0,
  "duration_ms": 2000,
  "shape": [7],
  "units": "radians",
  "started_at": "2026-04-15T12:00:00Z",
  "ended_at": "2026-04-15T12:00:02Z",
  "metadata": { "robot": "franka-emika", "controller": "impedance" }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `modality` | `string` | Yes | Same values as [sensor content part](#sensor) |
| `uri` | `string` | Yes | GCS or HTTPS URI |
| `mime` | `string` | No | MIME type |
| `fps` | `number` | No | Frames/samples per second |
| `rate_hz` | `number` | No | Sampling rate in Hz |
| `duration_ms` | `integer` | No | Duration in milliseconds |
| `shape` | `integer[]` | No | Data shape |
| `units` | `string` | No | Measurement units |
| `started_at` | `datetime` | No | Capture start time |
| `ended_at` | `datetime` | No | Capture end time |
| `metadata` | `object` | No | Free-form metadata |

---

## Annotations

Annotations capture human or automated judgments on traces, steps, messages, tool calls, or attachments.

```json
{
  "id": "ann_01HW...",
  "kind": "score",
  "author_email": "reviewer@example.com",
  "target": "step",
  "target_id": "st_001",
  "score": 0.85,
  "text": "Good response but slightly verbose",
  "created_at": "2026-04-15T14:00:00Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique annotation ID |
| `kind` | `string` | Yes | `comment`, `label`, `score`, `rating`, or `correction` |
| `author_id` | `string` | No | Author user ID |
| `author_email` | `string` | No | Author email |
| `target` | `string` | No | `trace`, `step`, `message`, `tool_call`, or `attachment` (default: `trace`) |
| `target_id` | `string` | No | ID of the target element |
| `text` | `string` | No | Free-text comment |
| `label` | `string` | No | Categorical label |
| `score` | `number` | No | Numeric score |
| `rating` | `string` | No | `up`, `down`, or `neutral` |
| `created_at` | `datetime` | No | ISO 8601 timestamp |
| `metadata` | `object` | No | Free-form metadata |

---

## Token Usage

Token usage is reported at both the step and trace level.

```json
{
  "input": 900,
  "output": 120,
  "total": 1020,
  "cached_input": 500,
  "reasoning": 50
}
```

| Field | Type | Description |
|-------|------|-------------|
| `input` | `integer` | Input/prompt tokens |
| `output` | `integer` | Output/completion tokens |
| `total` | `integer` | Total tokens (input + output, or as reported by the provider) |
| `cached_input` | `integer` | Tokens served from cache (e.g. Anthropic prompt caching) |
| `reasoning` | `integer` | Reasoning/thinking tokens (e.g. o1-style models) |

The SDKs automatically aggregate step-level token usage to the trace level if not explicitly set.

---

## Example Trace

A complete trace JSON for a multimodal agent that browses the web, takes a screenshot, calls an LLM, and uses a tool:

```json
{
  "schema_version": "1.0",
  "trace_id": "tr_01HWfull001",
  "project_id": "proj_abc",
  "name": "checkout-agent",
  "run_id": "run_eval_042",
  "run_type": "eval",
  "use_case": "e-commerce",
  "user_id": "user_456",
  "platform": "web",
  "model": "claude-sonnet-4-6",
  "status": "success",
  "tags": ["checkout", "v2", "multimodal"],
  "metadata": {
    "environment": "staging",
    "version": "2.1.0"
  },
  "started_at": "2026-04-15T12:00:00.000Z",
  "ended_at": "2026-04-15T12:00:05.500Z",
  "latency_ms": 5500,
  "token_usage": {
    "input": 2100,
    "output": 350,
    "total": 2450
  },
  "cost_usd": 0.0089,
  "steps": [
    {
      "step_id": "st_plan001",
      "index": 0,
      "type": "llm",
      "name": "plan",
      "model": "claude-sonnet-4-6",
      "status": "success",
      "started_at": "2026-04-15T12:00:00.000Z",
      "ended_at": "2026-04-15T12:00:02.000Z",
      "latency_ms": 2000,
      "messages": [
        {
          "role": "user",
          "content": [
            { "type": "text", "text": "Buy a carton of milk from the grocery store website." },
            {
              "type": "image",
              "uri": "gs://theta-obs/p/proj_abc/tr/tr_01HWfull001/att/screenshot_home.png",
              "mime": "image/png",
              "width": 1920,
              "height": 1080
            }
          ]
        },
        {
          "role": "assistant",
          "content": [
            { "type": "text", "text": "I can see the grocery store homepage. I'll search for milk and add it to the cart." }
          ]
        }
      ],
      "token_usage": {
        "input": 1500,
        "output": 200,
        "total": 1700
      }
    },
    {
      "step_id": "st_search001",
      "parent_step_id": null,
      "index": 1,
      "type": "tool",
      "name": "browser.type",
      "status": "success",
      "started_at": "2026-04-15T12:00:02.000Z",
      "ended_at": "2026-04-15T12:00:03.000Z",
      "latency_ms": 1000,
      "tool_calls": [
        {
          "id": "tc_type001",
          "name": "browser.type",
          "arguments": { "selector": "#search-input", "text": "whole milk" },
          "result": { "ok": true }
        },
        {
          "id": "tc_click001",
          "name": "browser.click",
          "arguments": { "selector": "#search-button" },
          "result": { "ok": true, "navigation": true }
        }
      ]
    },
    {
      "step_id": "st_decide001",
      "index": 2,
      "type": "llm",
      "name": "decide",
      "model": "claude-sonnet-4-6",
      "status": "success",
      "started_at": "2026-04-15T12:00:03.000Z",
      "ended_at": "2026-04-15T12:00:04.500Z",
      "latency_ms": 1500,
      "messages": [
        {
          "role": "user",
          "content": [
            { "type": "text", "text": "Search results loaded. Which product should I select?" },
            {
              "type": "image",
              "uri": "gs://theta-obs/p/proj_abc/tr/tr_01HWfull001/att/screenshot_results.png",
              "mime": "image/png"
            }
          ]
        },
        {
          "role": "assistant",
          "content": [
            { "type": "text", "text": "I'll select the 'Organic Whole Milk - 1 Gallon' at $4.99. Clicking add to cart." }
          ]
        }
      ],
      "token_usage": {
        "input": 600,
        "output": 150,
        "total": 750
      }
    },
    {
      "step_id": "st_cart001",
      "index": 3,
      "type": "tool",
      "name": "browser.click",
      "status": "success",
      "started_at": "2026-04-15T12:00:04.500Z",
      "ended_at": "2026-04-15T12:00:05.500Z",
      "latency_ms": 1000,
      "tool_calls": [
        {
          "id": "tc_add001",
          "name": "browser.click",
          "arguments": { "selector": ".product-card:first-child .add-to-cart" },
          "result": { "ok": true, "cart_count": 1 }
        }
      ]
    }
  ],
  "annotations": [
    {
      "id": "ann_eval001",
      "kind": "score",
      "target": "trace",
      "score": 1.0,
      "text": "Task completed successfully",
      "created_at": "2026-04-15T13:00:00Z"
    }
  ]
}
```

---

*See also: [Python SDK](./python-sdk.md) | [Node.js SDK](./node-sdk.md) | [REST API Reference](./api-reference.md)*
