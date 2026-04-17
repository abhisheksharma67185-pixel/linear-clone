"""Unit tests for :mod:`theta_observability.batch`."""

from __future__ import annotations

import threading
from typing import Any

import httpx
import pytest

from theta_observability.batch import BatchSender


def _mk(handler: Any) -> tuple[httpx.Client, BatchSender]:
    http = httpx.Client(transport=httpx.MockTransport(handler), base_url="http://test")
    sender = BatchSender(http=http, flush_interval=0.02, debug=True)
    return http, sender


def test_flush_waits_for_queue_to_drain() -> None:
    calls: list[str] = []

    def h(req: httpx.Request) -> httpx.Response:
        calls.append(req.url.path)
        return httpx.Response(200, json={"ok": True})

    http, sender = _mk(h)
    try:
        for i in range(5):
            sender.submit("POST", f"/v1/thing/{i}", {"i": i})
        assert sender.flush(timeout=3.0)
        assert len(calls) == 5
    finally:
        sender.close(timeout=2.0)
        http.close()


def test_retry_on_5xx_then_success() -> None:
    state = {"n": 0}
    lock = threading.Lock()

    def h(req: httpx.Request) -> httpx.Response:
        with lock:
            state["n"] += 1
            n = state["n"]
        if n < 2:
            return httpx.Response(503, json={"error": "busy"})
        return httpx.Response(200, json={"ok": True})

    http, sender = _mk(h)
    try:
        sender.submit("POST", "/v1/traces", {"trace_id": "x"})
        assert sender.flush(timeout=5.0)
        assert state["n"] >= 2
    finally:
        sender.close(timeout=2.0)
        http.close()


def test_fails_soft_on_persistent_error() -> None:
    def h(req: httpx.Request) -> httpx.Response:
        return httpx.Response(500)

    http, sender = _mk(h)
    try:
        sender.submit("POST", "/v1/traces", {"trace_id": "x"})
        # Should never raise; eventually gives up.
        sender.flush(timeout=5.0)
    finally:
        sender.close(timeout=2.0)
        http.close()


def test_4xx_is_not_retried() -> None:
    calls: list[int] = []

    def h(req: httpx.Request) -> httpx.Response:
        calls.append(1)
        return httpx.Response(400, json={"error": "bad"})

    http, sender = _mk(h)
    try:
        sender.submit("POST", "/v1/traces", {"trace_id": "x"})
        assert sender.flush(timeout=3.0)
        assert len(calls) == 1
    finally:
        sender.close(timeout=2.0)
        http.close()
