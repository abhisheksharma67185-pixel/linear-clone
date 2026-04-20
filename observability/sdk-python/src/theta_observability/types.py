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


class ObservedEvent(_Base):
    event_id: Optional[str] = None
    parent_event_id: Optional[str] = None
    step_id: Optional[str] = None
    parent_step_id: Optional[str] = None
    index: Optional[int] = None
    type: str
    name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    latency_ms: Optional[int] = None
    model: Optional[str] = None
    message: Optional["Message"] = None
    tool_call: Optional[ToolCall] = None
    attachment: Optional[Attachment] = None
    sensor_frame: Optional[SensorFrame] = None
    value: Optional[Any] = None
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
    events: list[ObservedEvent] = Field(default_factory=list)
    attachments: list[Attachment] = Field(default_factory=list)
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
    events: list[ObservedEvent] = Field(default_factory=list)
    attachments: list[Attachment] = Field(default_factory=list)
    annotations: list[Annotation] = Field(default_factory=list)


class CorrelationInfo(_Base):
    session_id: Optional[str] = None
    request_id: Optional[str] = None
    parent_trace_id: Optional[str] = None
    root_trace_id: Optional[str] = None
    external_ids: dict[str, Any] = Field(default_factory=dict)


class CanonicalEvent(_Base):
    event_id: Optional[str] = None
    parent_event_id: Optional[str] = None
    step_id: Optional[str] = None
    parent_step_id: Optional[str] = None
    step_type: Optional[str] = None
    index: Optional[int] = None
    type: str
    name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    model: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    latency_ms: Optional[int] = None
    message: Optional[Message] = None
    tool_call: Optional[ToolCall] = None
    attachment: Optional[Attachment] = None
    sensor_frame: Optional[SensorFrame] = None
    value: Optional[Any] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class CanonicalEnvelope(_Base):
    schema_version: str = "1.0"
    trace_id: Optional[str] = None
    project_id: Optional[str] = None
    name: Optional[str] = None
    source: Optional[str] = None
    kind: Optional[str] = None
    run_id: Optional[str] = None
    run_type: Optional[str] = None
    use_case: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    group: Optional[str] = None
    platform: Optional[str] = None
    model: Optional[str] = None
    status: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    latency_ms: Optional[int] = None
    cost_usd: Optional[float] = None
    correlation: Optional[CorrelationInfo] = None
    events: list[CanonicalEvent] = Field(default_factory=list)
    attachments: list[Attachment] = Field(default_factory=list)


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


class TraceDetailResponse(_Base):
    meta: TraceSummary
    trace: Optional[Trace] = None


class BulkImportItemResult(_Base):
    index: int
    kind: str
    trace_id: Optional[str] = None
    status: str
    error: Optional[str] = None


class BulkImportResponse(_Base):
    accepted: int = 0
    failed: int = 0
    items: list[BulkImportItemResult] = Field(default_factory=list)


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
    "ObservedEvent",
    "Annotation",
    "Step",
    "Trace",
    "CorrelationInfo",
    "CanonicalEvent",
    "CanonicalEnvelope",
    "TraceMetadataFilter",
    "TraceSummary",
    "TraceListResponse",
    "TraceDetailResponse",
    "BulkImportItemResult",
    "BulkImportResponse",
    "SignedUrlRequest",
    "SignedUrlResponse",
]
