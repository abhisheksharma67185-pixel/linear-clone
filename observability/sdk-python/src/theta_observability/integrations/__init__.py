"""First-party integrations that wrap popular LLM SDKs into Theta traces."""

from __future__ import annotations

from typing import Any

__all__ = ["wrap_openai", "wrap_anthropic", "wrap_openclaw", "wrap_langchain_runnable"]


def wrap_openai(client: Any, obs: Any = None) -> Any:
    """Lazy-importing wrapper. See ``integrations.openai.wrap_openai``."""
    from .openai import wrap_openai as _wrap

    return _wrap(client, obs)


def wrap_anthropic(client: Any, obs: Any = None) -> Any:
    from .anthropic import wrap_anthropic as _wrap

    return _wrap(client, obs)


def wrap_openclaw(client: Any, obs: Any = None) -> Any:
    from .openclaw import wrap_openclaw as _wrap

    return _wrap(client, obs)


def wrap_langchain_runnable(runnable: Any, obs: Any = None, *, name: str | None = None) -> Any:
    from .langchain import wrap_langchain_runnable as _wrap

    return _wrap(runnable, obs, name=name)
