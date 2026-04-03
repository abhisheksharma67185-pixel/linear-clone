"""Low-level HTTP client wrapper for SimBench API."""

from __future__ import annotations
from typing import Any, Optional
import httpx

from simbench.types import (
    EpisodeStartResponse,
    EpisodeFinishResponse,
    StepResponse,
    TaskListResponse,
    CurriculumResponse,
    EvalResult,
)


class SimBenchError(Exception):
    """Error from the SimBench API with structured context."""

    def __init__(self, status_code: int, detail: str, url: str):
        self.status_code = status_code
        self.detail = detail
        self.url = url
        super().__init__(f"SimBench API error {status_code} ({url}): {detail}")


def _check_response(resp: httpx.Response) -> None:
    """Raise SimBenchError with the server's error message if request failed."""
    if resp.is_success:
        return
    try:
        body = resp.json()
        detail = body.get("error", resp.text)
    except Exception:
        detail = resp.text
    raise SimBenchError(resp.status_code, detail, str(resp.url))


class SimBenchClient:
    """Thin wrapper around SimBench HTTP endpoints."""

    def __init__(self, base_url: str = "http://localhost:3000", timeout: float = 30.0):
        self.base_url = base_url.rstrip("/")
        self._client = httpx.Client(base_url=self.base_url, timeout=timeout)

    # -- Episode lifecycle --

    def start_episode(
        self,
        task_id: str,
        mode: str = "rest",
        seed: Optional[int] = None,
        config_overrides: Optional[dict[str, Any]] = None,
    ) -> EpisodeStartResponse:
        body: dict[str, Any] = {"task_id": task_id, "mode": mode}
        if seed is not None:
            body["seed"] = seed
        if config_overrides:
            body["config_overrides"] = config_overrides
        resp = self._client.post("/api/sim/config", json=body)
        _check_response(resp)
        return EpisodeStartResponse(**resp.json())

    def finish_episode(self, agent_response: Optional[str] = None) -> EpisodeFinishResponse:
        body: dict[str, Any] = {}
        if agent_response is not None:
            body["agent_response"] = agent_response
        resp = self._client.post("/api/sim/finish", json=body)
        _check_response(resp)
        return EpisodeFinishResponse(**resp.json())

    def evaluate(self) -> EvalResult:
        resp = self._client.post("/api/sim/evaluate")
        _check_response(resp)
        return EvalResult(**resp.json())

    # -- RL step --

    def step(self, action: dict[str, Any]) -> StepResponse:
        resp = self._client.post("/api/rl", json=action)
        _check_response(resp)
        return StepResponse(**resp.json())

    def observe(self) -> dict[str, Any]:
        resp = self._client.get("/api/rl")
        _check_response(resp)
        return resp.json()

    def reset_env(self) -> dict[str, Any]:
        resp = self._client.post("/api/rl/reset")
        _check_response(resp)
        return resp.json()

    # -- State --

    def get_state(self, diff: bool = False) -> dict[str, Any]:
        params = {"diff": "true"} if diff else {}
        resp = self._client.get("/api/sim/state", params=params)
        _check_response(resp)
        return resp.json()

    def get_snapshot(self) -> dict[str, Any]:
        resp = self._client.get("/api/sim/snapshot")
        _check_response(resp)
        return resp.json()

    def get_episode(self) -> dict[str, Any]:
        resp = self._client.get("/api/sim/episode")
        _check_response(resp)
        return resp.json()

    # -- Tasks --

    def list_tasks(self, **filters: Any) -> TaskListResponse:
        params = {k: str(v) for k, v in filters.items() if v is not None}
        resp = self._client.get("/api/sim/tasks", params=params)
        _check_response(resp)
        return TaskListResponse(**resp.json())

    def get_task(self, task_id: str) -> dict[str, Any]:
        resp = self._client.get(f"/api/sim/tasks/{task_id}")
        _check_response(resp)
        return resp.json()

    def get_curriculum(self) -> CurriculumResponse:
        resp = self._client.get("/api/sim/tasks/curriculum")
        _check_response(resp)
        return CurriculumResponse(**resp.json())

    # -- Episode logging --

    def log_action(
        self,
        action: str,
        payload: Optional[dict[str, Any]] = None,
        reward: float = 0.0,
        success: bool = True,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {"action": action, "reward": reward, "success": success}
        if payload is not None:
            body["payload"] = payload
        resp = self._client.post("/api/sim/episode/log", json=body)
        _check_response(resp)
        return resp.json()

    # -- Action space --

    def get_action_space(self) -> dict[str, Any]:
        resp = self._client.get("/api/rl/action-space")
        _check_response(resp)
        return resp.json()

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "SimBenchClient":
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()
