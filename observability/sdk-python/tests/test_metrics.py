from __future__ import annotations

import json
import threading
from typing import Any

import httpx

from theta_observability import TraceClient


class _Recorder:
    def __init__(self) -> None:
        self.requests: list[tuple[str, str, dict[str, Any]]] = []
        self._lock = threading.Lock()

    def handler(self, request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content.decode()) if request.content else {}
        with self._lock:
            self.requests.append((request.method, request.url.path, body))
        return httpx.Response(200, json={"ok": True})


def test_record_metric_uses_top_level_fields() -> None:
    recorder = _Recorder()
    client = TraceClient(api_key="test-key", project="proj_abc", base_url="http://test")
    client._http = httpx.Client(
        transport=httpx.MockTransport(recorder.handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )
    client.record_metric("task_adherence", "tr_123", passed=True, score=0.9)

    method, path, body = recorder.requests[0]
    assert method == "POST"
    assert path == "/v1/metrics/task_adherence/events"
    assert body["trace_id"] == "tr_123"
    assert body["passed"] is True
    assert body["score"] == 0.9
    assert "value" not in body


def test_create_metric_includes_project_id() -> None:
    recorder = _Recorder()
    client = TraceClient(api_key="test-key", project="proj_abc", base_url="http://test")
    client._http = httpx.Client(
        transport=httpx.MockTransport(recorder.handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )
    client.create_metric("task_adherence", "observed", description="Checks adherence")

    _, path, body = recorder.requests[0]
    assert path == "/v1/metrics"
    assert body["project_id"] == "proj_abc"
    assert body["name"] == "task_adherence"
    assert body["type"] == "observed"
    assert body["description"] == "Checks adherence"


def test_list_traces_supports_metadata_filters() -> None:
    recorder = _Recorder()
    client = TraceClient(api_key="test-key", project="proj_abc", base_url="http://test")
    client._http = httpx.Client(
        transport=httpx.MockTransport(recorder.handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )

    def handler(request: httpx.Request) -> httpx.Response:
        recorder.requests.append((request.method, str(request.url), {}))
        return httpx.Response(
            200,
            json={
                "items": [
                    {
                        "trace_id": "tr_123",
                        "project_id": "proj_abc",
                        "name": "checkout",
                        "status": "success",
                        "metadata": {"workflow": {"stage": "checkout"}},
                        "started_at": "2026-04-17T00:00:00Z",
                    }
                ],
                "next_cursor": "cursor-1",
            },
        )

    client._http = httpx.Client(
        transport=httpx.MockTransport(handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )

    response = client.list_traces(
        run_type="prod",
        metadata_filters=[{"key": "workflow.stage", "value": "checkout"}],
    )

    method, url, _ = recorder.requests[0]
    assert method == "GET"
    assert "run_type=prod" in url
    assert "meta_key=workflow.stage" in url
    assert "meta_value=checkout" in url
    assert response.data[0].metadata == {"workflow": {"stage": "checkout"}}
    assert response.next_cursor == "cursor-1"
