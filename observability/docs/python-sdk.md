# Python SDK Reference

Complete reference for the `theta-observability` Python SDK.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Core Concepts](#core-concepts)
- [Basic Usage](#basic-usage)
- [Zero-Config Mode](#zero-config-mode)
- [Agent Wrapping](#agent-wrapping)
- [Metrics](#metrics)
- [Multimodal Attachments](#multimodal-attachments)
- [LLM Integrations](#llm-integrations)
- [Decorator API](#decorator-api)
- [Error Handling](#error-handling)
- [Full API Reference](#full-api-reference)

---

## Installation

```bash
pip install theta-observability
```

**Requirements:** Python 3.10+, `httpx`, `pydantic>=2.0`.

---

## Configuration

### Explicit client

```python
from theta_observability import TraceClient

client = TraceClient(
    api_key="tk_live_...",
    project="proj_abc",
    base_url="https://api.theta-observability.com",  # optional
)
```

### Environment variables

The SDK reads these environment variables as fallbacks:

| Variable | Description | Default |
|----------|-------------|---------|
| `THETA_API_KEY` | API key for authentication | Required |
| `THETA_PROJECT` | Project ID (e.g. `proj_abc`) | Required |
| `THETA_BASE_URL` | API base URL | `https://api.theta-observability.com` |

### Constructor parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `api_key` | `str` | `THETA_API_KEY` env | API key |
| `project` | `str` | `THETA_PROJECT` env | Project ID |
| `base_url` | `str` | `THETA_BASE_URL` env or production URL | API base URL |
| `flush_interval` | `float` | `0.5` | Seconds between batch flushes |
| `max_batch` | `int` | `100` | Max traces per batch |
| `timeout` | `float` | `10.0` | HTTP request timeout in seconds |
| `debug` | `bool` | `False` | Enable debug logging |

A `ThetaConfigError` is raised if `api_key` or `project` cannot be resolved.

---

## Core Concepts

### Traces

A **trace** is the top-level unit of observability. It represents one complete agent run -- a conversation, a task execution, or an evaluation pass. Every trace has a unique `trace_id` with a `tr_` prefix.

### Steps

**Steps** are nested spans within a trace. Each step has a `type` that describes what kind of work it represents:

| Step Type | Description |
|-----------|-------------|
| `llm` | A language model call |
| `tool` | A tool or function invocation |
| `retrieval` | A retrieval / RAG lookup |
| `robotics` | A robotics action or sensor reading |
| `human` | A human-in-the-loop interaction |
| `annotation` | An annotation or labeling step |
| `custom` | Any other step type |

Steps can be nested (via `parent_step_id`) to represent hierarchical execution.

### Messages

Messages are logged within steps using the chat-message format: a `role` (`system`, `user`, `assistant`, `tool`) and a list of content parts. Content parts can be text, images, audio, video, sensor data, or files.

### Attachments

Media files (images, audio, video, sensor data, generic files) are automatically uploaded to cloud storage and referenced by URI in the trace payload.

---

## Basic Usage

```python
from theta_observability import TraceClient

client = TraceClient(api_key="tk_live_...", project="proj_abc")

with client.trace(name="checkout-agent", run_type="prod") as t:
    # LLM step
    with t.step(name="plan", type="llm", model="claude-sonnet-4-6") as s:
        s.log_message(role="user", text="Buy milk from the grocery store")
        s.log_message(role="assistant", text="I'll navigate to the grocery website and add milk to cart.")
        s.set_token_usage(input=150, output=45)

    # Tool step
    with t.step(name="execute", type="tool") as s:
        s.log_tool_call(
            name="browser.click",
            arguments={"selector": "#add-to-cart"},
            result={"ok": True},
        )

    # Retrieval step
    with t.step(name="lookup", type="retrieval") as s:
        s.log_message(role="user", text="What is the store's return policy?")
        s.log_message(role="assistant", text="Items can be returned within 30 days.")

    # Set trace-level metadata
    t.set_metadata(customer_id="cust_123", task="grocery-shopping")
    t.set_tags("checkout", "grocery")
    t.set_cost(0.0023)
```

### Trace parameters

```python
with client.trace(
    name="support-agent",       # Required: human-readable name
    run_id="run_abc123",        # Optional: group related traces
    run_type="eval",            # Optional: prod | eval | dev | test | replay | backfill | other
    use_case="customer-support",# Optional: categorize by use case
    user_id="user_456",         # Optional: end-user identifier
    group="experiment-a",       # Optional: grouping key
    platform="web",             # Optional: web | mobile | desktop | server | robot | sim | cli | other
    model="gpt-4o",             # Optional: primary model used
    tags=["v2", "beta"],        # Optional: free-form tags
    metadata={"version": "2.1"},# Optional: arbitrary key-value pairs
) as t:
    ...
```

### Nested steps

Steps can be nested by using context managers inside each other. Parent-child relationships are tracked automatically via `contextvars`:

```python
with client.trace(name="research-agent") as t:
    with t.step(name="research", type="custom") as parent:
        with t.step(name="search", type="retrieval") as child:
            child.log_message(role="user", text="quantum computing applications")

        with t.step(name="synthesize", type="llm", model="gpt-4o") as child:
            child.log_message(role="user", text="Summarize the findings")
            child.log_message(role="assistant", text="Key applications include...")
            child.set_token_usage(input=2000, output=500)
```

---

## Zero-Config Mode

For the fastest setup, use the module-level `trace()` function. It reads `THETA_API_KEY` and `THETA_PROJECT` from environment variables and creates a shared client automatically:

```python
from theta_observability import trace

with trace("my-agent") as t:
    with t.step(name="plan", type="llm", model="gpt-4o") as s:
        s.log_message(role="user", text="Hello")
        s.log_message(role="assistant", text="Hi there!")
        s.set_token_usage(input=10, output=5)
```

The shared client is created lazily on first use and reused for the lifetime of the process.

---

## Agent Wrapping

The `wrap_agent` API creates a trace automatically for every invocation of your agent function. The wrapper passes an `AgentContext` as the first argument and returns an `AgentResult` that unpacks to `(result, run_id)`.

### Decorator usage

```python
@client.wrap_agent("support-agent")
def my_agent(ctx, query):
    # ctx.trace is the live Trace object -- use it to create steps
    with ctx.trace.step(name="think", type="llm", model="gpt-4o") as s:
        answer = call_llm(query)
        s.log_message(role="user", text=query)
        s.log_message(role="assistant", text=answer)
        s.set_token_usage(input=100, output=50)

    # Signal completion and store the output in trace metadata
    ctx.on_complete(answer)
    return answer

result, run_id = my_agent("How do I reset my password?")
print(f"Answer: {result}")
print(f"Trace ID: {run_id}")
```

### Functional usage

```python
def my_agent_fn(ctx, query):
    answer = call_llm(query)
    ctx.on_complete(answer)
    return answer

agent = client.wrap_agent("support-agent", my_agent_fn)
result, run_id = agent("Help me")
```

### Async agents

Both decorator and functional usage support async functions transparently:

```python
@client.wrap_agent("async-agent")
async def my_async_agent(ctx, query):
    answer = await async_call_llm(query)
    ctx.on_complete(answer)
    return answer

result, run_id = await my_async_agent("Hello")
```

### AgentContext

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `ctx.trace` | `Trace` | The live trace for this invocation |
| `ctx.run_id` | `str` | The trace ID (same as `trace.model.trace_id`) |
| `ctx.on_complete(result)` | `None` | Store the agent output in trace metadata |

### AgentResult

`AgentResult` is tuple-unpackable:

```python
result, run_id = my_agent("input")

# Or use as an object:
agent_result = my_agent("input")
print(agent_result.result)
print(agent_result.run_id)
```

---

## Metrics

Record evaluation metrics against any trace. Metrics are fail-soft -- errors are logged as warnings and never raised into your code.

### Record a metric event

```python
# Boolean pass/fail
client.record_metric("task_adherence", trace_id, passed=True)

# Numeric score (0.0 - 1.0)
client.record_metric("user_satisfaction", trace_id, score=0.95)

# Categorical label
client.record_metric("sentiment", trace_id, label="positive")

# Combined
client.record_metric("quality", trace_id, passed=True, score=0.88)
```

### Create a metric definition

```python
client.create_metric(
    name="task_adherence",
    type="automated",
    evaluator_prompt="Did the agent complete the requested task? Answer pass or fail.",
)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `str` | Metric name |
| `type` | `str` | `"automated"`, `"human"`, `"hybrid"`, etc. |
| `evaluator_prompt` | `str` | Optional LLM prompt for automated evaluation |

---

## Multimodal Attachments

Attach images, audio, video, sensor data, and files to traces. Media is uploaded to cloud storage automatically. Sources can be file paths, bytes, file-like objects, or PIL images.

### Trace-level attachments

```python
with client.trace(name="vision-agent") as t:
    # Image -- from file path
    t.attach_image("screenshot.png")

    # Image -- from PIL
    from PIL import Image
    img = Image.open("photo.jpg")
    t.attach_image(img)

    # Audio -- from bytes
    with open("recording.wav", "rb") as f:
        t.attach_audio(f.read(), mime="audio/wav")

    # Video -- from file path
    t.attach_video("clip.mp4")

    # Sensor data -- specify modality
    t.attach_sensor("joint_states.parquet", modality="joint_state")

    # Generic file
    t.attach_file("output.json", mime="application/json")
```

### Message-level attachments

```python
with client.trace(name="multimodal-agent") as t:
    with t.step(name="analyze", type="llm", model="gpt-4o") as s:
        s.log_message(
            role="user",
            text="What is in this image?",
            images=["screenshot.png", another_pil_image],
        )
        s.log_message(
            role="assistant",
            text="The image shows a product page with a red button.",
        )
```

### Sensor frames

For robotics and embodied AI, log structured sensor frames within steps:

```python
with client.trace(name="robot-agent") as t:
    with t.step(name="grasp", type="robotics") as s:
        s.log_sensor_frame(
            modality="joint_state",
            source="joints.parquet",
            fps=30.0,
            duration_ms=2000,
            metadata={"robot": "franka-emika"},
        )
        s.log_sensor_frame(
            modality="camera",
            source="camera_feed.mp4",
            mime="video/mp4",
            fps=30.0,
        )
```

### Supported media sources

The `MediaInput` type accepts:

| Source Type | Example |
|-------------|---------|
| File path (`str`) | `"screenshot.png"` |
| `pathlib.Path` | `Path("./data/image.jpg")` |
| `bytes` | `b"\x89PNG..."` |
| File-like object | `open("file.bin", "rb")` |
| PIL Image | `Image.open("photo.jpg")` |

MIME types are auto-detected from file extensions. Pass `mime=` to override.

---

## LLM Integrations

### OpenAI

Wrap your OpenAI client so every `chat.completions.create` call is automatically traced:

```python
from openai import OpenAI
from theta_observability import TraceClient
from theta_observability.integrations.openai import wrap_openai

client = TraceClient()
oai = wrap_openai(OpenAI(), client)

with client.trace(name="chat") as t:
    response = oai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Explain quantum computing"}],
    )
```

The integration automatically:
- Creates an `llm` step named `openai.chat.completions`
- Logs input messages and the assistant response
- Captures token usage (`prompt_tokens`, `completion_tokens`)
- Handles streaming responses (tokens collected and finalized on stream end)
- Falls through to the original client when no trace is active

**Streaming support:**

```python
with client.trace(name="streaming-chat") as t:
    stream = oai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Write a poem"}],
        stream=True,
    )
    for chunk in stream:
        print(chunk.choices[0].delta.content or "", end="")
    # Token usage and full response are captured automatically on stream end
```

### Anthropic

```python
import anthropic
from theta_observability import TraceClient
from theta_observability.integrations.anthropic import wrap_anthropic

client = TraceClient()
claude = wrap_anthropic(anthropic.Anthropic(), client)

with client.trace(name="claude-chat") as t:
    response = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello, Claude"}],
    )
```

The Anthropic integration:
- Creates an `llm` step named `anthropic.messages`
- Logs input messages and the assistant response
- Captures token usage (`input_tokens`, `output_tokens`)
- Handles streaming (`content_block_delta`, `message_delta` events)

### Using integrations without explicit trace

Both integrations fall through gracefully when no trace is active -- the original SDK call executes normally with no tracing overhead.

---

## Decorator API

The `observe` decorator wraps a function in a step. If no trace is currently active, a trace is created automatically.

### Basic usage

```python
@client.observe(name="plan", type="llm")
def plan(query):
    response = call_llm(query)
    return response

# If called inside a trace, adds a step.
# If called outside a trace, creates a trace + step.
result = plan("What should I do?")
```

### Async support

```python
@client.observe(name="fetch-data", type="retrieval")
async def fetch_data(query):
    results = await vector_search(query)
    return results
```

### Module-level decorator

Uses the default client (from environment variables):

```python
from theta_observability import observe

@observe(name="analyze", type="llm")
def analyze(text):
    return call_llm(text)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | `str` | Function name | Step name |
| `type` | `StepType` | `"custom"` | Step type |
| `model` | `str` | `None` | Model identifier |

---

## Error Handling

### Automatic error capture

When an exception occurs inside a trace or step context manager, the status is automatically set to `"error"` and the error message is recorded:

```python
with client.trace(name="my-agent") as t:
    with t.step(name="risky-step", type="tool") as s:
        raise ValueError("Something went wrong")
    # Step status = "error", error_message = "ValueError: Something went wrong"
# Trace status = "error", error_message = "ValueError: Something went wrong"
# Exception is NOT suppressed -- it propagates to the caller
```

### Fail-soft batch sender

The background batch sender never raises exceptions into your application code. Network errors, API errors, and serialization failures are logged as warnings:

```python
import logging
logging.getLogger("theta_observability").setLevel(logging.WARNING)
```

### Graceful shutdown

Call `flush()` to ensure all pending traces are sent before your process exits:

```python
client.flush(timeout=10)  # Returns True if all traces were sent
```

Or use `close()` to flush and tear down the HTTP client:

```python
client.close(timeout=5)
```

The client also registers an `atexit` handler that calls `close(timeout=2)` automatically.

### Context manager

```python
with TraceClient(api_key="...", project="proj_abc") as client:
    with client.trace(name="agent") as t:
        ...
# client.close() called automatically on exit
```

### Error classes

| Exception | When |
|-----------|------|
| `ThetaConfigError` | Missing API key or project |
| `ThetaAuthError` | 401 or 403 from the API |
| `ThetaAPIError` | Non-auth API error (4xx/5xx) |
| `ThetaMediaUploadError` | Media upload failure |
| `ThetaObservabilityError` | Base class for all SDK errors |

---

## Full API Reference

### TraceClient

```python
class TraceClient:
    def __init__(
        self,
        api_key: str | None = None,
        project: str | None = None,
        base_url: str | None = None,
        flush_interval: float = 0.5,
        max_batch: int = 100,
        timeout: float = 10.0,
        debug: bool = False,
    ): ...
```

| Method | Returns | Description |
|--------|---------|-------------|
| `trace(name, *, run_id, run_type, use_case, user_id, group, platform, model, tags, metadata)` | `Trace` | Create a new trace (use as context manager) |
| `current_trace()` | `Trace \| None` | Return the active trace in the current context |
| `observe(name, type, model)` | decorator | Wrap a function in a step |
| `wrap_agent(name, func?)` | wrapper / decorator | Wrap an agent function for automatic tracing |
| `record_metric(metric_id_or_name, trace_id, *, passed, score, label)` | `None` | Record a metric event (fail-soft) |
| `create_metric(name, type, *, evaluator_prompt)` | `None` | Create a metric definition (fail-soft) |
| `flush(timeout=5.0)` | `bool` | Flush pending traces; returns success |
| `close(timeout=5.0)` | `None` | Flush + close HTTP client |

### Trace

```python
class Trace(AbstractContextManager["Trace"]):
    model: TraceModel  # Pydantic model with all trace fields
```

| Method | Returns | Description |
|--------|---------|-------------|
| `step(name, type, model, metadata)` | `Step` | Create a child step (use as context manager) |
| `attach_image(source, mime?)` | `str` | Upload and attach an image; returns GCS URI |
| `attach_audio(source, mime?)` | `str` | Upload and attach audio |
| `attach_video(source, mime?)` | `str` | Upload and attach video |
| `attach_file(source, mime?)` | `str` | Upload and attach a generic file |
| `attach_sensor(source, modality, mime?)` | `str` | Upload and attach sensor data |
| `annotate(label?, score?, comment?, user?)` | `None` | Add a trace-level annotation |
| `set_metadata(**kwargs)` | `None` | Merge key-value pairs into trace metadata |
| `set_tags(*tags)` | `None` | Add tags (deduplicated) |
| `set_cost(cost_usd)` | `None` | Set the trace cost in USD |
| `set_user(user_id)` | `None` | Set the end-user identifier |

### Step

```python
class Step(AbstractContextManager["Step"]):
    model: StepModel  # Pydantic model with all step fields
```

| Method | Returns | Description |
|--------|---------|-------------|
| `log_message(role, text?, images?, audio?, video?, tool_calls?)` | `None` | Append a chat message |
| `log_tool_call(name, arguments, result?, latency_ms?, error?)` | `ToolCall` | Log a tool invocation |
| `log_sensor_frame(modality, source, mime?, fps?, duration_ms?, metadata?)` | `SensorFrame` | Log a sensor frame |
| `set_token_usage(input, output, total?)` | `None` | Set token counts |
| `set_status(status)` | `None` | Override step status (`success`, `error`, `running`) |
| `set_metadata(**kwargs)` | `None` | Merge key-value pairs into step metadata |
| `set_model(model)` | `None` | Set or override the model identifier |
| `annotate(label?, score?, comment?, user?)` | `None` | Add a step-level annotation |

### Module-level functions

| Function | Description |
|----------|-------------|
| `trace(name, **kwargs)` | Zero-config trace using default client from env vars |
| `observe(name?, type?, model?)` | Zero-config decorator using default client |
| `get_default_client()` | Return or lazily create the process-global client |

---

*See also: [Node.js SDK](./node-sdk.md) | [REST API Reference](./api-reference.md) | [Trace Schema](./trace-schema.md)*
