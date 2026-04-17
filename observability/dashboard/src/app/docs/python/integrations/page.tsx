import { CodeBlock } from "@/components/docs/code-block";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function PythonIntegrationsPage() {
  return (
    <>
      <h1>Integrations</h1>
      <p>
        Theta provides drop-in wrappers for popular LLM providers. These automatically
        create <code>llm</code> steps, capture messages, token usage, and support
        both streaming and non-streaming responses.
      </p>

      <h2>OpenAI</h2>
      <p>
        Wrap your OpenAI client to automatically trace every <code>chat.completions.create</code> call.
      </p>
      <CodeBlock lang="python">
        {`from openai import OpenAI
from theta_observability import TraceClient
from theta_observability.integrations.openai import wrap_openai

client = TraceClient()
oai = wrap_openai(OpenAI(), client)

with client.trace(name="chat") as t:
    response = oai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": "Explain quantum computing in one sentence."}
        ],
    )
    print(response.choices[0].message.content)`}
      </CodeBlock>

      <h3>What Gets Captured</h3>
      <ul>
        <li>An <code>llm</code> step named <code>"openai.chat.completions"</code></li>
        <li>All input messages (role + content)</li>
        <li>The assistant response message</li>
        <li>Token usage (prompt_tokens, completion_tokens)</li>
        <li>Model name</li>
        <li>Latency</li>
      </ul>

      <h3>Streaming</h3>
      <p>
        Streaming responses are automatically proxied. The wrapper accumulates the
        streamed text and captures token usage from the final chunk:
      </p>
      <CodeBlock lang="python">
        {`with client.trace(name="streaming-chat") as t:
    stream = oai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Tell me a story"}],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content:
            print(chunk.choices[0].delta.content, end="")`}
      </CodeBlock>

      <Callout type="info">
        <p>
          When no trace is active, wrapped calls pass through to the original client
          untouched -- zero overhead.
        </p>
      </Callout>

      <h3>Default Client</h3>
      <p>
        You can omit the <code>obs</code> parameter to use the default module-level client:
      </p>
      <CodeBlock lang="python">
        {`# Uses THETA_API_KEY and THETA_PROJECT from environment
oai = wrap_openai(OpenAI())`}
      </CodeBlock>

      <hr />

      <h2>Anthropic</h2>
      <p>
        Wrap your Anthropic client to automatically trace every <code>messages.create</code> call.
      </p>
      <CodeBlock lang="python">
        {`from anthropic import Anthropic
from theta_observability import TraceClient
from theta_observability.integrations.anthropic import wrap_anthropic

client = TraceClient()
claude = wrap_anthropic(Anthropic(), client)

with client.trace(name="claude-chat") as t:
    response = claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": "What is the capital of France?"}
        ],
    )
    print(response.content[0].text)`}
      </CodeBlock>

      <h3>What Gets Captured</h3>
      <ul>
        <li>An <code>llm</code> step named <code>"anthropic.messages"</code></li>
        <li>All input messages</li>
        <li>The assistant response (text blocks concatenated)</li>
        <li>Token usage (input_tokens, output_tokens)</li>
        <li>Model name</li>
        <li>Latency</li>
      </ul>

      <h3>Streaming</h3>
      <CodeBlock lang="python">
        {`with client.trace(name="claude-stream") as t:
    stream = claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Write a haiku"}],
        stream=True,
    )
    for event in stream:
        # Events pass through transparently
        pass`}
      </CodeBlock>

      <Callout type="tip" title="Combining wrappers">
        <p>
          You can wrap both OpenAI and Anthropic clients in the same application.
          Each creates its own step when called within an active trace.
        </p>
      </Callout>

      <CodeBlock lang="python">
        {`oai = wrap_openai(OpenAI(), client)
claude = wrap_anthropic(Anthropic(), client)

with client.trace(name="multi-model") as t:
    # This creates an "openai.chat.completions" step
    plan = oai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Plan a trip to Japan"}],
    )
    # This creates an "anthropic.messages" step
    review = claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": f"Review this plan: {plan.choices[0].message.content}"}],
    )`}
      </CodeBlock>

      <p>
        See also: <Link href="/docs/node/integrations">Node.js Integrations</Link> for
        the TypeScript equivalents.
      </p>
    </>
  );
}
