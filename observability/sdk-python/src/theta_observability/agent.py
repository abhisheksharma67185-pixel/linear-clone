"""Agent wrapping — create traces automatically for agent function invocations."""

from __future__ import annotations

import asyncio
import functools
import inspect
import logging
import traceback
from dataclasses import dataclass
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    Generic,
    Iterator,
    Optional,
    TypeVar,
    Union,
    overload,
)

from .ids import generate_id
from .trace import Trace

if TYPE_CHECKING:  # pragma: no cover
    from .client import TraceClient

logger = logging.getLogger("theta_observability")

T = TypeVar("T")


class AgentContext:
    """Passed as the first argument to a wrapped agent function.

    Provides access to the underlying trace and a convenience
    :meth:`on_complete` helper that records the agent output.
    """

    def __init__(self, trace: Trace, run_id: str) -> None:
        self.trace = trace
        self.run_id = run_id

    def on_complete(self, result: Any) -> None:
        """Store the agent output in trace metadata and create an output step."""
        self.trace.set_metadata(output=result)
        with self.trace.step(name="agent.output", type="custom") as s:
            s.set_metadata(output=result)


@dataclass(frozen=True)
class AgentResult(Generic[T]):
    """Return value of a wrapped agent.  Supports ``result, run_id = ...`` unpacking."""

    result: T
    run_id: str

    def __iter__(self) -> Iterator[Any]:
        return iter((self.result, self.run_id))


def _build_sync_wrapper(
    client: "TraceClient",
    agent_name: str,
    func: Callable[..., Any],
) -> Callable[..., AgentResult[Any]]:
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> AgentResult[Any]:
        result: Any = None
        trace_id: str = ""
        try:
            with client.trace(
                name=agent_name,
                run_type="agent",
                metadata={"input": {"args": list(args), "kwargs": kwargs}},
            ) as t:
                trace_id = t.model.trace_id
                ctx = AgentContext(trace=t, run_id=trace_id)
                result = func(ctx, *args, **kwargs)
        except Exception:
            logger.warning(
                "theta-observability: agent %r raised:\n%s",
                agent_name,
                traceback.format_exc(),
            )
            raise
        return AgentResult(result=result, run_id=trace_id)

    return wrapper


def _build_async_wrapper(
    client: "TraceClient",
    agent_name: str,
    func: Callable[..., Any],
) -> Callable[..., Any]:
    @functools.wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> AgentResult[Any]:
        result: Any = None
        trace_id: str = ""
        try:
            with client.trace(
                name=agent_name,
                run_type="agent",
                metadata={"input": {"args": list(args), "kwargs": kwargs}},
            ) as t:
                trace_id = t.model.trace_id
                ctx = AgentContext(trace=t, run_id=trace_id)
                result = await func(ctx, *args, **kwargs)
        except Exception:
            logger.warning(
                "theta-observability: agent %r raised:\n%s",
                agent_name,
                traceback.format_exc(),
            )
            raise
        return AgentResult(result=result, run_id=trace_id)

    return wrapper


def wrap_agent(
    client: "TraceClient",
    name: str,
    func: Optional[Callable[..., Any]] = None,
) -> Any:
    """Wrap an agent function so every call produces a trace.

    Can be used as a decorator (``func is None``) or called directly with a
    function argument (``func`` provided).

    Returns a wrapper that yields :class:`AgentResult` (tuple-unpackable to
    ``(result, run_id)``).
    """

    if func is not None:
        # Functional (non-decorator) usage
        if asyncio.iscoroutinefunction(func):
            return _build_async_wrapper(client, name, func)
        return _build_sync_wrapper(client, name, func)

    # Decorator usage — return a decorator
    def decorator(fn: Callable[..., Any]) -> Any:
        if asyncio.iscoroutinefunction(fn):
            return _build_async_wrapper(client, name, fn)
        return _build_sync_wrapper(client, name, fn)

    return decorator


__all__ = ["AgentContext", "AgentResult", "wrap_agent"]
