import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";

export default function InstallationPage() {
  return (
    <>
      <h1>Installation</h1>
      <p>
        Theta Observability provides SDKs for Python and Node.js. Both SDKs auto-batch traces,
        upload media attachments, and flush on process exit.
      </p>

      <h2>Python</h2>
      <p>Requires Python 3.9 or later.</p>
      <CodeBlock lang="bash" title="Terminal">
        {`pip install theta-observability`}
      </CodeBlock>

      <p>Or with your preferred package manager:</p>
      <CodeBlock lang="bash" title="Terminal">
        {`# Poetry
poetry add theta-observability

# uv
uv add theta-observability`}
      </CodeBlock>

      <h2>Node.js</h2>
      <p>Requires Node.js 18 or later.</p>
      <CodeBlock lang="bash" title="Terminal">
        {`npm install @theta/observability`}
      </CodeBlock>

      <p>Or with your preferred package manager:</p>
      <CodeBlock lang="bash" title="Terminal">
        {`# Yarn
yarn add @theta/observability

# pnpm
pnpm add @theta/observability`}
      </CodeBlock>

      <h2>Environment Variables</h2>
      <p>
        Both SDKs read configuration from environment variables. Set these before running your app:
      </p>
      <CodeBlock lang="bash" title=".env">
        {`THETA_API_KEY=tobs_live_your_api_key_here
THETA_PROJECT=proj_your_project_id`}
      </CodeBlock>

      <Callout type="tip" title="Optional variables">
        <p>
          <code>THETA_BASE_URL</code> -- Override the API endpoint (defaults to <code>https://api.theta-observability.com</code>).
          Useful for self-hosted deployments.
        </p>
      </Callout>

      <h2>Verify Installation</h2>

      <h3>Python</h3>
      <CodeBlock lang="python" title="verify.py">
        {`from theta_observability import TraceClient

client = TraceClient(
    api_key="tobs_live_your_key",
    project="proj_your_project",
)

with client.trace(name="hello-world") as t:
    with t.step(name="greet", type="custom") as s:
        s.log_message(role="assistant", text="Hello from Theta!")

client.flush()
print("Trace sent successfully!")`}
      </CodeBlock>

      <h3>Node.js</h3>
      <CodeBlock lang="typescript" title="verify.ts">
        {`import { TraceClient } from "@theta/observability";

const client = new TraceClient({
  apiKey: "tobs_live_your_key",
  project: "proj_your_project",
});

await client.trace({ name: "hello-world" }, async (t) => {
  await t.step({ name: "greet", type: "custom" }, async (s) => {
    s.logMessage({ role: "assistant", text: "Hello from Theta!" });
  });
});

await client.flush();
console.log("Trace sent successfully!");`}
      </CodeBlock>

      <p>
        If everything is configured correctly, you should see the trace appear in
        your Theta dashboard within a few seconds.
      </p>
    </>
  );
}
