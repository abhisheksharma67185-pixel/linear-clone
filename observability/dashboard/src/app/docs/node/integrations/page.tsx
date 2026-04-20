import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function NodeIntegrationsPage() {
  return (
    <>
      <h1>Integrations</h1>
      <p>
        Drop-in wrappers for popular LLM providers. They create a proxy around your
        client that automatically emits <code>llm</code> steps, captures messages,
        token usage, and support streaming.
      </p>

      <h2>OpenAI</h2>
      <p>
        Wrap your OpenAI client to trace every <code>chat.completions.create</code> call.
        The original client is <strong>not</strong> mutated -- a Proxy is returned.
      </p>
      <CodeBlock lang="typescript">
        {`import OpenAI from "openai";
import { TraceClient } from "@theta/observability";
import { wrapOpenAI } from "@theta/observability/integrations/openai";

const client = new TraceClient();
const openai = wrapOpenAI(new OpenAI(), { client });

await client.trace({ name: "chat" }, async (t) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Explain quantum computing." }],
  });
  console.log(response.choices[0].message.content);
});`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "openai", type: "OpenAI", required: true, description: "Your OpenAI client instance." },
          { name: "opts.client", type: "TraceClient", description: "Theta client. Falls back to default client." },
          { name: "opts.name", type: "string", description: "Override the step name.", default: '"openai.chat"' },
        ]}
      />

      <h3>What Gets Captured</h3>
      <ul>
        <li>An <code>llm</code> step with the model name</li>
        <li>All input messages (converted to Theta format)</li>
        <li>The assistant response</li>
        <li>Token usage (prompt_tokens, completion_tokens, total_tokens)</li>
        <li>Image URLs from multimodal messages</li>
      </ul>

      <h3>Streaming</h3>
      <CodeBlock lang="typescript">
        {`await client.trace({ name: "streaming" }, async (t) => {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Tell me a story" }],
    stream: true,
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) process.stdout.write(text);
  }
  // Token usage and full response captured automatically on stream end
});`}
      </CodeBlock>

      <Callout type="info">
        <p>
          When no trace is active, the wrapped client automatically creates one for
          the call. If a trace is active, the step is added to it.
        </p>
      </Callout>

      <hr />

      <h2>LangChain</h2>
      <p>
        Wrap a runnable-style LangChain object to turn <code>invoke</code> and
        <code> stream</code> calls into Theta traces without changing your chain logic.
      </p>
      <CodeBlock lang="typescript">
        {`import { TraceClient } from "@theta/observability";
import { wrapLangChainRunnable } from "@theta/observability/integrations/langchain";

const client = new TraceClient();
const tracedChain = wrapLangChainRunnable(chain, {
  client,
  name: "support-chain",
  runType: "prod",
  metadata: { framework: "langchain" },
});

const result = await tracedChain.invoke({
  question: "Why was the order flagged for review?",
});`}
      </CodeBlock>

      <Callout type="info">
        <p>
          The wrapper captures the runnable input, output, errors, and streamed text
          while preserving the original return values from LangChain.
        </p>
      </Callout>

      <hr />

      <h2>Anthropic</h2>
      <p>
        Wrap your Anthropic client to trace every <code>messages.create</code> call.
      </p>
      <CodeBlock lang="typescript">
        {`import Anthropic from "@anthropic-ai/sdk";
import { TraceClient } from "@theta/observability";
import { wrapAnthropic } from "@theta/observability/integrations/anthropic";

const client = new TraceClient();
const anthropic = wrapAnthropic(new Anthropic(), { client });

await client.trace({ name: "claude-chat" }, async (t) => {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: "What is the capital of France?" }],
  });
  console.log(response.content[0].text);
});`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "anthropic", type: "Anthropic", required: true, description: "Your Anthropic client instance." },
          { name: "opts.client", type: "TraceClient", description: "Theta client. Falls back to default client." },
          { name: "opts.name", type: "string", description: "Override the step name.", default: '"anthropic.messages"' },
        ]}
      />

      <h3>What Gets Captured</h3>
      <ul>
        <li>An <code>llm</code> step with the model name</li>
        <li>System prompt (if provided)</li>
        <li>All input messages (text + image blocks)</li>
        <li>The assistant response (text blocks concatenated)</li>
        <li>Token usage (input_tokens, output_tokens)</li>
      </ul>

      <h3>Streaming</h3>
      <CodeBlock lang="typescript">
        {`await client.trace({ name: "claude-stream" }, async (t) => {
  const stream = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Write a haiku" }],
    stream: true,
  });
  for await (const event of stream) {
    // Events pass through transparently
  }
});`}
      </CodeBlock>

      <hr />

      <h2>Next.js Route Helper</h2>
      <p>
        The <code>withTrace</code> helper wraps a Next.js route handler so each
        request is automatically traced. Any thrown errors propagate normally, but
        the trace is recorded with <code>status: &quot;error&quot;</code>.
      </p>
      <CodeBlock lang="typescript" title="app/api/chat/route.ts">
        {`import { withTrace } from "@theta/observability/next";
import { wrapOpenAI } from "@theta/observability/integrations/openai";
import OpenAI from "openai";

const openai = wrapOpenAI(new OpenAI());

export const POST = withTrace(
  async (req: Request) => {
    const { message } = await req.json();

    // OpenAI calls inside this handler auto-attach to the request trace
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: message }],
    });

    return Response.json({ reply: res.choices[0].message?.content });
  },
  { name: "api/chat", runType: "prod" },
);`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "handler", type: "(...args) => Promise<unknown>", required: true, description: "Your Next.js route handler function." },
          { name: "opts.name", type: "string", description: "Trace name. Falls back to handler.name or 'route'." },
          { name: "opts.client", type: "TraceClient", description: "TraceClient to use. Falls back to the default (env-based) client." },
          { name: "opts.runType", type: "string", description: "Run type label for the trace." },
          { name: "opts.tags", type: "string[]", description: "Tags for the trace." },
          { name: "opts.metadata", type: "Record<string, unknown>", description: "Metadata for the trace." },
        ]}
      />

      <Callout type="tip" title="Combine with provider wrappers">
        <p>
          <code>withTrace</code> establishes an active trace context via <code>AsyncLocalStorage</code>.
          Any <code>wrapOpenAI</code> or <code>wrapAnthropic</code> calls inside the handler
          automatically attach their steps to the request trace -- no manual wiring needed.
        </p>
      </Callout>

      <hr />

      <h2>observe Higher-Order Function</h2>
      <p>
        The <code>observe</code> helper wraps any async function into an auto-traced step.
        If called inside an active trace, it adds a child step; otherwise it creates
        a new trace.
      </p>
      <CodeBlock lang="typescript">
        {`import { observe } from "@theta/observability";

const classifyIntent = observe(
  async (text: string): Promise<string> => {
    // your classification logic
    return "password_reset";
  },
  { name: "classify-intent", type: "llm" },
);

// Inside a trace -- adds a child step
await client.trace({ name: "support" }, async () => {
  const intent = await classifyIntent("I forgot my password");
});

// Outside a trace -- creates a new trace automatically
const intent = await classifyIntent("I forgot my password");`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "fn", type: "(...args) => Promise<T>", required: true, description: "The async function to wrap." },
          { name: "opts.name", type: "string", description: "Step/trace name. Falls back to fn.name or 'anonymous'." },
          { name: "opts.type", type: "StepType", description: "Step type: 'llm', 'tool', 'retrieval', 'custom'.", default: '"custom"' },
          { name: "opts.client", type: "TraceClient", description: "TraceClient to use. Falls back to the default (env-based) client." },
        ]}
      />

      <hr />

      <h2>Combining Wrappers</h2>
      <p>
        Provider wrappers, <code>withTrace</code>, and <code>observe</code> all compose
        naturally through <code>AsyncLocalStorage</code>. Here is a full example
        using multiple providers in a Next.js route:
      </p>
      <CodeBlock lang="typescript" title="app/api/agent/route.ts">
        {`import { TraceClient } from "@theta/observability";
import { withTrace } from "@theta/observability/next";
import { wrapOpenAI } from "@theta/observability/integrations/openai";
import { wrapAnthropic } from "@theta/observability/integrations/anthropic";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const client = new TraceClient();
const openai = wrapOpenAI(new OpenAI(), { client });
const anthropic = wrapAnthropic(new Anthropic(), { client });

export const POST = withTrace(
  async (req: Request) => {
    const { query } = await req.json();

    // Step 1: Use Claude to plan (creates "anthropic.messages" step)
    const plan = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content: \`Plan how to answer: \${query}\` }],
    });

    // Step 2: Use GPT-4o to execute (creates "openai.chat" step)
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: plan.content[0].text },
        { role: "user", content: query },
      ],
    });

    return Response.json({ answer: result.choices[0].message?.content });
  },
  { name: "api/agent", runType: "prod", tags: ["multi-model"] },
);`}
      </CodeBlock>

      <p>
        See also: <Link href="/docs/node/traces">Traces & Steps</Link> for the full
        manual tracing API, <Link href="/docs/node/agents">Agents</Link> for wrapping
        complete agent functions, and <Link href="/docs/python/integrations">Python Integrations</Link> for
        the Python equivalents.
      </p>
    </>
  );
}
