import Link from "next/link";
import { CodeBlock } from "@/components/docs/code-block";

export default function PythonOverviewPage() {
  return (
    <>
      <h1>Python SDK</h1>
      <p>
        The <code>theta-observability</code> Python package provides a high-level client for
        creating traces, recording steps, uploading media, and wrapping agents. It supports
        both sync and async code, auto-batches traces, and flushes on process exit.
      </p>

      <h2>Installation</h2>
      <CodeBlock lang="bash" title="Terminal">
        {`pip install theta-observability`}
      </CodeBlock>

      <h2>Basic Usage</h2>
      <CodeBlock lang="python" title="example.py">
        {`from theta_observability import TraceClient

client = TraceClient(
    api_key="tobs_live_...",
    project="proj_...",
)

with client.trace(name="my-agent", run_type="prod") as t:
    with t.step(name="llm-call", type="llm", model="gpt-4o") as s:
        s.log_message(role="user", text="Hello!")
        s.log_message(role="assistant", text="Hi there!")
        s.set_token_usage(input=12, output=8)`}
      </CodeBlock>

      <h2>Guides</h2>
      <ul>
        <li><Link href="/docs/python/traces">Traces & Steps</Link> -- creating traces, nesting steps, logging messages and tool calls</li>
        <li><Link href="/docs/python/agents">Agents</Link> -- wrapping agent functions for automatic tracing</li>
        <li><Link href="/docs/python/metrics">Metrics</Link> -- recording evaluation metrics against traces</li>
        <li><Link href="/docs/python/attachments">Attachments</Link> -- uploading images, audio, video, and sensor data</li>
        <li><Link href="/docs/python/integrations">Integrations</Link> -- zero-code tracing for OpenAI and Anthropic</li>
      </ul>
    </>
  );
}
