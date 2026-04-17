import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function QuickstartPage() {
  return (
    <>
      <h1>Quickstart</h1>
      <p>
        Send your first trace to Theta in under 5 minutes. This guide covers
        installing the SDK, configuring your API key, and instrumenting a simple
        LLM call.
      </p>

      <h2>1. Install the SDK</h2>
      <CodeBlock lang="bash" title="Python">
        {`pip install theta-observability`}
      </CodeBlock>
      <CodeBlock lang="bash" title="Node.js">
        {`npm install @theta/observability`}
      </CodeBlock>

      <h2>2. Set Your API Key</h2>
      <p>
        Get your API key from the Theta dashboard under <strong>Settings &rarr; API Keys</strong>.
        Set it as an environment variable:
      </p>
      <CodeBlock lang="bash" title=".env">
        {`THETA_API_KEY=tobs_live_your_api_key_here
THETA_PROJECT=proj_your_project_id`}
      </CodeBlock>

      <h2>3. Instrument Your Code</h2>

      <h3>Python</h3>
      <CodeBlock lang="python" title="main.py">
        {`from theta_observability import TraceClient

client = TraceClient()  # reads THETA_API_KEY and THETA_PROJECT from env

with client.trace(name="support-agent", run_type="prod") as t:
    # Step 1: classify the user's intent
    with t.step(name="classify", type="llm", model="gpt-4o") as s:
        s.log_message(role="user", text="I need to reset my password")
        s.log_message(role="assistant", text="Intent: password_reset")
        s.set_token_usage(input=45, output=8)

    # Step 2: execute the action
    with t.step(name="execute", type="tool") as s:
        s.log_tool_call(
            name="reset_password",
            arguments={"user_id": "usr_123"},
            result={"status": "email_sent"},
        )

    # Step 3: respond to the user
    with t.step(name="respond", type="llm", model="gpt-4o") as s:
        s.log_message(role="assistant", text="I've sent a password reset email to your address on file.")
        s.set_token_usage(input=120, output=22)`}
      </CodeBlock>

      <h3>Node.js</h3>
      <CodeBlock lang="typescript" title="main.ts">
        {`import { TraceClient } from "@theta/observability";

const client = new TraceClient(); // reads THETA_API_KEY and THETA_PROJECT from env

await client.trace({ name: "support-agent", runType: "prod" }, async (t) => {
  // Step 1: classify the user's intent
  await t.step({ name: "classify", type: "llm", model: "gpt-4o" }, async (s) => {
    s.logMessage({ role: "user", text: "I need to reset my password" });
    s.logMessage({ role: "assistant", text: "Intent: password_reset" });
    s.setTokenUsage({ input: 45, output: 8 });
  });

  // Step 2: execute the action
  await t.step({ name: "execute", type: "tool" }, async (s) => {
    s.logToolCall({
      name: "reset_password",
      arguments: { user_id: "usr_123" },
      result: { status: "email_sent" },
    });
  });

  // Step 3: respond to the user
  await t.step({ name: "respond", type: "llm", model: "gpt-4o" }, async (s) => {
    s.logMessage({
      role: "assistant",
      text: "I've sent a password reset email to your address on file.",
    });
    s.setTokenUsage({ input: 120, output: 22 });
  });
});`}
      </CodeBlock>

      <h2>4. View Your Trace</h2>
      <p>
        Open the Theta dashboard and navigate to your project. You should see
        the trace appear within a few seconds, complete with the step hierarchy,
        messages, token usage, and latency metrics.
      </p>

      <Callout type="tip" title="Zero-config shorthand">
        <p>
          If you set <code>THETA_API_KEY</code> and <code>THETA_PROJECT</code> in
          your environment, you can use the module-level <code>trace()</code> function
          without creating a client:
        </p>
      </Callout>

      <CodeBlock lang="python" title="Python (zero-config)">
        {`from theta_observability import trace

with trace("my-agent") as t:
    with t.step(name="think", type="llm") as s:
        s.log_message(role="assistant", text="Thinking...")`}
      </CodeBlock>

      <CodeBlock lang="typescript" title="Node.js (zero-config)">
        {`import { trace } from "@theta/observability";

await trace("my-agent", async (t) => {
  await t.step({ name: "think", type: "llm" }, async (s) => {
    s.logMessage({ role: "assistant", text: "Thinking..." });
  });
});`}
      </CodeBlock>

      <h2>Next Steps</h2>
      <ul>
        <li><Link href="/docs/python/traces">Python SDK: Traces & Steps</Link> -- full API reference</li>
        <li><Link href="/docs/node/traces">Node.js SDK: Traces & Steps</Link> -- full API reference</li>
        <li><Link href="/docs/python/agents">Wrap your agent</Link> -- auto-trace every agent call</li>
        <li><Link href="/docs/python/integrations">OpenAI & Anthropic integrations</Link> -- zero-code LLM tracing</li>
        <li><Link href="/docs/concepts/schema">Trace schema</Link> -- understand the data model</li>
      </ul>
    </>
  );
}
