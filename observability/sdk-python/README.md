# theta-observability

Python SDK for [Theta Observability](https://theta-observability.com) — multimodal
agent tracing for LLM + tool + robotics workflows. Text, images, audio, video,
and sensor frames flow through a single `with client.trace(...) as t: ...` API.

## Install

```bash
pip install theta-observability
# optional extras
pip install "theta-observability[openai,anthropic,pil]"
```

Python 3.10+.

## Quickstart (zero-config)

```bash
export THETA_API_KEY=tk_live_...
export THETA_PROJECT=proj_abc
```

```python
from theta_observability import trace

with trace("checkout-agent", run_type="eval") as t:
    with t.step(name="plan", type="llm", model="claude-opus-4.6") as s:
        s.log_message(role="user", text="Buy milk", images=["./screen.png"])
        s.log_message(role="assistant", text="Clicking the Buy button.")
        s.set_token_usage(input=900, output=120)
```

The module-level `trace()` constructs a process-global `TraceClient` from
environment variables and auto-flushes at interpreter exit.

## Explicit client

```python
from theta_observability import TraceClient

client = TraceClient(api_key="...", project="proj_abc")
with client.trace("checkout", metadata={"git_sha": "abc"}) as t:
    ...
client.flush(timeout=5.0)
```

### Constructor options

| arg              | default                                   | purpose                       |
| ---------------- | ----------------------------------------- | ----------------------------- |
| `api_key`        | `$THETA_API_KEY`                          | project API key               |
| `project`        | `$THETA_PROJECT`                          | project id                    |
| `base_url`       | `$THETA_BASE_URL` → `api.theta-observability.com` | ingest API          |
| `flush_interval` | `0.5`                                     | seconds                       |
| `max_batch`      | `100`                                     | events per flush              |
| `timeout`        | `10`                                      | HTTP timeout (seconds)        |
| `debug`          | `False`                                   | log retries + 4xx responses   |

## Full DX example — multimodal

```python
from pathlib import Path
from theta_observability import TraceClient

client = TraceClient()

with client.trace(
    name="checkout-agent",
    run_type="eval",
    use_case="web-shopping",
    platform="web",
    tags=["demo", "multimodal"],
    metadata={"git_sha": "abc"},
) as t:

    # 1. LLM step with an image
    with t.step(name="plan", type="llm", model="claude-opus-4.6") as s:
        s.log_message(role="user", text="Buy milk", images=[Path("screen.png")])
        s.log_message(role="assistant", text="Clicking the Buy button.")
        s.set_token_usage(input=1820, output=412)

    # 2. Tool step
    with t.step(name="click", type="tool") as s:
        s.log_tool_call(
            name="browser.click",
            arguments={"selector": "#buy"},
            result={"ok": True},
            latency_ms=45,
        )

    # 3. Robotics step with a sensor frame
    with t.step(name="capture", type="robotics") as s:
        s.log_sensor_frame(modality="camera", source="rgb.mp4", fps=30.0)

    t.annotate(label="good", score=1.0, comment="demo")
    t.set_cost(0.0133)
```

Attachments accept `str | pathlib.Path | bytes | io.BufferedReader | PIL.Image.Image`.
Each upload requests a signed URL from the ingest API and PUTs the blob directly
to GCS; the returned `gs://` uri is embedded in the trace JSON.

## Decorator

```python
@client.observe(name="plan", type="llm", model="gpt-4o")
def plan(goal: str) -> str:
    ...

@client.observe(type="tool")
async def fetch(url: str) -> str:
    ...
```

If no trace is active when the function is called, a trace is created just for
that call. Otherwise the step joins the surrounding trace.

## Framework integrations

```python
from openai import OpenAI
from theta_observability import TraceClient
from theta_observability.integrations.openai import wrap_openai

obs = TraceClient()
oai = wrap_openai(OpenAI(), obs)

with obs.trace("qa"):
    oai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello"}],
    )
```

`wrap_openai` and `wrap_anthropic` patch `chat.completions.create` /
`messages.create` (sync + async + streaming) to emit an `llm` step with model,
messages, response text, and token usage.

## Reliability notes

- **Fail-soft**: all network errors are logged but never raised into user code.
- **Thread-safe**: a single client can be shared across threads; traces use a
  `ContextVar` so nested steps work correctly in async code.
- **At-exit flush**: an `atexit` handler flushes outstanding batches with a
  2-second grace period. Call `client.flush(timeout=...)` before shutdown if
  you need a hard guarantee.
- **Retries**: 5xx and 429 responses are retried with exponential backoff (up
  to 5 attempts). 4xx responses are dropped (and logged in `debug=True`).

## Development

```bash
pip install -e ".[dev,openai,anthropic]"
pytest
```

Tests use `httpx.MockTransport` to stub the ingest API — no network required.
