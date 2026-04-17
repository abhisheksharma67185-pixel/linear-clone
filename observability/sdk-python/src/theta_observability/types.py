"""Pydantic v2 models for the Theta Observability trace schema.

Mirrors ``observability/schema/trace.schema.json``. All server-bound payloads
flow through these models so we get validation + a stable JSON contract.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field

StepType = Literal["llm", "tool", "retrieval", "robotics", "human", "annotation", "custom"]
AttachmentType = Literal["text", "image", "audio", "video", "sensor", "file"]
Status = Literal["success", "error", "running"]
Role = Literal["system", "user", "assistant", "tool"]


class _Base(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True)


class TokenUsage(_Base):
    input: int = 0
    output: int = 0
    total: Optional[int] = None


class Attachment(_Base):
    type: AttachmentType
    uri: Optional[str] = None
    text: Optional[str] = None
    mime: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    duration_ms: Optional[int] = None
    fps: Optional[float] = None
    modality: Optional[str] = None  # for sensor frames: joint_state, camera, ...
    size_bytes: Optional[int] = None


class ToolCall(_Base):
    id: str
    name: str
    arguments: dict[str, Any] = Field(default_factory=dict)
    result: Optional[Any] = None
    latency_ms: Optional[int] = None
    error: Optional[str] = None


class Message(_Base):
    role: Role
    # OpenAI-style "content" is a list of typed parts (text/image/...).
    content: list[Attachment] = Field(default_factory=list)
    tool_calls: list[ToolCall] = Field(default_factory=list)
    name: Optional[str] = None


class SensorFrame(_Base):
    modality: str
    uri: str
    mime: Optional[str] = None
    fps: Optional[float] = None
    duration_ms: Optional[int] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class Annotation(_Base):
    label: Optional[str] = None
    score: Optional[float] = None
    comment: Optional[str] = None
    user: Optional[str] = None
    created_at: Optional[datetime] = None


class Step(_Base):
    step_id: str
    parent_step_id: Optional[str] = None
    index: int = 0
    type: StepType
    name: Optional[str] = None
    model: Optional[str] = None
    status: Status = "running"
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    latency_ms: Optional[int] = None
    messages: list[Message] = Field(default_factory=list)
    tool_calls: list[ToolCall] = Field(default_factory=list)
    sensor_frames: list[SensorFrame] = Field(default_factory=list)
    token_usage: Optional[TokenUsage] = None
    error_message: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    annotations: list[Annotation] = Field(default_factory=list)


class Trace(_Base):
    schema_version: str = "1.0"
    trace_id: str
    project_id: str
    name: str
    run_id: Optional[str] = None
    run_type: Optional[str] = None
    use_case: Optional[str] = None
    user_id: Optional[str] = None
    group: Optional[str] = None
    platform: Optional[str] = None
    model: Optional[str] = None
    status: Status = "running"
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    latency_ms: Optional[int] = None
    token_usage: Optional[TokenUsage] = None
    cost_usd: Optional[float] = None
    error_message: Optional[str] = None
    steps: list[Step] = Field(default_factory=list)
    annotations: list[Annotation] = Field(default_factory=list)


class TraceMetadataFilter(_Base):
    key: str
    value: str


class TraceSummary(_Base):
    trace_id: str
    project_id: str
    name: str
    run_id: Optional[str] = None
    run_type: Optional[str] = None
    use_case: Optional[str] = None
    group: Optional[str] = None
    status: Status
    platform: Optional[str] = None
    model: Optional[str] = None
    user_id: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
    started_at: datetime
    latency_ms: Optional[int] = None
    total_tokens: Optional[int] = None
    cost_usd: Optional[float] = None
    step_count: Optional[int] = None
    has_media: Optional[bool] = None


class TraceListResponse(_Base):
    data: list[TraceSummary] = Field(default_factory=list)
    next_cursor: Optional[str] = None


# --- Wire types for API responses ---------------------------------------------


class SignedUrlRequest(_Base):
    content_type: str
    size: Optional[int] = None
    filename: Optional[str] = None


class SignedUrlResponse(_Base):
    url: str
    gs_uri: str
    expires_at: Optional[datetime] = None
    headers: dict[str, str] = Field(default_factory=dict)


__all__ = [
    "StepType",
    "AttachmentType",
    "Status",
    "Role",
    "TokenUsage",
    "Attachment",
    "ToolCall",
    "Message",
    "SensorFrame",
    "Annotation",
    "Step",
    "Trace",
    "TraceMetadataFilter",
    "TraceSummary",
    "TraceListResponse",
    "SignedUrlRequest",
    "SignedUrlResponse",
]
