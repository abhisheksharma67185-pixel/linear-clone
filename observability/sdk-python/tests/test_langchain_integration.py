from __future__ import annotations

import json
import threading
from typing import Any

import httpx

from theta_observability import TraceClient
from theta_observability.integrations.langchain import wrap_langchain_runnable


class _Recorder:
    def __init__(self) -> None:
        self.requests: list[tuple[str, str, dict[str, Any]]] = []
        self._lock = threading.Lock()

    def handler(self, request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content.decode()) if request.content else {}
        with self._lock:
            self.requests.append((request.method, request.url.path, body))
        return httpx.Response(200, json={"ok": True})


class _DummyRunnable:
    def invoke(self, input_value: Any) -> dict[str, Any]:
        return {"content": f"answer:{input_value}"}


class _DummyStreamingRunnable:
    def stream(self, input_value: Any):  # noqa: ANN201
        yield {"content": "hello "}
        yield {"content": input_value}


def test_wrap_langchain_runnable_records_invoke() -> None:
    recorder = _Recorder()
    client = TraceClient(api_key="test-key", project="proj_abc", base_url="http://test")
    client._http = httpx.Client(
        transport=httpx.MockTransport(recorder.handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )
    client._batch._http = client._http

    runnable = wrap_langchain_runnable(_DummyRunnable(), client, name="langchain-demo")
    result = runnable.invoke("hello")
    assert result == {"content": "answer:hello"}
    assert client.flush(timeout=3.0)

    traces = [body for method, path, body in recorder.requests if method == "POST" and path == "/v1/traces"]
    assert traces[0]["name"] == "langchain-demo"
    assert traces[0]["steps"][0]["messages"][0]["content"][0]["text"] == "hello"
    assert traces[0]["steps"][0]["messages"][-1]["content"][0]["text"] == "answer:hello"


def test_wrap_langchain_runnable_records_stream() -> None:
    recorder = _Recorder()
    client = TraceClient(api_key="test-key", project="proj_abc", base_url="http://test")
    client._http = httpx.Client(
        transport=httpx.MockTransport(recorder.handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )
    client._batch._http = client._http

    runnable = wrap_langchain_runnable(_DummyStreamingRunnable(), client, name="langchain-stream")
    output = list(runnable.stream("world"))
    assert output == [{"content": "hello "}, {"content": "world"}]
    assert client.flush(timeout=3.0)

    traces = [body for method, path, body in recorder.requests if method == "POST" and path == "/v1/traces"]
    assert traces[0]["name"] == "langchain-stream"
    assert traces[0]["steps"][0]["messages"][0]["content"][0]["text"] == "world"
    assert traces[0]["steps"][0]["messages"][-1]["content"][0]["text"] == "hello world"
