import { CodeBlock } from "@/components/docs/code-block";
import { ParamTable } from "@/components/docs/param-table";
import { Callout } from "@/components/docs/callout";

export default function PythonTracesPage() {
  return (
    <>
      <h1>Traces & Steps</h1>
      <p>
        Traces are the top-level unit of observability. Each trace contains one or more
        steps, which represent individual operations like LLM calls, tool invocations,
        or custom logic. Steps can be nested to form a tree.
      </p>

      <h2>TraceClient</h2>
      <p>
        The <code>TraceClient</code> is the main entry point. It manages batching,
        flushing, and the HTTP connection to the Theta API.
      </p>
      <CodeBlock lang="python" title="Initialize">
        {`from theta_observability import TraceClient

client = TraceClient(
    api_key="tobs_live_...",       # or THETA_API_KEY env var
    project="proj_...",            # or THETA_PROJECT env var
    base_url="https://api.theta-observability.com",  # or THETA_BASE_URL
    flush_interval=0.5,            # seconds between auto-flushes
    max_batch=100,                 # max traces per batch
    timeout=10.0,                  # HTTP timeout in seconds
    debug=False,                   # enable debug logging
)`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "api_key", type: "str | None", description: "API key for authentication. Falls back to THETA_API_KEY env var." },
          { name: "project", type: "str | None", description: "Project ID to scope traces to. Falls back to THETA_PROJECT env var." },
          { name: "base_url", type: "str | None", description: "API base URL. Falls back to THETA_BASE_URL env var.", default: "https://api.theta-observability.com" },
          { name: "flush_interval", type: "float", description: "Seconds between automatic background flushes.", default: "0.5" },
          { name: "max_batch", type: "int", description: "Maximum number of traces to batch before forcing a flush.", default: "100" },
          { name: "timeout", type: "float", description: "HTTP request timeout in seconds.", default: "10.0" },
          { name: "debug", type: "bool", description: "Enable verbose debug logging.", default: "False" },
        ]}
      />

      <h2>Creating a Trace</h2>
      <p>
        Use <code>client.trace()</code> as a context manager. The trace is automatically
        committed when the context exits.
      </p>
      <CodeBlock lang="python">
        {`with client.trace(
    name="checkout-agent",
    run_type="prod",
    user_id="usr_abc",
    tags=["checkout", "v2"],
    metadata={"session_id": "sess_123"},
) as t:
    # ... add steps here
    pass`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "name", type: "str", required: true, description: "Human-readable trace name." },
          { name: "run_id", type: "str | None", description: "Group related traces under one run ID." },
          { name: "run_type", type: "str | None", description: "Classify the run: 'prod', 'staging', 'eval', 'agent', etc." },
          { name: "use_case", type: "str | None", description: "Use case label for filtering (e.g., 'support', 'onboarding')." },
          { name: "user_id", type: "str | None", description: "End-user identifier." },
          { name: "group", type: "str | None", description: "Group label for segmentation." },
          { name: "platform", type: "str | None", description: "Platform label (e.g., 'web', 'ios', 'robotics')." },
          { name: "model", type: "str | None", description: "Primary model used in this trace." },
          { name: "tags", type: "list[str] | None", description: "Arbitrary string tags for filtering." },
          { name: "metadata", type: "dict | None", description: "Arbitrary key-value metadata." },
        ]}
      />

      <h2>Adding Steps</h2>
      <p>
        Steps represent individual operations within a trace. They auto-nest based on
        the call stack using Python context variables.
      </p>
      <CodeBlock lang="python">
        {`with client.trace(name="my-agent") as t:
    with t.step(name="plan", type="llm", model="gpt-4o") as s:
        s.log_message(role="user", text="What should we do?")
        s.log_message(role="assistant", text="Let me think...")
        s.set_token_usage(input=50, output=25)

    with t.step(name="execute", type="tool") as s:
        s.log_tool_call(
            name="search_db",
            arguments={"query": "user preferences"},
            result={"count": 42},
        )

    # Nested steps
    with t.step(name="outer", type="custom") as outer:
        with t.step(name="inner", type="llm") as inner:
            # inner.parent_step_id is automatically set to outer.step_id
            inner.log_message(role="assistant", text="Nested!")`}
      </CodeBlock>

      <ParamTable
        params={[
          { name: "name", type: "str | None", description: "Step name." },
          { name: "type", type: "StepType", description: "Step type: 'llm', 'tool', 'retrieval', 'custom'.", default: "'custom'" },
          { name: "model", type: "str | None", description: "Model identifier (for LLM steps)." },
          { name: "metadata", type: "dict | None", description: "Arbitrary key-value metadata." },
        ]}
      />

      <h2>Logging Messages</h2>
      <p>
        Use <code>step.log_message()</code> to record chat-style messages within a step.
        Messages can include text, images, audio, and video attachments.
      </p>
      <CodeBlock lang="python">
        {`with t.step(name="chat", type="llm") as s:
    s.log_message(role="user", text="Describe this image", images=["./photo.png"])
    s.log_message(role="assistant", text="I see a cat sitting on a desk.")
    s.log_message(
        role="assistant",
        text="Here's a tool call",
        tool_calls=[{"id": "tc_1", "name": "search", "arguments": {"q": "cats"}}],
    )`}
      </CodeBlock>

      <h2>Logging Tool Calls</h2>
      <CodeBlock lang="python">
        {`with t.step(name="tools", type="tool") as s:
    s.log_tool_call(
        name="get_weather",
        arguments={"city": "San Francisco"},
        result={"temp": 65, "condition": "foggy"},
        latency_ms=230,
    )`}
      </CodeBlock>

      <h2>Token Usage</h2>
      <CodeBlock lang="python">
        {`with t.step(name="llm", type="llm") as s:
    s.set_token_usage(input=500, output=120)
    # total is auto-computed as input + output if not provided`}
      </CodeBlock>

      <Callout type="info" title="Auto-aggregation">
        <p>
          Token usage is automatically aggregated from steps to the trace level.
          If any step has token usage set, the trace will report the sum.
        </p>
      </Callout>

      <h2>Status and Errors</h2>
      <p>
        Step and trace status is automatically set to <code>"success"</code> on normal exit
        and <code>"error"</code> if an exception propagates through the context manager.
        You can also set it manually:
      </p>
      <CodeBlock lang="python">
        {`with t.step(name="validate", type="custom") as s:
    s.set_status("error")
    # or let an exception set it:
    # raise ValueError("invalid input")`}
      </CodeBlock>

      <h2>Annotations</h2>
      <CodeBlock lang="python">
        {`# On a step
with t.step(name="output", type="llm") as s:
    s.annotate(label="good", score=0.95, comment="Accurate response")

# On a trace
t.annotate(label="thumbs_up", user="reviewer@example.com")`}
      </CodeBlock>

      <h2>Trace Metadata and Tags</h2>
      <CodeBlock lang="python">
        {`with client.trace(name="agent") as t:
    t.set_metadata(environment="production", version="2.1.0")
    t.set_metadata_path("workflow.stage", "checkout")
    t.set_tags("high-priority", "vip-customer")
    t.set_cost(0.0032)
    t.set_user("usr_456")`}
      </CodeBlock>

      <h2>Metadata Paths and Server-side Filters</h2>
      <p>
        Use metadata path helpers to write nested JSON values and query them back with
        <code> client.list_traces()</code>.
      </p>
      <CodeBlock lang="python">
        {`with client.trace(name="checkout-agent") as t:
    t.set_metadata(environment="production")
    t.set_metadata_path("workflow.stage", "checkout")

resp = client.list_traces(
    run_type=["prod"],
    metadata_filters=[{"key": "workflow.stage", "value": "checkout"}],
    limit=25,
)

print(resp.data[0]["metadata"]["workflow"]["stage"])`}
      </CodeBlock>

      <Callout type="tip" title="Configurable dashboard filters">
        <p>
          The dashboard reads metadata keys from trace summaries, so new keys can be turned
          into saved filters without changing the trace schema first.
        </p>
      </Callout>

      <h2>The observe Decorator</h2>
      <p>
        The <code>@client.observe()</code> decorator wraps a function in a step automatically.
        If no trace is active, it creates one. Works with both sync and async functions.
      </p>
      <CodeBlock lang="python">
        {`@client.observe(name="classify", type="llm", model="gpt-4o")
def classify_intent(text: str) -> str:
    # Your LLM call here
    return "password_reset"

@client.observe(name="process", type="custom")
async def process_request(intent: str) -> dict:
    # Your async logic here
    return {"status": "done"}`}
      </CodeBlock>

      <h2>Zero-Config Module-Level API</h2>
      <p>
        If you set <code>THETA_API_KEY</code> and <code>THETA_PROJECT</code> as
        environment variables, you can use the module-level functions without
        creating a client:
      </p>
      <CodeBlock lang="python">
        {`from theta_observability import trace, observe

with trace("my-agent") as t:
    with t.step(name="think", type="llm") as s:
        s.log_message(role="assistant", text="...")

@observe(name="my-func", type="custom")
def my_function():
    pass`}
      </CodeBlock>

      <h2>Flushing and Cleanup</h2>
      <CodeBlock lang="python">
        {`# Manually flush pending traces
client.flush(timeout=5.0)

# Close the client (flushes + closes HTTP connection)
client.close(timeout=5.0)

# Or use as a context manager
with TraceClient() as client:
    # client.close() called automatically
    pass`}
      </CodeBlock>

      <Callout type="tip">
        <p>
          The client registers an <code>atexit</code> handler that automatically flushes
          pending traces when the process exits. You usually don't need to call
          <code>flush()</code> or <code>close()</code> manually in long-running apps.
        </p>
      </Callout>
    </>
  );
}
