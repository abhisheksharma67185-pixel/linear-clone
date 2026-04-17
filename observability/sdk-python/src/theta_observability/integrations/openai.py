"""OpenAI integration.

Usage::

    from openai import OpenAI
    from theta_observability import TraceClient
    from theta_observability.integrations.openai import wrap_openai

    obs = TraceClient()
    oai = wrap_openai(OpenAI(), obs)

    with obs.trace("chat"):
        oai.chat.completions.create(model="gpt-4o", messages=[...])

Monkey-patches ``chat.completions.create`` (sync + async) to emit an ``llm`` step
around every call, capturing the request, response, and token usage. Streaming
responses are proxied; token usage is captured from the final chunk when the
underlying SDK reports it.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

logger = logging.getLogger("theta_observability")


def _resolve_client(obs: Any) -> Any:
    if obs is not None:
        return obs
    from ..client import get_default_client

    return get_default_client()


def _extract_usage(response: Any) -> Optional[tuple[int, int]]:
    usage = getattr(response, "usage", None)
    if usage is None and isinstance(response, dict):
        usage = response.get("usage")
    if usage is None:
        return None
    if isinstance(usage, dict):
        return int(usage.get("prompt_tokens", 0) or 0), int(usage.get("completion_tokens", 0) or 0)
    return int(getattr(usage, "prompt_tokens", 0) or 0), int(getattr(usage, "completion_tokens", 0) or 0)


def _extract_text(response: Any) -> Optional[str]:
    try:
        choices = getattr(response, "choices", None) or response.get("choices")  # type: ignore[union-attr]
        if not choices:
            return None
        msg = getattr(choices[0], "message", None) or choices[0].get("message")  # type: ignore[union-attr]
        if msg is None:
            return None
        return getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else None)
    except Exception:
        return None


class _StreamProxy:
    """Iterates the underlying stream, records chunks, finalizes the step on exhaust."""

    def __init__(self, stream: Any, step: Any, client: Any):
        self._stream = stream
        self._step = step
        self._client = client
        self._text_parts: list[str] = []
        self._usage: Optional[tuple[int, int]] = None

    def _absorb(self, chunk: Any) -> None:
        try:
            choices = getattr(chunk, "choices", None) or (chunk.get("choices") if isinstance(chunk, dict) else None)
            if choices:
                delta = getattr(choices[0], "delta", None) or choices[0].get("delta")  # type: ignore[union-attr]
                content = getattr(delta, "content", None) or (delta.get("content") if isinstance(delta, dict) else None)
                if content:
                    self._text_parts.append(content)
            usage = _extract_usage(chunk)
            if usage is not None:
                self._usage = usage
        except Exception:
            pass

    def __iter__(self) -> Any:
        try:
            for chunk in self._stream:
                self._absorb(chunk)
                yield chunk
        finally:
            self._finalize()

    async def __aiter__(self) -> Any:
        try:
            async for chunk in self._stream:  # type: ignore[attr-defined]
                self._absorb(chunk)
                yield chunk
        finally:
            self._finalize()

    def _finalize(self) -> None:
        try:
            if self._text_parts:
                self._step.log_message(role="assistant", text="".join(self._text_parts))
            if self._usage:
                self._step.set_token_usage(input=self._usage[0], output=self._usage[1])
        except Exception:
            logger.debug("theta-observability: stream finalize failed", exc_info=True)


def wrap_openai(client: Any, obs: Any = None) -> Any:
    """Return ``client`` with ``chat.completions.create`` patched for tracing."""
    obs_client = _resolve_client(obs)

    try:
        completions = client.chat.completions
    except AttributeError:
        logger.warning("theta-observability: wrap_openai received a client without chat.completions")
        return client

    original_create = completions.create

    def create(*args: Any, **kwargs: Any) -> Any:
        model = kwargs.get("model", "unknown")
        messages = kwargs.get("messages", [])
        stream = kwargs.get("stream", False)

        trace = obs_client.current_trace()
        if trace is None:
            # No active trace — call through untouched.
            return original_create(*args, **kwargs)

        step = trace.step(name="openai.chat.completions", type="llm", model=model)
        step.__enter__()
        started = time.monotonic()
        try:
            for m in messages:
                role = m.get("role") if isinstance(m, dict) else getattr(m, "role", "user")
                content = m.get("content") if isinstance(m, dict) else getattr(m, "content", None)
                text = content if isinstance(content, str) else None
                step.log_message(role=role or "user", text=text)

            response = original_create(*args, **kwargs)

            if stream:
                return _StreamProxy(response, step, obs_client)

            usage = _extract_usage(response)
            if usage:
                step.set_token_usage(input=usage[0], output=usage[1])
            text = _extract_text(response)
            if text:
                step.log_message(role="assistant", text=text)
            step.set_metadata(latency_ms=int((time.monotonic() - started) * 1000))
            step.__exit__(None, None, None)
            return response
        except Exception as exc:
            step.__exit__(type(exc), exc, exc.__traceback__)
            raise

    completions.create = create  # type: ignore[assignment]

    # Async path
    if hasattr(completions, "acreate"):
        original_acreate = completions.acreate  # type: ignore[attr-defined]

        async def acreate(*args: Any, **kwargs: Any) -> Any:
            trace = obs_client.current_trace()
            if trace is None:
                return await original_acreate(*args, **kwargs)
            model = kwargs.get("model", "unknown")
            step = trace.step(name="openai.chat.completions", type="llm", model=model)
            step.__enter__()
            try:
                response = await original_acreate(*args, **kwargs)
                usage = _extract_usage(response)
                if usage:
                    step.set_token_usage(input=usage[0], output=usage[1])
                text = _extract_text(response)
                if text:
                    step.log_message(role="assistant", text=text)
                step.__exit__(None, None, None)
                return response
            except Exception as exc:
                step.__exit__(type(exc), exc, exc.__traceback__)
                raise

        completions.acreate = acreate  # type: ignore[attr-defined]

    return client


__all__ = ["wrap_openai"]
