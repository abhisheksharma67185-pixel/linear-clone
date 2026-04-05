"""Pydantic models matching the server-side types."""

from __future__ import annotations
from typing import Any, Optional, Tuple
from pydantic import BaseModel


class TaskSummary(BaseModel):
    id: str
    site: str
    domain: str
    type: str
    difficulty: str
    curriculum_stage: int
    title: str
    goal: str
    max_steps: int
    tags: list[str]


class TaskListResponse(BaseModel):
    total: int
    filtered: int
    tasks: list[TaskSummary]


class EpisodeStartResponse(BaseModel):
    episode_id: str
    task: dict[str, Any]
    status: str
    initial_snapshot: dict[str, Any]


class EvalResult(BaseModel):
    score: float
    checks: list[dict[str, Any]]
    passed: int
    total: int


class JudgeResult(BaseModel):
    passed: bool
    reasoning: str
    matchType: str


class EpisodeFinishResponse(BaseModel):
    episode_id: str
    task_id: str
    status: str
    steps: int
    score: float
    total_reward: float
    wall_time_seconds: float
    eval: Optional[EvalResult] = None
    judge_result: Optional[JudgeResult] = None
    diff: Optional[dict[str, Any]] = None
    action_log: list[dict[str, Any]] = []


class StepResponse(BaseModel):
    observation: dict[str, Any]
    reward: float
    done: bool
    truncated: bool = False
    info: dict[str, Any] = {}


class CurriculumStage(BaseModel):
    stage: int
    title: str
    description: str
    domains: list[str]
    difficultyRange: Tuple[str, str]
    taskIds: list[str]


class CurriculumResponse(BaseModel):
    total_stages: int
    stages: list[CurriculumStage]
