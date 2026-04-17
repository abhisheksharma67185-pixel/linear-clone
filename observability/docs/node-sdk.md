# Node.js / TypeScript SDK Reference

Complete reference for the `@theta/observability` Node.js SDK.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Core Concepts](#core-concepts)
- [Basic Usage](#basic-usage)
- [Zero-Config Mode](#zero-config-mode)
- [Agent Wrapping](#agent-wrapping)
- [Metrics](#metrics)
- [Multimodal Attachments](#multimodal-attachments)
- [LLM Integrations](#llm-integrations)
- [Error Handling](#error-handling)
- [Full API Reference](#full-api-reference)

---

## Installation

```bash
npm install @theta/observability
```

**Requirements:** Node.js 18+ (uses `fetch`, `AsyncLocalStorage`, `AbortSignal.timeout`).

Dual ESM + CJS build. TypeScript types are included.

---

## Configuration

### Explicit client

```typescript
import { TraceClient } from "@theta/observability";

const client = new TraceClient({
  apiKey: "tk_live_...",
  project: "proj_abc",
  baseUrl: "https://api.theta-observability.com", // optional
});
```

### Environment variables

The SDK reads these environment variables as fallbacks:

| Variable | Description | Default |
|----------|-------------|---------|
| `THETA_API_KEY` | API key for authentication | Required (unless `disabled`) |
| `THETA_PROJECT` | Project ID (e.g. `proj_abc`) | Required (unless `disabled`) |
| `THETA_BASE_URL` | API base URL | `https://api.theta-observability.com` |
| `THETA_DEBUG` | Enable debug logging (`"1"` or `"true"`) | `false` |

### Constructor options

```typescript
interface TraceClientOptions {
  apiKey?: string;
  project?: string;
  baseUrl?: string;
  flushInterval?: number;  // ms, default: 1000
  maxBatch?: number;       // default: 20
  timeout?: number;        // ms, default: 30000
  debug?: boolean;         // default: false
  disabled?: boolean;      // default: false
  fetchImpl?: typeof fetch; // custom fetch for testing
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | `THETA_API_KEY` env | API key |
| `project` | `string` | `THETA_PROJECT` env | Project ID |
| `baseUrl` | `string` | `THETA_BASE_URL` env or production URL | API base URL |
| `flushInterval` | `number` | `1000` | Milliseconds between batch flushes |
| `maxBatch` | `number` | `20` | Max traces queued before forced flush |
| `timeout` | `number` | `30000` | Per-request timeout in milliseconds |
| `debug` | `boolean` | `false` | Log warnings to console |
| `disabled` | `boolean` | `false` | Disable all network I/O (for tests) |
| `fetchImpl` | `typeof fetch` | `globalThis.fetch` | Custom fetch implementation |

If `apiKey` or `project` is missing and `disabled` is `false`, the client auto-disables with a debug warning. This ensures your application never crashes due to missing observability credentials.

---

## Core Concepts

### Traces

A **trace** is the top-level unit of observability representing one complete agent run. Traces have a unique `trace_id` with a `tr_` prefix. In the Node SDK, traces use an async callback pattern:

```typescript
await client.trace({ name: "my-agent" }, async (t) => {
  // Your code here -- t is the Trace object
});
```

### Steps

**Steps** are nested spans within a trace. They also use the async callback pattern:

| Step Type | Description |
|-----------|-------------|
| `llm` | A language model call |
| `tool` | A tool or function invocation |
| `retrieval` | A retrieval / RAG lookup |
| `robotics` | A robotics action or sensor reading |
| `human` | A human-in-the-loop interaction |
| `annotation` | An annotation or labeling step |
| `custom` | Any other step type |

### Messages

Messages follow the chat-message format with typed content parts (text, image, audio, video, sensor, file).

### Attachments

Media is uploaded automatically via the ingest API proxy. Sources can be file paths, Buffers, Blobs, ReadableStreams, or URLs.

---

## Basic Usage

```typescript
import { TraceClient } from "@theta/observability";

const client = new TraceClient({
  apiKey: process.env.THETA_API_KEY!,
  project: "proj_abc",
});

await client.trace(
  { name: "checkout-agent", runType: "prod" },
  async (t) => {
    // LLM step
    await t.step(
      { name: "plan", type: "llm", model: "claude-sonnet-4-6" },
      async (s) => {
        s.logMessage({ role: "user", text: "Buy milk from the grocery store" });
        s.logMessage({
          role: "assistant",
          text: "I'll navigate to the grocery website and add milk to cart.",
        });
        s.setTokenUsage({ input: 150, output: 45 });
      },
    );

    // Tool step
    await t.step({ name: "execute", type: "tool" }, async (s) => {
      s.logToolCall({
        name: "browser.click",
        arguments: { selector: "#add-to-cart" },
        result: { ok: true },
      });
    });
  },
);
```

### Trace input

```typescript
interface TraceInput {
  name: string;         // Required: human-readable name
  runId?: string;       // Group related traces
  runType?: string;     // prod | eval | dev | test | replay | backfill | other
  useCase?: string;     // Categorize by use case
  userId?: string;      // End-user identifier
  group?: string;       // Grouping key
  platform?: string;    // web | mobile | desktop | server | robot | sim | cli | other
  model?: string;       // Primary model used
  tags?: string[];      // Free-form tags
  metadata?: Record<string, unknown>; // Arbitrary key-value pairs
}
```

### Step input

```typescript
interface StepInput {
  name: string;         // Step name
  type: StepType;       // llm | tool | retrieval | robotics | human | annotation | custom
  model?: string;       // Model identifier (for llm steps)
  metadata?: Record<string, unknown>;
}
```

### Nested steps

Parent-child relationships are tracked automatically via `AsyncLocalStorage`:

```typescript
await client.trace({ name: "research-agent" }, async (t) => {
  await t.step({ name: "research", type: "custom" }, async (parent) => {
    await t.step({ name: "search", type: "retrieval" }, async (child) => {
      child.logMessage({ role: "user", text: "quantum computing applications" });
    });

    await t.step({ name: "synthesize", type: "llm", model: "gpt-4o" }, async (child) => {
      child.logMessage({ role: "user", text: "Summarize the findings" });
      child.logMessage({ role: "assistant", text: "Key applications include..." });
      child.setTokenUsage({ input: 2000, output: 500 });
    });
  });
});
```

---

## Zero-Config Mode

Use the module-level `trace()` function with environment variables:

```typescript
import { trace } from "@theta/observability";

await trace("my-agent", async (t) => {
  await t.step({ name: "plan", type: "llm", model: "gpt-4o" }, async (s) => {
    s.logMessage({ role: "user", text: "Hello" });
    s.logMessage({ role: "assistant", text: "Hi there!" });
    s.setTokenUsage({ input: 10, output: 5 });
  });
});
```

You can also pass a full `TraceInput` object:

```typescript
await trace({ name: "my-agent", runType: "eval", tags: ["v2"] }, async (t) => {
  // ...
});
```

### Module-level flush

```typescript
import { flush } from "@theta/observability";

await flush(); // Flush the default client's queue
```

---

## Agent Wrapping

The `wrapAgent` method creates a traced wrapper around your agent function. Every call automatically creates a trace and returns `{ result, runId }`.

```typescript
const agent = client.wrapAgent(
  "support-agent",
  async (ctx, input: string) => {
    // ctx.trace is the live Trace object
    const reply = await ctx.trace.step(
      { name: "respond", type: "llm", model: "gpt-4o" },
      async (s) => {
        s.logMessage({ role: "user", text: input });
        const answer = await callLLM(input);
        s.logMessage({ role: "assistant", text: answer });
        return answer;
      },
    );

    // Signal completion -- stores output in trace metadata
    ctx.onComplete(reply);
    return reply;
  },
);

const { result, runId } = await agent("How do I reset my password?");
console.log(`Answer: ${result}`);
console.log(`Trace ID: ${runId}`);
```

### AgentContext

```typescript
interface AgentContext {
  trace: Trace;                      // The live trace for this invocation
  runId: string;                     // The trace ID
  onComplete(result: unknown): void; // Store the agent output in trace metadata
}
```

### AgentResult

```typescript
interface AgentResult<TOutput> {
  result: TOutput | undefined; // undefined if the agent threw
  runId: string;               // Trace ID -- always available, even on failure
}
```

### Type safety

`wrapAgent` is fully generic:

```typescript
const agent = client.wrapAgent<string, { answer: string; confidence: number }>(
  "typed-agent",
  async (ctx, input) => {
    // input is typed as string
    const answer = await process(input);
    return { answer, confidence: 0.95 }; // return type is enforced
  },
);

const { result } = await agent("query");
// result is typed as { answer: string; confidence: number } | undefined
```

---

## Metrics

Record evaluation metrics against any trace. Metrics are fail-soft -- errors are logged in debug mode but never thrown.

### Record a metric event

```typescript
// Boolean pass/fail
await client.recordMetric("task_adherence", traceId, { passed: true });

// Numeric score
await client.recordMetric("user_satisfaction", traceId, { score: 0.95 });

// Categorical label
await client.recordMetric("sentiment", traceId, { label: "positive" });

// Combined
await client.recordMetric("quality", traceId, { passed: true, score: 0.88 });
```

### Create a metric definition

```typescript
await client.createMetric("task_adherence", {
  type: "automated",
  evaluatorPrompt: "Did the agent complete the requested task? Answer pass or fail.",
});
```

### CreateMetricOptions

```typescript
interface CreateMetricOptions {
  type?: string;                     // "automated" | "human" | "hybrid" etc.
  evaluatorPrompt?: string;          // LLM prompt for automated evaluation
  metadata?: Record<string, unknown>;
}
```

---

## Multimodal Attachments

### Trace-level attachments

```typescript
await client.trace({ name: "vision-agent" }, async (t) => {
  // Image -- from file path
  await t.attachImage("screenshot.png");

  // Audio -- from Buffer
  const audioBuffer = await fs.readFile("recording.wav");
  await t.attachAudio(audioBuffer, { mime: "audio/wav" });

  // Video -- from file path
  await t.attachVideo("clip.mp4");

  // Generic file
  await t.attachFile("output.json", { mime: "application/json" });
});
```

### Step-level attachments

```typescript
await client.trace({ name: "agent" }, async (t) => {
  await t.step({ name: "analyze", type: "llm", model: "gpt-4o" }, async (s) => {
    // Attach image to the step
    await s.attachImage("screenshot.png");

    // Log message with inline images
    s.logMessage({
      role: "user",
      text: "What is in this image?",
      images: ["screenshot.png"],
    });
  });
});
```

### Supported attachment sources

The `AttachmentSource` type accepts:

| Source Type | Example |
|-------------|---------|
| File path (`string`) | `"screenshot.png"` |
| URL (`string`) | `"https://example.com/image.png"` |
| GCS URI (`string`) | `"gs://bucket/path/image.png"` |
| `Buffer` | `Buffer.from(...)` |
| `Uint8Array` | `new Uint8Array(...)` |
| `Blob` | `new Blob([data])` |
| `ReadableStream` | `fs.createReadStream(...)` |
| Wrapped object | `{ data: Buffer, mime: "image/png", filename: "photo.png" }` |

URLs and GCS URIs are referenced directly without re-uploading. All other sources are streamed through the ingest API's upload proxy.

### Pre-uploading attachments

If you need to upload media before a trace exists:

```typescript
const attachment = await client.upload("image", "screenshot.png");
// Use `attachment` later in a trace or message
```

---

## LLM Integrations

### OpenAI

```typescript
import OpenAI from "openai";
import { TraceClient } from "@theta/observability";
import { wrapOpenAI } from "@theta/observability/integrations/openai";

const client = new TraceClient();
const openai = wrapOpenAI(new OpenAI(), { client });

await client.trace({ name: "chat" }, async (t) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Explain quantum computing" }],
  });
});
```

The integration automatically:
- Creates an `llm` step named `openai.chat` (customizable via `name` option)
- Logs all input messages converted to Theta format (including image content parts)
- Logs the assistant response
- Captures token usage
- Handles streaming -- collects chunks and records the full response on stream end
- Creates a new trace if called outside an active trace context

**Streaming:**

```typescript
await client.trace({ name: "streaming" }, async (t) => {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Write a poem" }],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
  }
  // Token usage and full response captured on stream end
});
```

**Options:**

```typescript
interface WrapOpenAIOptions {
  client?: TraceClient;  // Uses default client if omitted
  name?: string;         // Step name (default: "openai.chat")
}
```

The `wrapOpenAI` function returns a `Proxy` -- the original client object is not mutated.

### Anthropic

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { TraceClient } from "@theta/observability";
import { wrapAnthropic } from "@theta/observability/integrations/anthropic";

const client = new TraceClient();
const anthropic = wrapAnthropic(new Anthropic(), { client });

await client.trace({ name: "claude-chat" }, async (t) => {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Hello, Claude" }],
  });
});
```

The integration:
- Creates an `llm` step named `anthropic.messages` (customizable)
- Converts Anthropic messages to Theta format (text blocks, image blocks with base64/URL)
- Captures system prompts as a system-role message
- Logs the assistant response
- Captures token usage (`input_tokens`, `output_tokens`)
- Handles streaming (`content_block_delta`, `message_delta`, `message_start` events)
- Returns a Proxy -- the original client is not mutated

**Options:**

```typescript
interface WrapAnthropicOptions {
  client?: TraceClient;  // Uses default client if omitted
  name?: string;         // Step name (default: "anthropic.messages")
}
```

---

## Error Handling

### Automatic error capture

When an exception occurs inside a trace or step callback, the status is automatically set to `"error"` and the error message is recorded. The exception is re-thrown to the caller:

```typescript
try {
  await client.trace({ name: "agent" }, async (t) => {
    await t.step({ name: "risky", type: "tool" }, async (s) => {
      throw new Error("Something went wrong");
      // Step status = "error", errorMessage = "Something went wrong"
    });
    // Trace status = "error", errorMessage = "Something went wrong"
  });
} catch (err) {
  // Exception propagates normally
}
```

### Fail-soft design

The batch sender, metric recording, media uploads, and LLM integrations are all fail-soft. Errors are:
- Logged to console in debug mode
- Silently swallowed in production mode
- Never thrown into your application code

### Graceful shutdown

```typescript
// Flush all pending traces
await client.flush();

// Flush + tear down the batch sender
await client.shutdown();
```

Call `shutdown()` in short-lived scripts, serverless functions, or test teardown to ensure all traces are delivered.

### Disabled mode

When `disabled: true` or credentials are missing, all SDK operations become no-ops:

```typescript
const client = new TraceClient({ disabled: true });

// These all execute instantly with no network I/O
await client.trace({ name: "agent" }, async (t) => {
  await t.step({ name: "plan", type: "llm" }, async (s) => {
    s.logMessage({ role: "user", text: "Hello" });
  });
});
```

---

## Full API Reference

### TraceClient

```typescript
class TraceClient {
  constructor(opts?: TraceClientOptions);

  readonly apiKey: string;
  readonly project: string;
  readonly baseUrl: string;
  readonly debug: boolean;
  readonly disabled: boolean;
}
```

| Method | Returns | Description |
|--------|---------|-------------|
| `trace(input, fn)` | `Promise<T>` | Create a trace and run `fn` inside it |
| `upload(type, source, overrides?)` | `Promise<Attachment>` | Upload media independently |
| `wrapAgent(name, fn)` | `WrappedAgent<TInput, TOutput>` | Wrap an agent function |
| `recordMetric(metricIdOrName, traceId, value)` | `Promise<void>` | Record a metric event (fail-soft) |
| `createMetric(name, opts?)` | `Promise<void>` | Create a metric definition (fail-soft) |
| `flush()` | `Promise<void>` | Flush queued traces |
| `shutdown()` | `Promise<void>` | Flush + tear down batch sender |

### Trace

```typescript
class Trace {
  readonly id: string;          // trace_id (e.g. "tr_01HW...")
  readonly name: string;
  status: TraceStatus;          // "running" | "success" | "error"
}
```

| Method | Returns | Description |
|--------|---------|-------------|
| `step(input, fn)` | `Promise<T>` | Create a child step and run `fn` inside it |
| `attachImage(source, meta?)` | `Promise<Attachment>` | Attach an image |
| `attachAudio(source, meta?)` | `Promise<Attachment>` | Attach audio |
| `attachVideo(source, meta?)` | `Promise<Attachment>` | Attach video |
| `attachFile(source, meta?)` | `Promise<Attachment>` | Attach a generic file |
| `attach(type, source, meta?)` | `Promise<Attachment>` | Attach any media type |
| `setTokenUsage(usage)` | `void` | Set trace-level token usage |
| `setCost(usd)` | `void` | Set trace cost in USD |
| `setStatus(status, errorMessage?)` | `void` | Override trace status |

### Step

```typescript
class Step {
  readonly id: string;          // step_id (e.g. "st_01HW...")
  readonly name: string;
  readonly type: StepType;
  status: TraceStatus;
}
```

| Method | Returns | Description |
|--------|---------|-------------|
| `logMessage(input)` | `void` | Append a chat message |
| `logToolCall(input)` | `void` | Log a tool invocation |
| `attachImage(source, meta?)` | `Promise<Attachment>` | Attach an image |
| `attach(type, source, meta?)` | `Promise<Attachment>` | Attach any media type |
| `setTokenUsage(usage)` | `void` | Set token counts |
| `setCost(usd)` | `void` | Set step cost in USD |
| `setMetadata(meta)` | `void` | Merge key-value pairs into step metadata |

### LogMessageInput

```typescript
interface LogMessageInput {
  role: "system" | "user" | "assistant" | "tool";
  text?: string;
  images?: AttachmentSource[];       // Uploaded lazily
  attachments?: AttachmentSource[];  // Uploaded lazily
  name?: string;
  toolCallId?: string;
  metadata?: Record<string, unknown>;
}
```

### LogToolCallInput

```typescript
interface LogToolCallInput {
  name: string;
  arguments?: unknown;
  result?: unknown;
  error?: string;
  id?: string;    // Auto-generated if omitted
}
```

### Module-level functions

| Function | Description |
|----------|-------------|
| `trace(name \| TraceInput, fn)` | Zero-config trace using default client |
| `flush()` | Flush the default client's queue |
| `getDefaultClient()` | Return or lazily create the default client |
| `setDefaultClient(client)` | Override the default client |

---

*See also: [Python SDK](./python-sdk.md) | [REST API Reference](./api-reference.md) | [Trace Schema](./trace-schema.md)*
