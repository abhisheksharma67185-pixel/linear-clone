import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";
import Link from "next/link";

export default function PythonAgentsPage() {
  return (
    <>
      <h1>Agents</h1>
      <p>
        The <code>wrap_agent</code> helper wraps an agent function so every invocation
        automatically creates a trace, captures inputs and outputs, and returns a
        structured <code>AgentResult</code> with the run ID for downstream metric recording.
      </p>

      <h2>Basic Usage</h2>

      <h3>As a Decorator</h3>
      <CodeBlock lang="python">
        {`from theta_observability import TraceClient

client = TraceClient()

@client.wrap_agent("support-agent")
def my_agent(ctx, user_input: str) -> str:
    # ctx is an AgentContext with access to the trace
    with ctx.trace.step(name="think", type="llm", model="gpt-4o") as s:
        s.log_message(role="user", text=user_input)
        response = "I can help with that!"
        s.log_message(role="assistant", text=response)
        s.set_token_usage(input=50, output=12)

    ctx.on_complete(response)
    return response

# Call the agent
result, run_id = my_agent("Help me reset my password")
print(f"Result: {result}")
print(f"Run ID: {run_id}")  # use with client.record_metric()`}
      </CodeBlock>

      <h3>Functional Style</h3>
      <CodeBlock lang="python">
        {`def raw_agent(ctx, query: str) -> dict:
    with ctx.trace.step(name="search", type="retrieval") as s:
        results = search_docs(query)
        s.set_metadata(num_results=len(results))
    return {"answer": summarize(results)}

agent = client.wrap_agent("search-agent", raw_agent)
result, run_id = agent("How do I configure OAuth?")`}
      </CodeBlock>

      <h2>AgentContext</h2>
      <p>
        The first argument to a wrapped agent function is always an <code>AgentContext</code>.
        It provides access to the underlying trace and a helper to record the final output.
      </p>

      <ParamTable
        params={[
          { name: "ctx.trace", type: "Trace", description: "The Trace backing this agent invocation. Use it to create steps, attach media, etc." },
          { name: "ctx.run_id", type: "str", description: "The unique trace ID for this run. Same as the run_id in AgentResult." },
          { name: "ctx.on_complete(result)", type: "method", description: "Call with the agent's final output. Stores it in trace metadata and creates an 'agent.output' step." },
        ]}
      />

      <h2>AgentResult</h2>
      <p>
        The return value of a wrapped agent is an <code>AgentResult</code>, which is
        tuple-unpackable:
      </p>
      <CodeBlock lang="python">
        {`# Tuple unpacking
result, run_id = agent("input")

# Or access as attributes
agent_result = agent("input")
print(agent_result.result)
print(agent_result.run_id)`}
      </CodeBlock>

      <h2>Async Agents</h2>
      <p>
        Async functions are automatically detected and wrapped correctly:
      </p>
      <CodeBlock lang="python">
        {`@client.wrap_agent("async-agent")
async def my_async_agent(ctx, prompt: str) -> str:
    with ctx.trace.step(name="generate", type="llm") as s:
        result = await call_llm(prompt)
        s.log_message(role="assistant", text=result)
    ctx.on_complete(result)
    return result

# Await the result
result, run_id = await my_async_agent("Write a poem")`}
      </CodeBlock>

      <h2>Recording Metrics on Agent Runs</h2>
      <p>
        Use the <code>run_id</code> from <code>AgentResult</code> to record evaluation
        metrics against the trace:
      </p>
      <CodeBlock lang="python">
        {`result, run_id = agent("Help me")

# Record a pass/fail metric
client.record_metric("task_adherence", run_id, passed=True)

# Record a score metric
client.record_metric("response_quality", run_id, score=0.92)`}
      </CodeBlock>

      <Callout type="info">
        <p>
          The agent wrapper automatically sets <code>run_type=&quot;agent&quot;</code> on the trace
          and stores the function arguments in <code>metadata.input</code>.
        </p>
      </Callout>

      <h2>Error Handling</h2>
      <p>
        If the agent function raises an exception, the trace is marked with
        <code>status=&quot;error&quot;</code> and the error message is captured. The exception
        is then re-raised to the caller.
      </p>
      <CodeBlock lang="python">
        {`@client.wrap_agent("risky-agent")
def risky(ctx, input: str) -> str:
    raise ValueError("something went wrong")

try:
    result, run_id = risky("bad input")
except ValueError:
    print("Agent failed, but trace was still recorded")`}
      </CodeBlock>

      <p>
        See also: <Link href="/docs/python/metrics">Metrics</Link> for recording
        evaluation results, and <Link href="/docs/python/traces">Traces & Steps</Link>
        for the full step API available inside agent functions.
      </p>
    </>
  );
}
