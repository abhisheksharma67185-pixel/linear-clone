"""Anthropic integration.

Patches ``messages.create`` to emit an ``llm`` step around each call, capturing
model, messages, response, token usage, and handling streaming.
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
        return int(usage.get("input_tokens", 0) or 0), int(usage.get("output_tokens", 0) or 0)
    return int(getattr(usage, "input_tokens", 0) or 0), int(getattr(usage, "output_tokens", 0) or 0)


def _extract_text(response: Any) -> Optional[str]:
    try:
        content = getattr(response, "content", None) or (response.get("content") if isinstance(response, dict) else None)
        if not content:
            return None
        parts: list[str] = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    parts.append(block.get("text", ""))
            else:
                if getattr(block, "type", None) == "text":
                    parts.append(getattr(block, "text", ""))
        return "".join(parts) or None
    except Exception:
        return None


class _StreamProxy:
    def __init__(self, stream: Any, step: Any):
        self._stream = stream
        self._step = step
        self._text: list[str] = []
        self._usage: Optional[tuple[int, int]] = None

    def _absorb(self, event: Any) -> None:
        try:
            etype = getattr(event, "type", None) or (event.get("type") if isinstance(event, dict) else None)
            if etype == "content_block_delta":
                delta = getattr(event, "delta", None) or event.get("delta")  # type: ignore[union-attr]
                text = getattr(delta, "text", None) or (delta.get("text") if isinstance(delta, dict) else None)
                if text:
                    self._text.append(text)
            elif etype == "message_delta":
                usage = _extract_usage(event)
                if usage:
                    self._usage = usage
        except Exception:
            pass

    def __iter__(self) -> Any:
        try:
            for event in self._stream:
                self._absorb(event)
                yield event
        finally:
            self._finalize()

    async def __aiter__(self) -> Any:
        try:
            async for event in self._stream:  # type: ignore[attr-defined]
                self._absorb(event)
                yield event
        finally:
            self._finalize()

    def _finalize(self) -> None:
        try:
            if self._text:
                self._step.log_message(role="assistant", text="".join(self._text))
            if self._usage:
                self._step.set_token_usage(input=self._usage[0], output=self._usage[1])
        except Exception:
            logger.debug("theta-observability: anthropic stream finalize failed", exc_info=True)


def wrap_anthropic(client: Any, obs: Any = None) -> Any:
    """Patch ``messages.create`` for tracing."""
    obs_client = _resolve_client(obs)

    try:
        messages = client.messages
    except AttributeError:
        logger.warning("theta-observability: wrap_anthropic received a client without .messages")
        return client

    original_create = messages.create

    def create(*args: Any, **kwargs: Any) -> Any:
        trace = obs_client.current_trace()
        if trace is None:
            return original_create(*args, **kwargs)
        model = kwargs.get("model", "unknown")
        stream = kwargs.get("stream", False)
        step = trace.step(name="anthropic.messages", type="llm", model=model)
        step.__enter__()
        started = time.monotonic()
        try:
            for m in kwargs.get("messages", []):
                role = m.get("role") if isinstance(m, dict) else getattr(m, "role", "user")
                content = m.get("content") if isinstance(m, dict) else getattr(m, "content", None)
                text = content if isinstance(content, str) else None
                step.log_message(role=role or "user", text=text)

            response = original_create(*args, **kwargs)

            if stream:
                return _StreamProxy(response, step)

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

    messages.create = create  # type: ignore[assignment]
    return client


__all__ = ["wrap_anthropic"]
