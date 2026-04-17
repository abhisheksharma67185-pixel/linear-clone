import Link from "next/link";
import { CodeBlock } from "@/components/docs/code-block";

export default function NodeOverviewPage() {
  return (
    <>
      <h1>Node.js SDK</h1>
      <p>
        The <code>@theta/observability</code> package provides a TypeScript-first client
        for creating traces, recording steps, uploading media, and wrapping agents.
        It uses <code>AsyncLocalStorage</code> for automatic step nesting and
        auto-batches traces in the background.
      </p>

      <h2>Installation</h2>
      <CodeBlock lang="bash" title="Terminal">
        {`npm install @theta/observability`}
      </CodeBlock>

      <h2>Basic Usage</h2>
      <CodeBlock lang="typescript" title="example.ts">
        {`import { TraceClient } from "@theta/observability";

const client = new TraceClient({
  apiKey: "tobs_live_...",
  project: "proj_...",
});

await client.trace({ name: "my-agent", runType: "prod" }, async (t) => {
  await t.step({ name: "llm-call", type: "llm", model: "gpt-4o" }, async (s) => {
    s.logMessage({ role: "user", text: "Hello!" });
    s.logMessage({ role: "assistant", text: "Hi there!" });
    s.setTokenUsage({ input: 12, output: 8 });
  });
});`}
      </CodeBlock>

      <h2>Guides</h2>
      <ul>
        <li><Link href="/docs/node/traces">Traces & Steps</Link> -- creating traces, nesting steps, logging messages and tool calls</li>
        <li><Link href="/docs/node/agents">Agents</Link> -- wrapping agent functions for automatic tracing</li>
        <li><Link href="/docs/node/metrics">Metrics</Link> -- recording evaluation metrics against traces</li>
        <li><Link href="/docs/node/attachments">Attachments</Link> -- uploading images, audio, video, and files</li>
        <li><Link href="/docs/node/integrations">Integrations</Link> -- zero-code tracing for OpenAI and Anthropic</li>
      </ul>
    </>
  );
}
