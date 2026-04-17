"""OpenClaw integration.

Patches ``responses.create`` to emit an ``llm`` step around each call,
capturing request/response text and token usage for OpenResponses-compatible
clients pointed at an OpenClaw gateway.
"""

from __future__ import annotations

import inspect
import logging
import time
from typing import Any, Optional

logger = logging.getLogger("theta_observability")


def _resolve_client(obs: Any) -> Any:
    if obs is not None:
        return obs
    from ..client import get_default_client

    return get_default_client()


def _input_messages(input_value: Any, instructions: Optional[str]) -> list[tuple[str, Optional[str]]]:
    messages: list[tuple[str, Optional[str]]] = []
    if instructions:
        messages.append(("system", instructions))
    if isinstance(input_value, str):
        messages.append(("user", input_value))
        return messages
    if not isinstance(input_value, list):
        return messages
    for item in input_value:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role") or "user")
        content = item.get("content")
        if isinstance(content, str):
            messages.append((role, content))
            continue
        if isinstance(content, list):
            text = "".join(
                part.get("text", "")
                for part in content
                if isinstance(part, dict) and isinstance(part.get("text"), str)
            )
            messages.append((role, text or None))
    return messages


def _extract_usage(response: Any) -> Optional[tuple[int, int]]:
    usage = getattr(response, "usage", None)
    if usage is None and isinstance(response, dict):
        usage = response.get("usage")
    if usage is None:
        return None
    if isinstance(usage, dict):
        input_tokens = int(usage.get("input_tokens", 0) or 0)
        output_tokens = int(usage.get("output_tokens", 0) or 0)
        return input_tokens, output_tokens
    return int(getattr(usage, "input_tokens", 0) or 0), int(getattr(usage, "output_tokens", 0) or 0)


def _extract_text(response: Any) -> Optional[str]:
    output_text = getattr(response, "output_text", None)
    if isinstance(output_text, str) and output_text:
        return output_text
    if isinstance(response, dict):
        output_text = response.get("output_text")
        if isinstance(output_text, str) and output_text:
            return output_text
    try:
        output = getattr(response, "output", None) or (response.get("output") if isinstance(response, dict) else None)
        if not output:
            return None
        parts: list[str] = []
        for item in output:
            content = getattr(item, "content", None) or (item.get("content") if isinstance(item, dict) else None)
            if not content:
                continue
            for block in content:
                if isinstance(block, dict) and isinstance(block.get("text"), str):
                    parts.append(block["text"])
                elif isinstance(getattr(block, "text", None), str):
                    parts.append(getattr(block, "text"))
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
            if isinstance(etype, str) and etype.endswith(".delta"):
                delta = getattr(event, "delta", None) or (event.get("delta") if isinstance(event, dict) else None)
                text = delta if isinstance(delta, str) else None
                if text is None and isinstance(event, dict):
                    text = event.get("text")
                if text:
                    self._text.append(str(text))
            response = getattr(event, "response", None) or (event.get("response") if isinstance(event, dict) else None)
            usage = _extract_usage(response if response is not None else event)
            if usage is not None:
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
            logger.debug("theta-observability: openclaw stream finalize failed", exc_info=True)


def wrap_openclaw(client: Any, obs: Any = None) -> Any:
    """Patch ``responses.create`` for tracing."""
    obs_client = _resolve_client(obs)

    try:
        responses = client.responses
    except AttributeError:
        logger.warning("theta-observability: wrap_openclaw received a client without .responses")
        return client

    original_create = responses.create

    if inspect.iscoroutinefunction(original_create):

        async def create(*args: Any, **kwargs: Any) -> Any:
            trace = obs_client.current_trace()
            if trace is None:
                return await original_create(*args, **kwargs)
            model = kwargs.get("model", "unknown")
            stream = kwargs.get("stream", False)
            step = trace.step(name="openclaw.responses", type="llm", model=model)
            step.__enter__()
            started = time.monotonic()
            try:
                for role, text in _input_messages(kwargs.get("input"), kwargs.get("instructions")):
                    step.log_message(role=role, text=text)

                response = await original_create(*args, **kwargs)
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

        responses.create = create  # type: ignore[assignment]
        return client

    def create(*args: Any, **kwargs: Any) -> Any:
        trace = obs_client.current_trace()
        if trace is None:
            return original_create(*args, **kwargs)
        model = kwargs.get("model", "unknown")
        stream = kwargs.get("stream", False)
        step = trace.step(name="openclaw.responses", type="llm", model=model)
        step.__enter__()
        started = time.monotonic()
        try:
            for role, text in _input_messages(kwargs.get("input"), kwargs.get("instructions")):
                step.log_message(role=role, text=text)

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

    responses.create = create  # type: ignore[assignment]
    return client


__all__ = ["wrap_openclaw"]
