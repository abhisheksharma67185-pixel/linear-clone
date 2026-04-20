from __future__ import annotations

import httpx

from theta_observability import TraceClient


def test_get_trace_returns_detail_payload() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "GET"
        assert request.url.path == "/v1/traces/tr_123"
        return httpx.Response(
            200,
            json={
                "meta": {
                    "trace_id": "tr_123",
                    "project_id": "proj_abc",
                    "name": "checkout",
                    "status": "success",
                    "started_at": "2026-04-18T00:00:00Z",
                },
                "trace": {
                    "schema_version": "1.0",
                    "trace_id": "tr_123",
                    "project_id": "proj_abc",
                    "name": "checkout",
                    "status": "success",
                    "started_at": "2026-04-18T00:00:00Z",
                    "steps": [
                        {
                            "step_id": "st_123",
                            "type": "llm",
                            "name": "plan",
                            "started_at": "2026-04-18T00:00:00Z",
                        }
                    ],
                },
            },
        )

    client = TraceClient(api_key="test-key", project="proj_abc", base_url="http://test")
    client._http = httpx.Client(
        transport=httpx.MockTransport(handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )

    detail = client.get_trace("tr_123")

    assert detail is not None
    assert detail.meta.trace_id == "tr_123"
    assert detail.trace is not None
    assert detail.trace.steps[0].name == "plan"


def test_ingest_events_posts_canonical_envelope() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "POST"
        assert request.url.path == "/v1/events"
        payload = request.read().decode("utf-8")
        assert '"project_id":"proj_abc"' in payload or '"project_id": "proj_abc"' in payload
        return httpx.Response(
            202,
            json={"trace_id": "tr_canonical", "ingest_status": "accepted", "normalized": True},
        )

    client = TraceClient(api_key="test-key", project="proj_abc", base_url="http://test")
    client._http = httpx.Client(
        transport=httpx.MockTransport(handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )

    result = client.ingest_events({"name": "canonical", "events": [{"type": "message"}]})

    assert result["trace_id"] == "tr_canonical"
    assert result["normalized"] is True


def test_import_traces_posts_bulk_payload() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "POST"
        assert request.url.path == "/v1/imports/traces"
        return httpx.Response(
            202,
            json={
                "accepted": 2,
                "failed": 0,
                "items": [
                    {"index": 0, "kind": "trace", "trace_id": "tr_1", "status": "accepted"},
                    {"index": 1, "kind": "canonical_envelope", "trace_id": "tr_2", "status": "accepted"},
                ],
            },
        )

    client = TraceClient(api_key="test-key", project="proj_abc", base_url="http://test")
    client._http = httpx.Client(
        transport=httpx.MockTransport(handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )

    result = client.import_traces(
        [
            {
                "schema_version": "1.0",
                "trace_id": "tr_1",
                "project_id": "proj_abc",
                "name": "native",
                "status": "success",
                "started_at": "2026-04-18T00:00:00Z",
                "steps": [],
            },
            {"name": "canonical", "events": []},
        ]
    )

    assert result.accepted == 2
    assert result.failed == 0
