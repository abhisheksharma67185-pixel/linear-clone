"""Batch evaluation runner with standardized results output."""

from __future__ import annotations
from typing import Any, Callable, Optional
from datetime import datetime, timezone
import time
from simbench.client import SimBenchClient
from simbench.env import SimBenchEnv


def _get_version() -> str:
    """Lazy import to avoid circular dependency with __init__.py."""
    from simbench import __version__
    return __version__


class BatchRunner:
    """Run all (or filtered) tasks and produce standardized results JSON.

    Usage:
        runner = BatchRunner("http://localhost:3000", agent_step, agent_response)
        results = runner.run_all(domain="products")
        with open("results.json", "w") as f:
            json.dump(results, f, indent=2)
    """

    def __init__(
        self,
        base_url: str = "http://localhost:3000",
        agent_step_fn: Optional[Callable[[dict, dict], dict]] = None,
        agent_response_fn: Optional[Callable[[dict, dict], Optional[str]]] = None,
        agent_name: str = "unknown",
        model_name: str = "unknown",
        mode: str = "rest",
        site: str = "shopify-admin",
        verbose: bool = True,
    ):
        self.base_url = base_url
        self.agent_step_fn = agent_step_fn or self._noop_agent
        self.agent_response_fn = agent_response_fn
        self.agent_name = agent_name
        self.model_name = model_name
        self.mode = mode
        self._site = site
        self.verbose = verbose
        self._client = SimBenchClient(base_url)

    @staticmethod
    def _noop_agent(_obs: dict, _info: dict) -> dict:
        return {"action": "navigate", "url": "/admin"}

    def run_all(
        self,
        domain: Optional[str] = None,
        difficulty: Optional[str] = None,
        task_type: Optional[str] = None,
    ) -> dict[str, Any]:
        """Run filtered tasks and return standardized results."""
        filters: dict[str, Any] = {}
        if domain:
            filters["domain"] = domain
        if difficulty:
            filters["difficulty"] = difficulty
        if task_type:
            filters["type"] = task_type

        task_list = self._client.list_tasks(**filters)
        tasks = task_list.tasks

        if self.verbose:
            print(f"\nRunning {len(tasks)} tasks...\n")

        task_results = []
        for i, task in enumerate(tasks):
            result = self._run_single(task.id, task.domain, task.type, task.difficulty, task.curriculum_stage)
            task_results.append(result)
            if self.verbose:
                status = "PASS" if result["score"] >= 1.0 else "FAIL"
                score_str = f"{result['score']:.0%}"
                print(f"  [{i+1}/{len(tasks)}] {task.id:<20} {score_str:>5}  {status}  ({result['time_seconds']:.1f}s)")

        return self._build_results(task_results, task_list.total)

    def _run_single(
        self, task_id: str, domain: str, task_type: str, difficulty: str, stage: int,
    ) -> dict[str, Any]:
        """Run a single task with error recovery."""
        start = time.time()
        try:
            self._client.reset_env()
            env = SimBenchEnv(base_url=self.base_url, task_id=task_id, mode=self.mode)
            try:
                obs, info = env.reset()

                done = False
                steps = 0
                while not done:
                    action = self.agent_step_fn(obs, info)
                    obs, reward, terminated, truncated, info = env.step(action)
                    steps += 1
                    done = terminated or truncated

                agent_response = None
                if self.agent_response_fn:
                    agent_response = self.agent_response_fn(obs, info)

                result = env.finish(agent_response)
            finally:
                env.close()

            return {
                "id": task_id,
                "domain": domain,
                "type": task_type,
                "difficulty": difficulty,
                "curriculum_stage": stage,
                "score": result.get("score", 0),
                "status": result.get("status", "unknown"),
                "steps": steps,
                "time_seconds": round(time.time() - start, 3),
            }
        except Exception as e:
            return {
                "id": task_id,
                "domain": domain,
                "type": task_type,
                "difficulty": difficulty,
                "curriculum_stage": stage,
                "score": 0.0,
                "status": "error",
                "steps": 0,
                "time_seconds": round(time.time() - start, 3),
                "error": str(e),
            }

    def _build_results(self, task_results: list[dict], total_available: int) -> dict[str, Any]:
        """Build standardized results JSON."""
        scores = [r["score"] for r in task_results]
        passed = sum(1 for s in scores if s >= 1.0)
        avg_score = sum(scores) / len(scores) if scores else 0.0
        avg_steps = sum(r["steps"] for r in task_results) / len(task_results) if task_results else 0
        avg_time = sum(r["time_seconds"] for r in task_results) / len(task_results) if task_results else 0

        # Domain breakdown
        domains: dict[str, dict] = {}
        for r in task_results:
            d = r["domain"]
            if d not in domains:
                domains[d] = {"tasks": 0, "passed": 0, "total_score": 0.0}
            domains[d]["tasks"] += 1
            domains[d]["total_score"] += r["score"]
            if r["score"] >= 1.0:
                domains[d]["passed"] += 1
        domain_summary = {
            d: {"tasks": v["tasks"], "passed": v["passed"], "score": round(v["total_score"] / v["tasks"], 3)}
            for d, v in domains.items()
        }

        # Curriculum breakdown
        stages: dict[int, dict] = {}
        for r in task_results:
            s = r["curriculum_stage"]
            if s not in stages:
                stages[s] = {"tasks": 0, "total_score": 0.0}
            stages[s]["tasks"] += 1
            stages[s]["total_score"] += r["score"]
        curriculum = [
            {"stage": s, "tasks": v["tasks"], "score": round(v["total_score"] / v["tasks"], 3)}
            for s, v in sorted(stages.items())
        ]

        return {
            "meta": {
                "agent": self.agent_name,
                "model": self.model_name,
                "mode": self.mode,
                "site": self._site,
                "simbench_version": _get_version(),
                "server_url": self.base_url,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            "summary": {
                "total_available": total_available,
                "total_evaluated": len(task_results),
                "passed": passed,
                "score": round(avg_score, 3),
                "avg_steps": round(avg_steps, 1),
                "avg_time_seconds": round(avg_time, 3),
            },
            "domains": domain_summary,
            "curriculum": curriculum,
            "tasks": task_results,
        }

    def close(self) -> None:
        self._client.close()
