"""Curriculum runner for progressive agent training."""

from __future__ import annotations
from typing import Any, Callable, Optional, Literal

from simbench.client import SimBenchClient
from simbench.env import SimBenchEnv


class CurriculumRunner:
    """Run tasks in curriculum order, advancing when mastery is achieved.

    Usage:
        runner = CurriculumRunner("http://localhost:3000")
        for stage_result in runner.run(agent_step_fn):
            print(f"Stage {stage_result['stage']}: {stage_result['avg_score']:.1%}")
    """

    def __init__(
        self,
        base_url: str = "http://localhost:3000",
        mode: Literal["rest", "browser"] = "rest",
        mastery_threshold: float = 0.8,
        min_successes: int = 3,
        max_attempts_per_task: int = 10,
    ):
        self.base_url = base_url
        self.mode = mode
        self.mastery_threshold = mastery_threshold
        self.min_successes = min_successes
        self.max_attempts_per_task = max_attempts_per_task
        self._client = SimBenchClient(base_url)

    def get_curriculum(self) -> list[dict[str, Any]]:
        """Fetch curriculum stages from server."""
        resp = self._client.get_curriculum()
        return [s.model_dump() for s in resp.stages]

    def run_task(
        self,
        task_id: str,
        agent_step_fn: Callable[[dict[str, Any], dict[str, Any]], dict[str, Any]],
        agent_response_fn: Optional[Callable[[dict[str, Any]], Optional[str]]] = None,
    ) -> dict[str, Any]:
        """Run a single task. Returns the finish result."""
        env = SimBenchEnv(
            base_url=self.base_url,
            task_id=task_id,
            mode=self.mode,
        )
        obs, info = env.reset()
        total_reward = 0.0

        done = False
        while not done:
            action = agent_step_fn(obs, info)
            obs, reward, terminated, truncated, info = env.step(action)
            total_reward += reward
            done = terminated or truncated

        # Get agent response for retrieval/impossible tasks
        agent_response = None
        if agent_response_fn:
            agent_response = agent_response_fn(obs)

        result = env.finish(agent_response)
        env.close()

        result["cumulative_reward"] = total_reward
        return result

    def run_stage(
        self,
        stage: int,
        agent_step_fn: Callable[[dict[str, Any], dict[str, Any]], dict[str, Any]],
        agent_response_fn: Optional[Callable[[dict[str, Any]], Optional[str]]] = None,
    ) -> dict[str, Any]:
        """Run all tasks in a curriculum stage. Returns aggregate stats."""
        curriculum = self.get_curriculum()
        if stage < 1 or stage > len(curriculum):
            raise ValueError(f"Stage {stage} not found (1-{len(curriculum)})")

        stage_data = curriculum[stage - 1]
        task_ids = stage_data["taskIds"]
        results = []

        for task_id in task_ids:
            result = self.run_task(task_id, agent_step_fn, agent_response_fn)
            results.append(result)

        scores = [r["score"] for r in results]
        avg_score = sum(scores) / len(scores) if scores else 0.0

        return {
            "stage": stage,
            "title": stage_data["title"],
            "tasks_attempted": len(results),
            "tasks_passed": sum(1 for s in scores if s >= 1.0),
            "avg_score": avg_score,
            "mastery_achieved": avg_score >= self.mastery_threshold,
            "results": results,
        }

    def run(
        self,
        agent_step_fn: Callable[[dict[str, Any], dict[str, Any]], dict[str, Any]],
        agent_response_fn: Optional[Callable[[dict[str, Any]], Optional[str]]] = None,
        start_stage: int = 1,
    ):
        """Generator that yields stage results, advancing on mastery.

        Stops when mastery is not achieved or all stages complete.
        """
        curriculum = self.get_curriculum()
        current_stage = start_stage

        while current_stage <= len(curriculum):
            result = self.run_stage(current_stage, agent_step_fn, agent_response_fn)
            yield result

            if not result["mastery_achieved"]:
                break
            current_stage += 1

    def close(self) -> None:
        self._client.close()
