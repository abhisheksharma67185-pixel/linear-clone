"""Verify trace/step context-managers produce the expected POST bodies."""

from __future__ import annotations

import json
import threading
from typing import Any

import httpx
import pytest

from theta_observability import TraceClient


class _Recorder:
    def __init__(self) -> None:
        self.requests: list[tuple[str, str, dict[str, Any]]] = []
        self._lock = threading.Lock()

    def handler(self, request: httpx.Request) -> httpx.Response:
        try:
            body = json.loads(request.content.decode()) if request.content else {}
        except Exception:
            body = {}
        with self._lock:
            self.requests.append((request.method, request.url.path, body))
        if request.url.path == "/v1/media/signed-url":
            return httpx.Response(
                200,
                json={
                    "url": "http://upload.example.com/abc",
                    "gs_uri": "gs://theta-obs/p/proj/att/abc",
                    "headers": {},
                },
            )
        if request.url.path == "/v1/media/upload":
            return httpx.Response(
                200,
                json={
                    "url": "",
                    "gs_uri": "gs://theta-obs/p/proj/att/uploaded",
                    "expires_at": "2099-01-01T00:00:00Z",
                },
            )
        return httpx.Response(200, json={"ok": True})


@pytest.fixture
def client_and_recorder(monkeypatch: pytest.MonkeyPatch) -> tuple[TraceClient, _Recorder]:
    recorder = _Recorder()

    # Intercept the TraceClient's HTTP client.
    def mk_client(self: TraceClient, *args: Any, **kwargs: Any) -> httpx.Client:
        return httpx.Client(transport=httpx.MockTransport(recorder.handler), base_url=self.base_url)

    client = TraceClient(api_key="test-key", project="proj_abc", base_url="http://test")
    client._http = httpx.Client(
        transport=httpx.MockTransport(recorder.handler),
        base_url="http://test",
        headers={"x-api-key": "test-key"},
    )
    client._batch._http = client._http
    # Also patch httpx.put for media uploads.
    monkeypatch.setattr("theta_observability.media.httpx.put",
                        lambda url, content, headers, timeout: httpx.Response(200))
    yield client, recorder
    client.close(timeout=2.0)


def _find(recorder: _Recorder, path_fragment: str) -> list[dict[str, Any]]:
    return [body for _, p, body in recorder.requests if path_fragment in p]


def test_trace_commit_emits_post_body(client_and_recorder: tuple[TraceClient, _Recorder]) -> None:
    client, rec = client_and_recorder

    with client.trace(name="checkout", run_type="eval", metadata={"git_sha": "abc"}) as t:
        with t.step(name="plan", type="llm", model="claude-opus-4.6") as s:
            s.log_message(role="user", text="Buy milk")
            s.set_token_usage(input=900, output=120)

    assert client.flush(timeout=3.0)

    commits = [body for m, p, body in rec.requests if m == "POST" and p == "/v1/traces"]
    assert len(commits) == 1
    trace = commits[0]
    assert trace["name"] == "checkout"
    assert trace["project_id"] == "proj_abc"
    assert trace["run_type"] == "eval"
    assert trace["metadata"] == {"git_sha": "abc"}
    assert trace["status"] == "success"
    assert len(trace["steps"]) == 1
    step = trace["steps"][0]
    assert step["type"] == "llm"
    assert step["model"] == "claude-opus-4.6"
    assert step["messages"][0]["role"] == "user"
    assert step["token_usage"]["input"] == 900


def test_exception_sets_error_status(client_and_recorder: tuple[TraceClient, _Recorder]) -> None:
    client, rec = client_and_recorder

    with pytest.raises(RuntimeError):
        with client.trace(name="bad") as t:
            with t.step(name="boom", type="tool"):
                raise RuntimeError("kaboom")

    assert client.flush(timeout=3.0)
    commits = [body for m, p, body in rec.requests if p == "/v1/traces"]
    assert commits[0]["status"] == "error"
    assert "kaboom" in (commits[0].get("error_message") or "")
    assert commits[0]["steps"][0]["status"] == "error"


def test_nested_steps_set_parent_id(client_and_recorder: tuple[TraceClient, _Recorder]) -> None:
    client, rec = client_and_recorder

    with client.trace(name="nested") as t:
        with t.step(name="outer", type="custom") as outer:
            with t.step(name="inner", type="custom") as inner:
                pass

    assert client.flush(timeout=3.0)
    commits = [body for m, p, body in rec.requests if p == "/v1/traces"]
    steps = {s["name"]: s for s in commits[0]["steps"]}
    assert steps["inner"]["parent_step_id"] == steps["outer"]["step_id"]


def test_observe_decorator_wraps_sync(client_and_recorder: tuple[TraceClient, _Recorder]) -> None:
    client, rec = client_and_recorder

    @client.observe(name="plan", type="llm")
    def plan(x: int) -> int:
        return x + 1

    assert plan(2) == 3
    assert client.flush(timeout=3.0)
    commits = [body for m, p, body in rec.requests if p == "/v1/traces"]
    assert commits and commits[0]["steps"][0]["name"] == "plan"


def test_set_metadata_path_writes_nested_json(
    client_and_recorder: tuple[TraceClient, _Recorder],
) -> None:
    client, rec = client_and_recorder

    with client.trace(name="checkout") as t:
        t.set_metadata_path("workflow.stage", "checkout")
        with t.step(name="plan", type="llm") as s:
            s.set_metadata_path("agent.version", "v2")

    assert client.flush(timeout=3.0)
    commits = [body for m, p, body in rec.requests if p == "/v1/traces"]
    assert commits[0]["metadata"] == {"workflow": {"stage": "checkout"}}
    assert commits[0]["steps"][0]["metadata"] == {"agent": {"version": "v2"}}


def test_attach_image_bytes_uploads_and_returns_gs_uri(
    client_and_recorder: tuple[TraceClient, _Recorder],
) -> None:
    client, rec = client_and_recorder
    with client.trace(name="media") as t:
        uri = t.attach_image(b"\x89PNG\r\n\x1a\nfake", mime="image/png")
    assert uri.startswith("gs://")
    uploads = [1 for m, p, body in rec.requests if p.startswith("/v1/media/upload")]
    assert len(uploads) >= 1


def test_trace_and_step_attachments_are_serialized(
    client_and_recorder: tuple[TraceClient, _Recorder],
) -> None:
    client, rec = client_and_recorder

    with client.trace(name="multimodal") as t:
        trace_uri = t.attach_image(b"\x89PNG\r\n\x1a\nfake", mime="image/png")
        with t.step(name="respond", type="robotics") as s:
            step_uri = s.attach_file(b'{"ok":true}', mime="application/json")
            sensor_uri = s.attach_sensor(
                b"JOINTv1\x00\x01",
                modality="joint_state",
                mime="application/octet-stream",
            )
            s.log_message(
                role="user",
                text="Inspect the uploaded payload.",
                attachments=[b'{"source":"sdk"}'],
            )

    assert client.flush(timeout=3.0)
    commits = [body for m, p, body in rec.requests if p == "/v1/traces"]

    assert trace_uri.startswith("gs://")
    assert step_uri.startswith("gs://")
    assert sensor_uri.startswith("gs://")
    assert commits[0]["attachments"][0]["type"] == "image"
    assert commits[0]["steps"][0]["attachments"][0]["type"] == "file"
    assert commits[0]["steps"][0]["attachments"][1]["type"] == "sensor"
    assert commits[0]["steps"][0]["messages"][0]["content"][1]["type"] == "file"
