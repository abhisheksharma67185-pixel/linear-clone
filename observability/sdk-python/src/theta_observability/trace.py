"""Trace + Step context managers."""

from __future__ import annotations

import contextvars
import logging
import threading
import time
import traceback
from contextlib import AbstractContextManager
from datetime import datetime, timezone
from types import TracebackType
from typing import TYPE_CHECKING, Any, Iterable, Optional, Type

from .ids import generate_id
from .media import MediaInput, upload_media
from .types import (
    Annotation,
    Attachment,
    Message,
    SensorFrame,
    Step as StepModel,
    Status,
    StepType,
    TokenUsage,
    ToolCall,
    Trace as TraceModel,
)

if TYPE_CHECKING:  # pragma: no cover
    from .client import TraceClient

logger = logging.getLogger("theta_observability")


# A contextvar stack of "currently open" steps — used to set parent_step_id and
# to support nested step context managers across sync + async code.
_step_stack: contextvars.ContextVar[tuple["Step", ...]] = contextvars.ContextVar(
    "theta_step_stack", default=()
)
_active_trace: contextvars.ContextVar[Optional["Trace"]] = contextvars.ContextVar(
    "theta_active_trace", default=None
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _ms_between(a: datetime, b: datetime) -> int:
    return int((b - a).total_seconds() * 1000)


def _set_metadata_path(target: dict[str, Any], path: str, value: Any) -> None:
    parts = [part.strip() for part in path.split(".") if part.strip()]
    if not parts:
        return

    current: dict[str, Any] = target
    for part in parts[:-1]:
        existing = current.get(part)
        if not isinstance(existing, dict):
            existing = {}
            current[part] = existing
        current = existing
    current[parts[-1]] = value


class Step(AbstractContextManager["Step"]):
    """A single logical span inside a Trace."""

    def __init__(
        self,
        trace: "Trace",
        name: Optional[str],
        type: StepType,
        model: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
    ):
        self._trace = trace
        self._lock = threading.Lock()
        self.model = StepModel(
            step_id=generate_id("st"),
            index=trace._next_step_index(),
            type=type,
            name=name,
            model=model,
            metadata=dict(metadata or {}),
        )
        self._token: Optional[contextvars.Token] = None

    # -- context mgmt --

    def __enter__(self) -> "Step":
        self.model.started_at = _now()
        stack = _step_stack.get()
        if stack:
            self.model.parent_step_id = stack[-1].model.step_id
        self._token = _step_stack.set(stack + (self,))
        return self

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc: Optional[BaseException],
        tb: Optional[TracebackType],
    ) -> None:
        self.model.ended_at = _now()
        if self.model.started_at:
            self.model.latency_ms = _ms_between(self.model.started_at, self.model.ended_at)
        if exc is not None and self.model.status == "running":
            self.model.status = "error"
            self.model.error_message = f"{exc_type.__name__ if exc_type else 'Error'}: {exc}"
        elif self.model.status == "running":
            self.model.status = "success"
        if self._token is not None:
            try:
                _step_stack.reset(self._token)
            except ValueError:
                pass
        self._trace._finalize_step(self)
        return None  # do not suppress

    # -- logging API --

    def log_message(
        self,
        role: str,
        text: Optional[str] = None,
        images: Optional[Iterable[MediaInput]] = None,
        audio: Optional[Iterable[MediaInput]] = None,
        video: Optional[Iterable[MediaInput]] = None,
        tool_calls: Optional[Iterable[dict[str, Any] | ToolCall]] = None,
    ) -> None:
        """Append a chat-style message to this step."""
        content: list[Attachment] = []
        if text is not None:
            content.append(Attachment(type="text", text=text))
        for img in images or []:
            content.append(self._trace._attach_as_attachment(img, kind="image"))
        for aud in audio or []:
            content.append(self._trace._attach_as_attachment(aud, kind="audio"))
        for vid in video or []:
            content.append(self._trace._attach_as_attachment(vid, kind="video"))

        tc_models: list[ToolCall] = []
        for tc in tool_calls or []:
            tc_models.append(tc if isinstance(tc, ToolCall) else ToolCall(**tc))

        with self._lock:
            self.model.messages.append(
                Message(role=role, content=content, tool_calls=tc_models)  # type: ignore[arg-type]
            )

    def log_tool_call(
        self,
        name: str,
        arguments: dict[str, Any],
        result: Any = None,
        latency_ms: Optional[int] = None,
        error: Optional[str] = None,
    ) -> ToolCall:
        tc = ToolCall(
            id=generate_id("tc"),
            name=name,
            arguments=arguments,
            result=result,
            latency_ms=latency_ms,
            error=error,
        )
        with self._lock:
            self.model.tool_calls.append(tc)
        return tc

    def log_sensor_frame(
        self,
        modality: str,
        source: MediaInput,
        mime: Optional[str] = None,
        fps: Optional[float] = None,
        duration_ms: Optional[int] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> SensorFrame:
        gs_uri, resolved_mime, _ = upload_media(
            self._trace._client, source, mime=mime, trace_id=self._trace.model.trace_id
        )
        frame = SensorFrame(
            modality=modality,
            uri=gs_uri,
            mime=resolved_mime,
            fps=fps,
            duration_ms=duration_ms,
            metadata=dict(metadata or {}),
        )
        with self._lock:
            self.model.sensor_frames.append(frame)
        return frame

    def set_token_usage(self, input: int, output: int, total: Optional[int] = None) -> None:
        self.model.token_usage = TokenUsage(
            input=input, output=output, total=total if total is not None else input + output
        )

    def set_status(self, status: Status) -> None:
        self.model.status = status

    def set_metadata(self, **kwargs: Any) -> None:
        self.model.metadata.update(kwargs)

    def set_metadata_path(self, path: str, value: Any) -> None:
        _set_metadata_path(self.model.metadata, path, value)

    def set_model(self, model: str) -> None:
        self.model.model = model

    def annotate(
        self,
        label: Optional[str] = None,
        score: Optional[float] = None,
        comment: Optional[str] = None,
        user: Optional[str] = None,
    ) -> None:
        self.model.annotations.append(
            Annotation(label=label, score=score, comment=comment, user=user, created_at=_now())
        )


class Trace(AbstractContextManager["Trace"]):
    """Top-level trace span. Holds steps + trace-level attachments."""

    def __init__(
        self,
        client: "TraceClient",
        name: str,
        *,
        run_id: Optional[str] = None,
        run_type: Optional[str] = None,
        use_case: Optional[str] = None,
        user_id: Optional[str] = None,
        group: Optional[str] = None,
        platform: Optional[str] = None,
        model: Optional[str] = None,
        tags: Optional[list[str]] = None,
        metadata: Optional[dict[str, Any]] = None,
    ):
        self._client = client
        self._lock = threading.Lock()
        self._step_counter = 0
        self._trace_attachments: list[Attachment] = []
        self._token: Optional[contextvars.Token] = None
        self._started_wall = 0.0

        self.model = TraceModel(
            trace_id=generate_id("tr"),
            project_id=client.project,
            name=name,
            run_id=run_id,
            run_type=run_type,
            use_case=use_case,
            user_id=user_id,
            group=group,
            platform=platform,
            model=model,
            tags=list(tags or []),
            metadata=dict(metadata or {}),
        )

    # -- lifecycle --

    def __enter__(self) -> "Trace":
        self.model.started_at = _now()
        self._started_wall = time.monotonic()
        self._token = _active_trace.set(self)
        self._client._register_trace_start(self)
        return self

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc: Optional[BaseException],
        tb: Optional[TracebackType],
    ) -> None:
        self.model.ended_at = _now()
        self.model.latency_ms = int((time.monotonic() - self._started_wall) * 1000)
        if exc is not None and self.model.status == "running":
            self.model.status = "error"
            self.model.error_message = f"{exc_type.__name__ if exc_type else 'Error'}: {exc}"
        elif self.model.status == "running":
            self.model.status = "success"

        # Aggregate token usage from steps if caller didn't set it.
        if self.model.token_usage is None:
            agg_in = sum((s.token_usage.input for s in self.model.steps if s.token_usage), 0)
            agg_out = sum((s.token_usage.output for s in self.model.steps if s.token_usage), 0)
            if agg_in or agg_out:
                self.model.token_usage = TokenUsage(input=agg_in, output=agg_out, total=agg_in + agg_out)

        if self._token is not None:
            try:
                _active_trace.reset(self._token)
            except ValueError:
                pass

        try:
            self._client._commit_trace(self)
        except Exception:
            logger.warning("theta-observability: commit failed:\n%s", traceback.format_exc())

    # -- step factory --

    def step(
        self,
        name: Optional[str] = None,
        type: StepType = "custom",
        model: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> Step:
        return Step(trace=self, name=name, type=type, model=model, metadata=metadata)

    # -- attachments --

    def attach_image(self, source: MediaInput, mime: Optional[str] = None) -> str:
        return self._attach_as_attachment(source, kind="image", mime=mime).uri or ""

    def attach_audio(self, source: MediaInput, mime: Optional[str] = None) -> str:
        return self._attach_as_attachment(source, kind="audio", mime=mime).uri or ""

    def attach_video(self, source: MediaInput, mime: Optional[str] = None) -> str:
        return self._attach_as_attachment(source, kind="video", mime=mime).uri or ""

    def attach_file(self, source: MediaInput, mime: Optional[str] = None) -> str:
        return self._attach_as_attachment(source, kind="file", mime=mime).uri or ""

    def attach_sensor(
        self, source: MediaInput, modality: str, mime: Optional[str] = None
    ) -> str:
        att = self._attach_as_attachment(source, kind="sensor", mime=mime)
        att.modality = modality
        return att.uri or ""

    # -- annotations / metadata --

    def annotate(
        self,
        label: Optional[str] = None,
        score: Optional[float] = None,
        comment: Optional[str] = None,
        user: Optional[str] = None,
    ) -> None:
        self.model.annotations.append(
            Annotation(label=label, score=score, comment=comment, user=user, created_at=_now())
        )

    def set_metadata(self, **kwargs: Any) -> None:
        self.model.metadata.update(kwargs)

    def set_metadata_path(self, path: str, value: Any) -> None:
        _set_metadata_path(self.model.metadata, path, value)

    def set_tags(self, *tags: str) -> None:
        for tag in tags:
            if tag not in self.model.tags:
                self.model.tags.append(tag)

    def set_cost(self, cost_usd: float) -> None:
        self.model.cost_usd = cost_usd

    def set_user(self, user_id: str) -> None:
        self.model.user_id = user_id

    # -- internals --

    def _next_step_index(self) -> int:
        with self._lock:
            idx = self._step_counter
            self._step_counter += 1
            return idx

    def _finalize_step(self, step: Step) -> None:
        with self._lock:
            self.model.steps.append(step.model)
        self._client._stream_step(self, step.model)

    def _attach_as_attachment(
        self,
        source: MediaInput,
        kind: str,
        mime: Optional[str] = None,
    ) -> Attachment:
        try:
            gs_uri, resolved_mime, size = upload_media(
                self._client, source, mime=mime, trace_id=self.model.trace_id
            )
        except Exception as exc:
            logger.warning("theta-observability: media upload failed (%s), continuing without uri", exc)
            gs_uri, resolved_mime, size = "", mime or "application/octet-stream", 0

        attachment_type = kind if kind in {"text", "image", "audio", "video", "sensor", "file"} else "file"
        att = Attachment(
            type=attachment_type,  # type: ignore[arg-type]
            uri=gs_uri or None,
            mime=resolved_mime,
            size_bytes=size or None,
        )
        return att


__all__ = ["Trace", "Step"]
