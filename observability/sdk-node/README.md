# @theta/observability

TypeScript SDK for [Theta Observability](https://theta.observability) — a multimodal tracing platform for AI agents.

- Text, image, audio, video, and robotics sensor traces.
- Per-step token usage, cost, and timing.
- First-class integrations with OpenAI, Anthropic, and Next.js.
- Dual ESM + CJS, Node 20+.
- Fails soft: SDK errors are logged, never thrown into your code.

## Install

```sh
npm install @theta/observability
```

## Quickstart

```ts
import { TraceClient } from "@theta/observability";

const client = new TraceClient({ apiKey: process.env.THETA_API_KEY!, project: "proj_abc" });

await client.trace(
  { name: "checkout", runType: "eval", metadata: { gitSha } },
  async (t) => {
    await t.step({ name: "plan", type: "llm", model: "claude-opus-4.6" }, async (s) => {
      s.logMessage({ role: "user", text: "Buy milk", images: [buf] });
      s.logToolCall({ name: "browser.click", arguments: { selector: "#buy" } });
      s.setTokenUsage({ input: 900, output: 120 });
    });
    await t.attachImage(screenshotBuf);
  },
);
```

## Zero-config

Set `THETA_API_KEY` and `THETA_PROJECT` in your environment and use the module-level `trace()`:

```ts
import { trace } from "@theta/observability";

await trace("my-agent", async (t) => {
  await t.step({ name: "think", type: "llm" }, async (s) => {
    s.logMessage({ role: "user", text: "hi" });
  });
});
```

## OpenAI

```ts
import OpenAI from "openai";
import { wrapOpenAI } from "@theta/observability/openai";

const openai = wrapOpenAI(new OpenAI());

// Every chat.completions.create call auto-emits an `llm` step.
const res = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "ping" }],
});
```

Streaming is transparently instrumented too.

## Anthropic

```ts
import Anthropic from "@anthropic-ai/sdk";
import { wrapAnthropic } from "@theta/observability/anthropic";

const anthropic = wrapAnthropic(new Anthropic());
```

## Next.js

```ts
// app/api/checkout/route.ts
import { withTrace } from "@theta/observability/next";

export const POST = withTrace(
  async (req: Request) => {
    // ...
    return Response.json({ ok: true });
  },
  { name: "api/checkout" },
);
```

## API

### `new TraceClient(opts)`

| option | default | description |
| --- | --- | --- |
| `apiKey` | `THETA_API_KEY` | Per-project API key. |
| `project` | `THETA_PROJECT` | Project ID. |
| `baseUrl` | `THETA_BASE_URL` or `https://api.theta.observability` | Ingest endpoint. |
| `flushInterval` | `1000` | Background flush interval (ms). |
| `maxBatch` | `20` | Force flush after N queued traces. |
| `timeout` | `30000` | Per-request timeout (ms). |
| `debug` | `THETA_DEBUG` | Log SDK errors to stderr. |

### Trace handle

- `t.step({ name, type, model? }, async (s) => { ... })` — auto-parented nested step.
- `t.attachImage(src) / attachAudio / attachVideo / attachFile` — accepts `Buffer`, `Uint8Array`, `Blob`, file path, URL (`https://` or `gs://`), or `ReadableStream`.
- `t.setTokenUsage({ input, output })`, `t.setCost(usd)`.

### Step handle

- `s.logMessage({ role, text?, images?, attachments? })`
- `s.logToolCall({ name, arguments, result?, error? })`
- `s.setTokenUsage(...)`, `s.setCost(...)`

### Helpers

- `observe(fn, { name, type })` — wrap any async function into a step.
- `withTrace(handler, { name })` — Next.js route helper.
- `client.flush()` / `client.shutdown()` — drain the batch queue.

## License

Apache-2.0
