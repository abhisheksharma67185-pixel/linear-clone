"""First-party integrations that wrap popular LLM SDKs into Theta traces."""

from __future__ import annotations

from typing import Any

__all__ = ["wrap_openai", "wrap_anthropic", "wrap_openclaw"]


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
