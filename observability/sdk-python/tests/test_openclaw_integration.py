from __future__ import annotations

import json
import threading
from typing import Any

import httpx

from theta_observability import TraceClient
from theta_observability.integrations.openclaw import wrap_openclaw


class _Recorder:
    def __init__(self) -> None:
        self.requests: list[tuple[str, str, dict[str, Any]]] = []
        self._lock = threading.Lock()

    def handler(self, request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content.decode()) if request.content else {}
        with self._lock:
            self.requests.append((request.method, request.url.path, body))
        return httpx.Response(200, json={"ok": True})


class _DummyResponses:
    def create(self, **_: Any) -> dict[str, Any]:
        return {
            "output_text": "hello from openclaw",
            "usage": {"input_tokens": 3, "output_tokens": 2},
        }


class _DummyClient:
    def __init__(self) -> None:
        self.responses = _DummyResponses()


def test_wrap_openclaw_records_response_into_trace() -> None:
    recorder = _Recorder()
    client = TraceClient(api_key="test-key", project="proj_abc", base_url="http://test")
    client._http = httpx.Client(
        transport=httpx.MockTransport(recorder.handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )
    client._batch._http = client._http

    wrapped = wrap_openclaw(_DummyClient(), client)
    with client.trace(name="openclaw-test") as trace:
        with trace.step(name="outer", type="tool"):
            wrapped.responses.create(
                model="openclaw-sonic",
                instructions="Be concise",
                input=[{"type": "message", "role": "user", "content": [{"type": "input_text", "text": "hi"}]}],
            )
    assert client.flush(timeout=3.0)

    traces = [body for method, path, body in recorder.requests if method == "POST" and path == "/v1/traces"]
    step = next(item for item in traces[0]["steps"] if item["name"] == "openclaw.responses")
    assert step["name"] == "openclaw.responses"
    assert step["messages"][0]["role"] == "system"
    assert step["messages"][1]["role"] == "user"
    assert step["messages"][-1]["content"][0]["text"] == "hello from openclaw"
    assert step["token_usage"]["total"] == 5
