import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function NodeAgentsPage() {
  return (
    <>
      <h1>Agents</h1>
      <p>
        The <code>wrapAgent</code> method wraps an async agent function so every call
        automatically creates a trace, captures input/output, and returns a structured
        result with a run ID for downstream metric recording.
      </p>

      <h2>Basic Usage</h2>
      <CodeBlock lang="typescript">
        {`import { TraceClient } from "@theta/observability";

const client = new TraceClient();

const agent = client.wrapAgent("support-agent", async (ctx, input: string) => {
  // ctx.trace is a full Trace object
  const reply = await ctx.trace.step(
    { name: "respond", type: "llm", model: "gpt-4o" },
    async (s) => {
      s.logMessage({ role: "user", text: input });
      const answer = await callLLM(input);
      s.logMessage({ role: "assistant", text: answer });
      s.setTokenUsage({ input: 100, output: 50 });
      return answer;
    },
  );

  ctx.onComplete(reply);
  return reply;
});

const { result, runId } = await agent("Help me reset my password");
console.log("Answer:", result);
console.log("Run ID:", runId);`}
      </CodeBlock>

      <h2>AgentContext</h2>
      <p>
        The first argument to the agent function is an <code>AgentContext</code>:
      </p>
      <ParamTable
        params={[
          { name: "ctx.trace", type: "Trace", description: "The Trace backing this agent invocation. Use it to create steps, attach media, etc." },
          { name: "ctx.runId", type: "string", description: "The unique trace ID for this run." },
          { name: "ctx.onComplete(result)", type: "method", description: "Call with the agent's final output. Stores it in trace metadata." },
        ]}
      />

      <h2>AgentResult</h2>
      <p>
        The wrapped agent returns a <code>Promise&lt;AgentResult&lt;T&gt;&gt;</code>:
      </p>
      <CodeBlock lang="typescript">
        {`interface AgentResult<T> {
  /** The value returned by the agent function (undefined when the agent threw). */
  result: T | undefined;
  /** Trace / run ID for this invocation. */
  runId: string;
}

const { result, runId } = await agent("input");`}
      </CodeBlock>

      <h2>Type Safety</h2>
      <p>
        The <code>wrapAgent</code> method is fully generic:
      </p>
      <CodeBlock lang="typescript">
        {`interface SearchInput {
  query: string;
  filters?: Record<string, string>;
}

interface SearchOutput {
  results: string[];
  totalCount: number;
}

const searchAgent = client.wrapAgent<SearchInput, SearchOutput>(
  "search-agent",
  async (ctx, input) => {
    // input is typed as SearchInput
    const results = await performSearch(input.query, input.filters);
    return { results, totalCount: results.length };
  },
);

// result is typed as SearchOutput | undefined
const { result, runId } = await searchAgent({ query: "TypeScript tips" });`}
      </CodeBlock>

      <h2>Recording Metrics on Agent Runs</h2>
      <CodeBlock lang="typescript">
        {`const { result, runId } = await agent("Help me");

// Record a pass/fail metric
await client.recordMetric("task_adherence", runId, { passed: true });

// Record a score metric
await client.recordMetric("response_quality", runId, { score: 0.92 });`}
      </CodeBlock>

      <h2>Error Handling</h2>
      <p>
        If the agent function throws, the trace is marked with <code>status: &quot;error&quot;</code>
        and the error message is captured. The exception is re-thrown. The <code>runId</code>
        is still returned so you can record metrics against the failed run.
      </p>
      <CodeBlock lang="typescript">
        {`const riskyAgent = client.wrapAgent("risky", async (ctx, input: string) => {
  throw new Error("something went wrong");
});

try {
  const { result, runId } = await riskyAgent("bad input");
  // result is undefined, but runId is valid
} catch (err) {
  console.error("Agent failed, but trace was recorded");
}`}
      </CodeBlock>

      <Callout type="info">
        <p>
          The agent wrapper automatically sets <code>runType: &quot;agent&quot;</code> on the trace
          and stores the input in <code>metadata.agent_input</code>.
        </p>
      </Callout>

      <p>
        See also: <Link href="/docs/node/metrics">Metrics</Link> for recording evaluation
        results, and <Link href="/docs/node/traces">Traces & Steps</Link> for the full
        step API available inside agent functions.
      </p>
    </>
  );
}
