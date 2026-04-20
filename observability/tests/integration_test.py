"""Integration tests for the full Theta Observability stack.

Requires:
  - Go API running at http://localhost:8080
  - Postgres, fake-gcs, BQ emulator running
  - A valid API key (set THETA_API_KEY) and project (set THETA_PROJECT)

Run:
  THETA_API_KEY=tk_... THETA_PROJECT=proj_... pytest observability/tests/integration_test.py -v
"""
import base64
import hashlib
import hmac
import json
import os
import time

import httpx
import pytest

API_URL = os.environ.get("THETA_BASE_URL", "http://localhost:8080")
API_KEY = os.environ.get("THETA_API_KEY", "")
PROJECT = os.environ.get("THETA_PROJECT", "")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-jwt-secret-change-me")

pytestmark = pytest.mark.skipif(
    not API_KEY or not PROJECT,
    reason="THETA_API_KEY and THETA_PROJECT required for integration tests",
)


@pytest.fixture(scope="module")
def http():
    with httpx.Client(
        base_url=API_URL,
        headers={"x-api-key": API_KEY, "content-type": "application/json"},
        timeout=30,
    ) as c:
        yield c


@pytest.fixture(scope="module")
def sdk_client():
    from theta_observability import TraceClient
    return TraceClient(api_key=API_KEY, project=PROJECT, base_url=API_URL)


def _jwt_b64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def mint_dashboard_jwt(user_id: str, org_id: str, ttl_s: int = 3600) -> str:
    now = int(time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": "test@theta.dev",
        "orgs": [org_id],
        "iat": now,
        "exp": now + ttl_s,
    }
    signing_input = ".".join(
        [
            _jwt_b64url(json.dumps(header, separators=(",", ":")).encode()),
            _jwt_b64url(json.dumps(payload, separators=(",", ":")).encode()),
        ]
    )
    signature = hmac.new(JWT_SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{_jwt_b64url(signature)}"


# ──────────────────────────────────────────────────────────────────────────
# Health
# ──────────────────────────────────────────────────────────────────────────

class TestHealth:
    def test_healthz(self, http: httpx.Client):
        r = http.get("/healthz")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_readyz(self, http: httpx.Client):
        r = http.get("/readyz")
        assert r.status_code == 200


# ──────────────────────────────────────────────────────────────────────────
# Trace ingest
# ──────────────────────────────────────────────────────────────────────────

class TestTraceIngest:
    def test_post_trace(self, http: httpx.Client):
        trace = {
            "schema_version": "1.0",
            "trace_id": f"tr_test_{int(time.time())}",
            "project_id": PROJECT,
            "name": "integration-test-trace",
            "status": "success",
            "run_type": "eval",
            "started_at": "2026-04-17T00:00:00Z",
            "ended_at": "2026-04-17T00:00:01Z",
            "latency_ms": 1000,
            "steps": [
                {
                    "step_id": "st_1",
                    "type": "llm",
                    "name": "test-step",
                    "messages": [
                        {"role": "user", "content": [{"type": "text", "text": "hello"}]},
                        {"role": "assistant", "content": [{"type": "text", "text": "hi"}]},
                    ],
                }
            ],
        }
        r = http.post("/v1/traces", json=trace)
        assert r.status_code == 202, r.text
        body = r.json()
        assert "trace_id" in body

    def test_list_traces(self, http: httpx.Client):
        deadline = time.time() + 5
        body = {"items": []}
        while time.time() < deadline:
            r = http.get(f"/v1/traces?project_id={PROJECT}&limit=5")
            assert r.status_code == 200
            body = r.json()
            assert "items" in body
            if len(body["items"]) > 0:
                break
            time.sleep(0.5)
        assert len(body["items"]) > 0

    def test_get_trace(self, http: httpx.Client):
        # Get first trace
        r = http.get(f"/v1/traces?project_id={PROJECT}&limit=1")
        trace_id = r.json()["items"][0]["trace_id"]
        r2 = http.get(f"/v1/traces/{trace_id}")
        assert r2.status_code == 200
        body = r2.json()
        assert "trace" in body
        assert body["trace"]["trace_id"] == trace_id


# ──────────────────────────────────────────────────────────────────────────
# Media upload
# ──────────────────────────────────────────────────────────────────────────

class TestMediaUpload:
    def test_proxy_upload(self, http: httpx.Client):
        # Upload a tiny PNG
        png = bytes.fromhex(
            "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
            "0000000d49444154789c6300010000000500010d0a2db40000000049454e44ae426082"
        )
        r = http.post(
            "/v1/media/upload?trace_id=tr_test_media&name=test.png",
            content=png,
            headers={
                "x-api-key": API_KEY,
                "content-type": "image/png",
            },
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["gs_uri"].startswith("gs://")


# ──────────────────────────────────────────────────────────────────────────
# Search
# ──────────────────────────────────────────────────────────────────────────

class TestSearch:
    def test_search(self, http: httpx.Client):
        r = http.post(
            "/v1/search",
            json={"query": "hello test", "project_id": PROJECT, "limit": 5},
        )
        assert r.status_code == 200
        body = r.json()
        assert "results" in body

    def test_search_empty_query(self, http: httpx.Client):
        r = http.post(
            "/v1/search",
            json={"query": "", "project_id": PROJECT},
        )
        assert r.status_code == 400


# ──────────────────────────────────────────────────────────────────────────
# Python SDK
# ──────────────────────────────────────────────────────────────────────────

class TestPythonSDK:
    def test_trace_context_manager(self, sdk_client):
        with sdk_client.trace(name="sdk-integration-test", run_type="eval") as t:
            with t.step(name="test-step", type="llm") as s:
                s.log_message(role="user", text="integration test")
                s.log_message(role="assistant", text="ok")
                s.set_token_usage(input=10, output=5)
        sdk_client.flush(timeout=10)
        # Trace was committed without error

    def test_wrap_agent(self, sdk_client):
        @sdk_client.wrap_agent("sdk-test-agent")
        def agent(ctx, query):
            ctx.on_complete(f"done: {query}")
            return f"done: {query}"

        result, run_id = agent("test")
        assert result == "done: test"
        assert run_id.startswith("tr_")
        sdk_client.flush(timeout=10)

    def test_record_metric(self, sdk_client):
        @sdk_client.wrap_agent("metric-test-agent")
        def agent(ctx, q):
            ctx.on_complete("ok")
            return "ok"

        _, run_id = agent("test")
        sdk_client.record_metric("task_adherence", run_id, passed=True)
        sdk_client.record_metric("user_satisfaction", run_id, score=0.95)
        sdk_client.flush(timeout=10)

        resp = sdk_client._http.get(f"/v1/traces/{run_id}/metrics")
        assert resp.status_code == 200, resp.text
        items = resp.json()["items"]
        names = {item["metric_name"] for item in items}
        assert "task_adherence" in names
        assert "user_satisfaction" in names

    def test_attach_image(self, sdk_client):
        png = bytes.fromhex(
            "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
            "0000000d49444154789c6300010000000500010d0a2db40000000049454e44ae426082"
        )
        with sdk_client.trace(name="attach-test") as t:
            uri = t.attach_image(png, mime="image/png")
        sdk_client.flush(timeout=10)
        assert uri.startswith("gs://")

    def test_error_trace(self, sdk_client):
        try:
            with sdk_client.trace(name="error-test", run_type="eval") as t:
                with t.step(name="failing", type="tool") as s:
                    s.log_tool_call(name="crash", arguments={}, result={"error": "boom"})
                    raise RuntimeError("test error")
        except RuntimeError:
            pass
        sdk_client.flush(timeout=10)
        # Trace committed with status=error

    def test_multimodal_attach(self, sdk_client):
        with sdk_client.trace(name="multimodal-test") as t:
            img = t.attach_image(b"\x89PNG\r\n\x1a\nfake", mime="image/png")
            aud = t.attach_audio(b"RIFF" + b"\x00" * 40, mime="audio/wav")
            vid = t.attach_video(b"\x00\x00\x00\x20ftyp", mime="video/mp4")
            fil = t.attach_file(b'{"test":true}', mime="application/json")
        sdk_client.flush(timeout=10)
        assert img.startswith("gs://")
        assert aud.startswith("gs://")
        assert vid.startswith("gs://")
        assert fil.startswith("gs://")


# ──────────────────────────────────────────────────────────────────────────
# Incidents
# ──────────────────────────────────────────────────────────────────────────

class TestIncidents:
    def test_detect(self, http: httpx.Client):
        with open("/tmp/signup.json", "r", encoding="utf-8") as handle:
            signup = json.load(handle)
        token = mint_dashboard_jwt(signup["user_id"], signup["org_id"])
        r = http.post(
            "/v1/incidents/detect",
            json={"project_id": PROJECT},
            headers={"authorization": f"Bearer {token}", "content-type": "application/json"},
        )
        assert r.status_code == 200, r.text

    def test_list_incidents(self, http: httpx.Client):
        with open("/tmp/signup.json", "r", encoding="utf-8") as handle:
            signup = json.load(handle)
        token = mint_dashboard_jwt(signup["user_id"], signup["org_id"])
        r = http.get(
            f"/v1/incidents?project_id={PROJECT}",
            headers={"authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200
        assert "items" in r.json()


# ──────────────────────────────────────────────────────────────────────────
# Dashboard
# ──────────────────────────────────────────────────────────────────────────

class TestDashboard:
    @pytest.mark.parametrize("path", [
        "/", "/login", "/docs", "/docs/quickstart",
        "/docs/python/traces", "/docs/node/traces",
        "/docs/api", "/docs/self-hosting",
    ])
    def test_page_responds(self, path):
        r = httpx.get(f"http://localhost:3100{path}", follow_redirects=True, timeout=10)
        assert r.status_code == 200, f"{path} returned {r.status_code}"
