import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function NodeTracesPage() {
  return (
    <>
      <h1>Traces & Steps</h1>
      <p>
        The Node.js SDK uses a callback-based API for traces and steps. The callback
        receives the trace or step object, and the SDK handles lifecycle management
        (start, finish, error capture, flush) automatically.
      </p>

      <h2>TraceClient</h2>
      <CodeBlock lang="typescript" title="Initialize">
        {`import { TraceClient } from "@theta/observability";

const client = new TraceClient({
  apiKey: "tobs_live_...",       // or THETA_API_KEY env var
  project: "proj_...",           // or THETA_PROJECT env var
  baseUrl: "https://api.theta-observability.com",  // or THETA_BASE_URL
  flushInterval: 1000,           // ms between auto-flushes
  maxBatch: 20,                  // max traces per batch
  timeout: 30000,                // HTTP timeout in ms
  debug: false,                  // enable debug logging
  disabled: false,               // disable all network I/O
});`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "apiKey", type: "string", description: "API key for authentication. Falls back to THETA_API_KEY env var." },
          { name: "project", type: "string", description: "Project ID. Falls back to THETA_PROJECT env var." },
          { name: "baseUrl", type: "string", description: "API base URL. Falls back to THETA_BASE_URL.", default: "https://api.theta-observability.com" },
          { name: "flushInterval", type: "number", description: "Milliseconds between background flushes.", default: "1000" },
          { name: "maxBatch", type: "number", description: "Max queued traces before forced flush.", default: "20" },
          { name: "timeout", type: "number", description: "HTTP timeout in milliseconds.", default: "30000" },
          { name: "debug", type: "boolean", description: "Enable verbose logging.", default: "false" },
          { name: "disabled", type: "boolean", description: "Disable all network I/O (useful for tests).", default: "false" },
        ]}
      />

      <Callout type="info" title="Auto-disable">
        <p>
          If <code>apiKey</code> or <code>project</code> is missing, the client auto-disables
          instead of throwing. This means your app never crashes due to missing observability
          config in development.
        </p>
      </Callout>

      <h2>Creating a Trace</h2>
      <p>
        Use <code>client.trace(input, fn)</code>. The trace is committed when the callback
        resolves. Exceptions are captured into the trace status and re-thrown.
      </p>
      <CodeBlock lang="typescript">
        {`await client.trace(
  {
    name: "checkout-agent",
    runType: "prod",
    userId: "usr_abc",
    tags: ["checkout", "v2"],
    metadata: { sessionId: "sess_123" },
  },
  async (t) => {
    // ... add steps here
  },
);`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "name", type: "string", required: true, description: "Human-readable trace name." },
          { name: "runId", type: "string", description: "Group related traces under one run ID." },
          { name: "runType", type: "string", description: "Classify the run: 'prod', 'staging', 'eval', 'agent'." },
          { name: "useCase", type: "string", description: "Use case label for filtering." },
          { name: "userId", type: "string", description: "End-user identifier." },
          { name: "group", type: "string", description: "Group label for segmentation." },
          { name: "platform", type: "string", description: "Platform label (e.g. 'web', 'ios')." },
          { name: "model", type: "string", description: "Primary model used in this trace." },
          { name: "tags", type: "string[]", description: "Arbitrary string tags." },
          { name: "metadata", type: "Record<string, unknown>", description: "Arbitrary key-value metadata." },
        ]}
      />

      <h2>Adding Steps</h2>
      <p>
        Steps use the same callback pattern. Parent-child relationships are automatically
        tracked via <code>AsyncLocalStorage</code>.
      </p>
      <CodeBlock lang="typescript">
        {`await client.trace({ name: "my-agent" }, async (t) => {
  await t.step({ name: "plan", type: "llm", model: "gpt-4o" }, async (s) => {
    s.logMessage({ role: "user", text: "What should we do?" });
    s.logMessage({ role: "assistant", text: "Let me think..." });
    s.setTokenUsage({ input: 50, output: 25 });
  });

  await t.step({ name: "execute", type: "tool" }, async (s) => {
    s.logToolCall({
      name: "search_db",
      arguments: { query: "user preferences" },
      result: { count: 42 },
    });
  });

  // Nested steps
  await t.step({ name: "outer", type: "custom" }, async (outer) => {
    await t.step({ name: "inner", type: "llm" }, async (inner) => {
      // inner's parentStepId is automatically set to outer's ID
      inner.logMessage({ role: "assistant", text: "Nested!" });
    });
  });
});`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "name", type: "string", required: true, description: "Step name." },
          { name: "type", type: "StepType", required: true, description: "Step type: 'llm', 'tool', 'retrieval', 'custom'." },
          { name: "model", type: "string", description: "Model identifier (for LLM steps)." },
          { name: "metadata", type: "Record<string, unknown>", description: "Arbitrary key-value metadata." },
        ]}
      />

      <h2>Logging Messages</h2>
      <p>
        Use <code>s.logMessage()</code> to record chat-style messages within a step.
        Messages can include text, inline images, and file attachments.
      </p>
      <CodeBlock lang="typescript">
        {`await t.step({ name: "chat", type: "llm" }, async (s) => {
  s.logMessage({
    role: "user",
    text: "Describe this image",
    images: [Buffer.from(imageData)],
  });
  s.logMessage({ role: "assistant", text: "I see a cat on a desk." });
  s.logMessage({
    role: "tool",
    text: "Tool result here",
    toolCallId: "tc_123",
  });
});`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "role", type: '"system" | "user" | "assistant" | "tool"', required: true, description: "Message role." },
          { name: "text", type: "string", description: "Text content of the message." },
          { name: "images", type: "AttachmentSource[]", description: "Inline image attachments (uploaded lazily in the background)." },
          { name: "attachments", type: "AttachmentSource[]", description: "Inline file attachments (uploaded lazily in the background)." },
          { name: "name", type: "string", description: "Optional name (e.g. function name for tool messages)." },
          { name: "toolCallId", type: "string", description: "Tool call ID this message is responding to." },
          { name: "metadata", type: "Record<string, unknown>", description: "Arbitrary metadata on the message." },
        ]}
      />

      <h2>Logging Tool Calls</h2>
      <CodeBlock lang="typescript">
        {`await t.step({ name: "tools", type: "tool" }, async (s) => {
  s.logToolCall({
    name: "get_weather",
    arguments: { city: "San Francisco" },
    result: { temp: 65, condition: "foggy" },
  });
});`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "name", type: "string", required: true, description: "Tool function name." },
          { name: "arguments", type: "unknown", description: "Arguments passed to the tool." },
          { name: "result", type: "unknown", description: "Value returned by the tool." },
          { name: "error", type: "string", description: "Error message if the tool call failed." },
          { name: "id", type: "string", description: "Tool call ID. Auto-generated if not provided." },
        ]}
      />

      <h2>Token Usage</h2>
      <CodeBlock lang="typescript">
        {`s.setTokenUsage({ input: 500, output: 120 });
// total is auto-computed as input + output if not provided

// Or with explicit total
s.setTokenUsage({ input: 500, output: 120, total: 620 });`}
      </CodeBlock>

      <Callout type="info" title="Auto-aggregation">
        <p>
          Token usage set on individual steps is available in the trace payload.
          Use <code>t.setTokenUsage()</code> at the trace level to record
          aggregated totals.
        </p>
      </Callout>

      <h2>Step Metadata and Cost</h2>
      <CodeBlock lang="typescript">
        {`await t.step({ name: "call", type: "llm" }, async (s) => {
  s.setMetadata({ provider: "openai", temperature: 0.7 });
  s.setCost(0.002);
});`}
      </CodeBlock>

      <h2>Attachments</h2>
      <CodeBlock lang="typescript">
        {`await client.trace({ name: "visual" }, async (t) => {
  // Trace-level attachments
  await t.attachImage(Buffer.from(screenshotData));
  await t.attachAudio(fs.readFileSync("./recording.wav"));
  await t.attachVideo(fs.readFileSync("./demo.mp4"));
  await t.attachFile(fs.readFileSync("./report.pdf"), { mime: "application/pdf" });

  // Step-level attachment
  await t.step({ name: "analyze", type: "llm" }, async (s) => {
    await s.attachImage(Buffer.from(imageData));
  });
});`}
      </CodeBlock>

      <h2>Status and Errors</h2>
      <p>
        Step and trace status is automatically set to <code>"success"</code> on normal exit
        and <code>"error"</code> if an exception propagates through the callback.
        You can also set status manually:
      </p>
      <CodeBlock lang="typescript">
        {`await t.step({ name: "validate", type: "custom" }, async (s) => {
  s.setStatus("error", "Validation failed");
  // Or let an exception set it:
  // throw new Error("invalid input");
});

// Trace-level status
t.setStatus("error", "Agent failed to complete");`}
      </CodeBlock>

      <h2>Trace Metadata and Cost</h2>
      <CodeBlock lang="typescript">
        {`await client.trace({ name: "agent" }, async (t) => {
  t.setTokenUsage({ input: 1000, output: 200 });
  t.setCost(0.0045);
  t.setStatus("success");
});`}
      </CodeBlock>

      <h2>Zero-Config Module-Level API</h2>
      <CodeBlock lang="typescript">
        {`import { trace, flush } from "@theta/observability";

await trace("my-agent", async (t) => {
  await t.step({ name: "think", type: "llm" }, async (s) => {
    s.logMessage({ role: "assistant", text: "..." });
  });
});

// Flush pending traces
await flush();`}
      </CodeBlock>

      <h2>Environment Variables</h2>
      <p>
        The SDK reads these environment variables as defaults when no explicit
        constructor argument is provided:
      </p>
      <ParamTable
        params={[
          { name: "THETA_API_KEY", type: "string", description: "API key for authentication." },
          { name: "THETA_PROJECT", type: "string", description: "Project ID to scope traces to." },
          { name: "THETA_BASE_URL", type: "string", description: "API base URL override." },
          { name: "THETA_DEBUG", type: '"1" | "true"', description: 'Set to "1" or "true" to enable verbose debug logging.' },
        ]}
      />
      <CodeBlock lang="bash" title=".env">
        {`THETA_API_KEY=tobs_live_abc123
THETA_PROJECT=proj_xyz789
THETA_DEBUG=1`}
      </CodeBlock>

      <h2>Async Context for Nested Steps</h2>
      <p>
        The SDK uses Node.js <code>AsyncLocalStorage</code> to automatically track
        parent-child step relationships. When you call <code>t.step()</code> inside
        another step's callback, the inner step's <code>parentStepId</code> is
        automatically set. This works across <code>async/await</code> boundaries,
        <code>Promise.all()</code>, and any async control flow.
      </p>
      <CodeBlock lang="typescript">
        {`await client.trace({ name: "nested-demo" }, async (t) => {
  await t.step({ name: "parent", type: "custom" }, async () => {
    // Both of these become children of "parent"
    await Promise.all([
      t.step({ name: "child-a", type: "llm" }, async (s) => {
        s.logMessage({ role: "assistant", text: "A" });
      }),
      t.step({ name: "child-b", type: "tool" }, async (s) => {
        s.logToolCall({ name: "search", arguments: { q: "test" } });
      }),
    ]);
  });
});`}
      </CodeBlock>

      <h2>Shutdown</h2>
      <CodeBlock lang="typescript">
        {`// Flush pending traces
await client.flush();

// Flush + tear down (for scripts / tests)
await client.shutdown();`}
      </CodeBlock>

      <Callout type="tip">
        <p>
          In long-running servers, the batch sender flushes automatically. Call
          <code>client.shutdown()</code> only in short-lived scripts or test teardown.
        </p>
      </Callout>
    </>
  );
}
