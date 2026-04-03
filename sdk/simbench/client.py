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
        resp.raise_for_status()
        return EpisodeStartResponse(**resp.json())

    def finish_episode(self, agent_response: Optional[str] = None) -> EpisodeFinishResponse:
        body = {}
        if agent_response is not None:
            body["agent_response"] = agent_response
        resp = self._client.post("/api/sim/finish", json=body if body else None, content=None if not body else None)
        resp.raise_for_status()
        return EpisodeFinishResponse(**resp.json())

    def evaluate(self) -> EvalResult:
        resp = self._client.post("/api/sim/evaluate")
        resp.raise_for_status()
        return EvalResult(**resp.json())

    # -- RL step --

    def step(self, action: dict[str, Any]) -> StepResponse:
        resp = self._client.post("/api/rl", json=action)
        resp.raise_for_status()
        return StepResponse(**resp.json())

    def observe(self) -> dict[str, Any]:
        resp = self._client.get("/api/rl")
        resp.raise_for_status()
        return resp.json()

    def reset_env(self) -> dict[str, Any]:
        resp = self._client.post("/api/rl/reset")
        resp.raise_for_status()
        return resp.json()

    # -- State --

    def get_state(self, diff: bool = False) -> dict[str, Any]:
        params = {"diff": "true"} if diff else {}
        resp = self._client.get("/api/sim/state", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_snapshot(self) -> dict[str, Any]:
        resp = self._client.get("/api/sim/snapshot")
        resp.raise_for_status()
        return resp.json()

    def get_episode(self) -> dict[str, Any]:
        resp = self._client.get("/api/sim/episode")
        resp.raise_for_status()
        return resp.json()

    # -- Tasks --

    def list_tasks(self, **filters: Any) -> TaskListResponse:
        params = {k: str(v) for k, v in filters.items() if v is not None}
        resp = self._client.get("/api/sim/tasks", params=params)
        resp.raise_for_status()
        return TaskListResponse(**resp.json())

    def get_task(self, task_id: str) -> dict[str, Any]:
        resp = self._client.get(f"/api/sim/tasks/{task_id}")
        resp.raise_for_status()
        return resp.json()

    def get_curriculum(self) -> CurriculumResponse:
        resp = self._client.get("/api/sim/tasks/curriculum")
        resp.raise_for_status()
        return CurriculumResponse(**resp.json())

    # -- Action space --

    def get_action_space(self) -> dict[str, Any]:
        resp = self._client.get("/api/rl/action-space")
        resp.raise_for_status()
        return resp.json()

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "SimBenchClient":
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()
