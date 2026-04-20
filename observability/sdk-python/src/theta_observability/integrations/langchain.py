"""LangChain integration helpers for runnable-style objects."""

from __future__ import annotations

import inspect
from typing import Any, Optional


def _resolve_client(obs: Any) -> Any:
    if obs is not None:
        return obs
    from ..client import get_default_client

    return get_default_client()


def _stringify(value: Any) -> str:
    if isinstance(value, str):
        return value
    if value is None:
        return ""
    return str(value)


def _log_value(step: Any, value: Any, *, fallback_role: str) -> None:
    if isinstance(value, list):
        for item in value:
            _log_value(step, item, fallback_role=fallback_role)
        return
    if isinstance(value, dict):
        role = str(value.get("role") or fallback_role)
        content = value.get("content")
        if isinstance(content, str):
            step.log_message(role=role, text=content)
            return
        if isinstance(content, list):
            text = "".join(
                _stringify(item.get("text", "")) if isinstance(item, dict) else _stringify(item)
                for item in content
            )
            step.log_message(role=role, text=text or _stringify(value))
            return
    step.log_message(role=fallback_role, text=_stringify(value))


def wrap_langchain_runnable(runnable: Any, obs: Any = None, *, name: Optional[str] = None) -> Any:
    client = _resolve_client(obs)
    runnable_name = name or runnable.__class__.__name__ or "langchain.runnable"

    if hasattr(runnable, "invoke"):
        original_invoke = runnable.invoke

        def invoke(input_value: Any, *args: Any, **kwargs: Any) -> Any:
            metadata = {"integration": "langchain"}
            with client.trace(name=runnable_name, run_type="chain", metadata=metadata) as trace:
                with trace.step(name=runnable_name, type="custom", metadata=metadata) as step:
                    _log_value(step, input_value, fallback_role="user")
                    output = original_invoke(input_value, *args, **kwargs)
                    _log_value(step, output, fallback_role="assistant")
                    return output

        runnable.invoke = invoke

    if hasattr(runnable, "ainvoke"):
        original_ainvoke = runnable.ainvoke

        async def ainvoke(input_value: Any, *args: Any, **kwargs: Any) -> Any:
            metadata = {"integration": "langchain"}
            with client.trace(name=runnable_name, run_type="chain", metadata=metadata) as trace:
                with trace.step(name=runnable_name, type="custom", metadata=metadata) as step:
                    _log_value(step, input_value, fallback_role="user")
                    output = await original_ainvoke(input_value, *args, **kwargs)
                    _log_value(step, output, fallback_role="assistant")
                    return output

        runnable.ainvoke = ainvoke

    if hasattr(runnable, "stream"):
        original_stream = runnable.stream

        def stream(input_value: Any, *args: Any, **kwargs: Any) -> Any:
            metadata = {"integration": "langchain"}
            with client.trace(name=runnable_name, run_type="chain", metadata=metadata) as trace:
                with trace.step(name=runnable_name, type="custom", metadata=metadata) as step:
                    _log_value(step, input_value, fallback_role="user")
                    chunks: list[str] = []
                    for chunk in original_stream(input_value, *args, **kwargs):
                        chunks.append(_stringify(getattr(chunk, "content", None) or (chunk.get("content") if isinstance(chunk, dict) else chunk)))
                        yield chunk
                    if chunks:
                        step.log_message(role="assistant", text="".join(chunks))

        runnable.stream = stream

    if hasattr(runnable, "astream"):
        original_astream = runnable.astream

        async def astream(input_value: Any, *args: Any, **kwargs: Any) -> Any:
            metadata = {"integration": "langchain"}
            with client.trace(name=runnable_name, run_type="chain", metadata=metadata) as trace:
                with trace.step(name=runnable_name, type="custom", metadata=metadata) as step:
                    _log_value(step, input_value, fallback_role="user")
                    chunks: list[str] = []
                    async for chunk in original_astream(input_value, *args, **kwargs):
                        chunks.append(_stringify(getattr(chunk, "content", None) or (chunk.get("content") if isinstance(chunk, dict) else chunk)))
                        yield chunk
                    if chunks:
                        step.log_message(role="assistant", text="".join(chunks))

        runnable.astream = astream

    return runnable


__all__ = ["wrap_langchain_runnable"]
