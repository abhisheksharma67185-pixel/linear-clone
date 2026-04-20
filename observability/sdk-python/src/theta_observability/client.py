"""TraceClient — top-level SDK entrypoint."""

from __future__ import annotations

import atexit
import functools
import inspect
import json
import logging
import os
import threading
from typing import Any, Awaitable, Callable, Optional, TypeVar, Union, cast, overload

import httpx

from ._version import __version__
from .batch import BatchSender
from .errors import ThetaAPIError, ThetaAuthError, ThetaConfigError
from .agent import AgentResult, wrap_agent as _wrap_agent
from .metrics import create_metric as _create_metric, record_metric as _record_metric
from .trace import Trace, _active_trace
from .types import (
    BulkImportResponse,
    CanonicalEnvelope,
    SignedUrlResponse,
    StepType,
    Step as StepModel,
    TraceDetailResponse,
    TraceListResponse,
)

logger = logging.getLogger("theta_observability")

DEFAULT_BASE_URL = "https://api.theta-observability.com"

F = TypeVar("F", bound=Callable[..., Any])


class TraceClient:
    """Primary SDK client. Creates traces, uploads media, flushes batches.

    Environment fallbacks:

    - ``api_key`` → ``THETA_API_KEY``
    - ``project`` → ``THETA_PROJECT``
    - ``base_url`` → ``THETA_BASE_URL``
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        project: Optional[str] = None,
        base_url: Optional[str] = None,
        flush_interval: float = 0.5,
        max_batch: int = 100,
        timeout: float = 10.0,
        debug: bool = False,
    ):
        resolved_key = api_key or os.environ.get("THETA_API_KEY")
        resolved_project = project or os.environ.get("THETA_PROJECT")
        if not resolved_key:
            raise ThetaConfigError(
                "Missing API key. Pass api_key=... or set THETA_API_KEY."
            )
        if not resolved_project:
            raise ThetaConfigError(
                "Missing project. Pass project=... or set THETA_PROJECT."
            )

        self.api_key = resolved_key
        self.project = resolved_project
        self.base_url = (base_url or os.environ.get("THETA_BASE_URL") or DEFAULT_BASE_URL).rstrip("/")
        self.timeout = timeout
        self.debug = debug

        self._http = httpx.Client(
            base_url=self.base_url,
            timeout=timeout,
            headers={
                "x-api-key": self.api_key,
                "user-agent": f"theta-observability-python/{__version__}",
                "x-theta-project": self.project,
            },
        )
        self._batch = BatchSender(
            http=self._http,
            flush_interval=flush_interval,
            max_batch=max_batch,
            debug=debug,
        )
        self._closed = False
        self._closed_lock = threading.Lock()
        atexit.register(self._atexit)

    # -- public trace API --

    def trace(
        self,
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
    ) -> Trace:
        """Create a new :class:`Trace`. Use as a context manager."""
        return Trace(
            client=self,
            name=name,
            run_id=run_id,
            run_type=run_type,
            use_case=use_case,
            user_id=user_id,
            group=group,
            platform=platform,
            model=model,
            tags=tags,
            metadata=metadata,
        )

    def current_trace(self) -> Optional[Trace]:
        """Return the innermost active trace, if any."""
        return _active_trace.get()

    # -- observability decorator --

    def observe(
        self,
        name: Optional[str] = None,
        type: StepType = "custom",
        model: Optional[str] = None,
    ) -> Callable[[F], F]:
        """Decorator that wraps a function in a step.

        If no trace is currently active, a trace is created for the call.
        Works on both sync and async functions.
        """
        client = self

        def decorator(func: F) -> F:
            step_name = name or func.__name__

            if inspect.iscoroutinefunction(func):

                @functools.wraps(func)
                async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                    trace = client.current_trace()
                    if trace is None:
                        with client.trace(name=step_name) as t:
                            with t.step(name=step_name, type=type, model=model):
                                return await func(*args, **kwargs)
                    else:
                        with trace.step(name=step_name, type=type, model=model):
                            return await func(*args, **kwargs)

                return cast(F, async_wrapper)

            @functools.wraps(func)
            def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
                trace = client.current_trace()
                if trace is None:
                    with client.trace(name=step_name) as t:
                        with t.step(name=step_name, type=type, model=model):
                            return func(*args, **kwargs)
                else:
                    with trace.step(name=step_name, type=type, model=model):
                        return func(*args, **kwargs)

            return cast(F, sync_wrapper)

        return decorator

    # -- agent wrapping --

    def wrap_agent(
        self,
        name: str,
        func: Optional[Callable[..., Any]] = None,
    ) -> Any:
        """Wrap an agent function so every call produces a trace.

        Can be used as a decorator::

            @client.wrap_agent("support-agent")
            def my_agent(ctx, user_input):
                ...

        Or called directly with a function::

            agent = client.wrap_agent("support-agent", my_fn)
        """
        return _wrap_agent(self, name, func)

    # -- metrics --

    def record_metric(
        self,
        metric_id_or_name: str,
        trace_id: str,
        *,
        passed: Optional[bool] = None,
        score: Optional[float] = None,
        label: Optional[str] = None,
    ) -> None:
        """Record a metric event against a trace. Fails softly with a warning."""
        _record_metric(
            self,
            metric_id_or_name,
            trace_id,
            passed=passed,
            score=score,
            label=label,
        )

    def create_metric(
        self,
        name: str,
        type: str,
        *,
        evaluator_prompt: Optional[str] = None,
        description: Optional[str] = None,
        project_id: Optional[str] = None,
    ) -> None:
        """Create a metric definition (admin). Fails softly with a warning."""
        _create_metric(
            self,
            name,
            type,
            evaluator_prompt=evaluator_prompt,
            description=description,
            project_id=project_id,
        )

    def ingest_events(self, envelope: Union[CanonicalEnvelope, dict[str, Any]]) -> dict[str, Any]:
        """Send a provider-neutral canonical event envelope to Theta."""
        if isinstance(envelope, CanonicalEnvelope):
            payload = envelope.model_dump(mode="json", exclude_none=True)
        else:
            payload = dict(envelope)
        payload.setdefault("schema_version", "1.0")
        payload.setdefault("project_id", self.project)

        resp = self._http.post("/v1/events", json=payload)
        if resp.status_code in (401, 403):
            raise ThetaAuthError(f"Auth rejected by Theta API: {resp.status_code} {resp.text[:200]}")
        if resp.status_code >= 400:
            raise ThetaAPIError(resp.status_code, resp.text, str(resp.url))
        return resp.json()

    def import_traces(
        self,
        items: list[Union[CanonicalEnvelope, dict[str, Any]]],
        *,
        ndjson: bool = False,
    ) -> BulkImportResponse:
        """Bulk import Theta-native traces or canonical envelopes."""
        payloads: list[dict[str, Any]] = []
        for item in items:
            if isinstance(item, CanonicalEnvelope):
                payloads.append(item.model_dump(mode="json", exclude_none=True))
            else:
                payloads.append(dict(item))

        if ndjson:
            content = "\n".join(json.dumps(item, default=str) for item in payloads)
            resp = self._http.post(
                "/v1/imports/traces",
                content=content,
                headers={"Content-Type": "application/x-ndjson"},
            )
        else:
            resp = self._http.post("/v1/imports/traces", json=payloads)

        if resp.status_code in (401, 403):
            raise ThetaAuthError(f"Auth rejected by Theta API: {resp.status_code} {resp.text[:200]}")
        if resp.status_code >= 400 and resp.status_code != 207:
            raise ThetaAPIError(resp.status_code, resp.text, str(resp.url))
        return BulkImportResponse(**resp.json())

    def list_traces(
        self,
        *,
        project_id: Optional[str] = None,
        status: Optional[Union[str, list[str]]] = None,
        platform: Optional[Union[str, list[str]]] = None,
        model: Optional[Union[str, list[str]]] = None,
        user_id: Optional[str] = None,
        run_id: Optional[str] = None,
        run_type: Optional[Union[str, list[str]]] = None,
        use_case: Optional[Union[str, list[str]]] = None,
        group: Optional[str] = None,
        tags: Optional[list[str]] = None,
        metadata_filters: Optional[list[dict[str, Any]]] = None,
        since: Optional[str] = None,
        until: Optional[str] = None,
        limit: int = 100,
        cursor: Optional[str] = None,
    ) -> TraceListResponse:
        params: list[tuple[str, str]] = [("project_id", project_id or self.project), ("limit", str(limit))]

        def add_many(name: str, value: Optional[Union[str, list[str]]]) -> None:
            if value is None:
                return
            values = [value] if isinstance(value, str) else value
            for item in values:
                if item:
                    params.append((name, item))

        add_many("status", status)
        add_many("platform", platform)
        add_many("model", model)
        add_many("run_type", run_type)
        add_many("use_case", use_case)

        for tag in tags or []:
            if tag:
                params.append(("tags", tag))

        for item in metadata_filters or []:
            key = str(item.get("key", "")).strip()
            value = str(item.get("value", "")).strip()
            if not key or not value:
                continue
            params.append(("meta_key", key))
            params.append(("meta_value", value))

        if user_id:
            params.append(("user_id", user_id))
        if run_id:
            params.append(("run_id", run_id))
        if group:
            params.append(("group", group))
        if since:
            params.append(("since", since))
        if until:
            params.append(("until", until))
        if cursor:
            params.append(("cursor", cursor))

        resp = self._http.get("/v1/traces", params=params)
        if resp.status_code in (401, 403):
            raise ThetaAuthError(f"Auth rejected by Theta API: {resp.status_code} {resp.text[:200]}")
        if resp.status_code >= 400:
            raise ThetaAPIError(resp.status_code, resp.text, str(resp.url))

        payload = resp.json()
        return TraceListResponse(
            data=payload.get("items", []),
            next_cursor=payload.get("next_cursor"),
        )

    def get_trace(self, trace_id: str) -> Optional[TraceDetailResponse]:
        """Fetch a full trace detail payload, including steps and attachments."""
        resp = self._http.get(f"/v1/traces/{trace_id}")
        if resp.status_code == 404:
            return None
        if resp.status_code in (401, 403):
            raise ThetaAuthError(f"Auth rejected by Theta API: {resp.status_code} {resp.text[:200]}")
        if resp.status_code >= 400:
            raise ThetaAPIError(resp.status_code, resp.text, str(resp.url))
        return TraceDetailResponse(**resp.json())

    # -- lifecycle --

    def flush(self, timeout: float = 5.0) -> bool:
        return self._batch.flush(timeout=timeout)

    def close(self, timeout: float = 5.0) -> None:
        with self._closed_lock:
            if self._closed:
                return
            self._closed = True
        try:
            self._batch.close(timeout=timeout)
        finally:
            try:
                self._http.close()
            except Exception:
                pass

    def _atexit(self) -> None:
        try:
            self.close(timeout=2.0)
        except Exception:
            pass

    def __enter__(self) -> "TraceClient":
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()

    # -- internals called by Trace / Step / media --

    def _request_signed_url(
        self, content_type: str, size: Optional[int], filename: Optional[str]
    ) -> SignedUrlResponse:
        body: dict[str, Any] = {"content_type": content_type}
        if size is not None:
            body["size"] = size
        if filename is not None:
            body["filename"] = filename
        resp = self._http.post("/v1/media/signed-url", json=body)
        if resp.status_code in (401, 403):
            raise ThetaAuthError(f"Auth rejected by Theta API: {resp.status_code} {resp.text[:200]}")
        if resp.status_code >= 400:
            raise ThetaAPIError(resp.status_code, resp.text, str(resp.url))
        return SignedUrlResponse(**resp.json())

    def _register_trace_start(self, trace: Trace) -> None:
        # Live-tail registration is optional; the current Go API commits the
        # full trace on close, so we skip this hop to avoid 405s in the logs.
        return

    def _stream_step(self, trace: Trace, step: StepModel) -> None:
        # Incremental step streaming is not wired on the ingest API yet; steps
        # ship as part of the final trace commit in ``_commit_trace``.
        return

    def _commit_trace(self, trace: Trace) -> None:
        payload = trace.model.model_dump(mode="json", exclude_none=True)
        self._batch.submit("POST", "/v1/traces", payload)
        self._persist_annotations(trace)

    def _persist_annotations(self, trace: Trace) -> None:
        """POST annotations to the API so they persist in Postgres."""
        trace_id = trace.model.trace_id
        # Trace-level annotations.
        for ann in trace.model.annotations:
            body: dict[str, Any] = {
                "annotation_type": "manual",
            }
            if ann.label is not None:
                body["label"] = ann.label
            if ann.score is not None:
                body["score"] = ann.score
            if ann.comment is not None:
                body["comment"] = ann.comment
            if ann.user is not None:
                body["user_id"] = ann.user
            self._batch.submit("POST", f"/v1/traces/{trace_id}/annotations", body)
        # Step-level annotations.
        for step in trace.model.steps:
            for ann in step.annotations:
                body = {
                    "step_id": step.step_id,
                    "annotation_type": "manual",
                }
                if ann.label is not None:
                    body["label"] = ann.label
                if ann.score is not None:
                    body["score"] = ann.score
                if ann.comment is not None:
                    body["comment"] = ann.comment
                if ann.user is not None:
                    body["user_id"] = ann.user
                self._batch.submit("POST", f"/v1/traces/{trace_id}/annotations", body)


# -- Module-level default client + zero-config ``trace()`` ----------------------

_default_client_lock = threading.Lock()
_default_client: Optional[TraceClient] = None


def get_default_client() -> TraceClient:
    """Return (or lazily construct) a process-global client from env vars."""
    global _default_client
    if _default_client is not None:
        return _default_client
    with _default_client_lock:
        if _default_client is None:
            _default_client = TraceClient()
        return _default_client


def trace(name: str, **kwargs: Any) -> Trace:
    """Zero-config entrypoint: ``with trace("my-agent") as t: ...``.

    Requires ``THETA_API_KEY`` and ``THETA_PROJECT`` in env.
    """
    return get_default_client().trace(name, **kwargs)


def observe(
    name: Optional[str] = None,
    type: StepType = "custom",
    model: Optional[str] = None,
) -> Callable[[F], F]:
    """Module-level observe decorator using the default client."""
    return get_default_client().observe(name=name, type=type, model=model)


__all__ = ["TraceClient", "trace", "observe", "get_default_client"]
