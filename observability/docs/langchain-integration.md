# LangChain Integration

Theta now ships runnable-level LangChain adapters for both SDKs.

## Node

Import the adapter from the SDK package subpath:

```ts
import { TraceClient } from "@theta/observability";
import { wrapLangChainRunnable } from "@theta/observability/langchain";

const theta = new TraceClient({
  apiKey: process.env.THETA_API_KEY,
  project: process.env.THETA_PROJECT,
  baseUrl: process.env.THETA_BASE_URL,
});

const wrapped = wrapLangChainRunnable(runnable, {
  client: theta,
  name: "support-chain",
});

const result = await wrapped.invoke("Summarize this thread");
```

## Python

```python
from theta_observability import TraceClient
from theta_observability.integrations.langchain import wrap_langchain_runnable

client = TraceClient(
    api_key="...",
    project="proj_...",
    base_url="http://localhost:8080",
)

wrapped = wrap_langchain_runnable(runnable, client, name="support-chain")
result = wrapped.invoke("Summarize this thread")
```

## Supported paths

- `invoke` / `ainvoke`
- `stream` / `astream`

The adapters record a top-level trace with one runnable step, input payload capture, and aggregated output capture for invoke and stream flows.
