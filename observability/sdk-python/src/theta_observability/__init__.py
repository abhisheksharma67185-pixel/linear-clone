"""Theta Observability — multimodal agent tracing SDK.

Quickstart (zero-config, reads ``THETA_API_KEY`` / ``THETA_PROJECT`` from env):

    from theta_observability import trace

    with trace("checkout-agent") as t:
        with t.step(name="plan", type="llm", model="claude-opus-4.6") as s:
            s.log_message(role="user", text="Buy milk", images=["./screen.png"])
            s.set_token_usage(input=900, output=120)

Or create a client explicitly:

    from theta_observability import TraceClient
    client = TraceClient(api_key=..., project="proj_abc")
"""

from ._version import __version__
from .agent import AgentContext, AgentResult, wrap_agent
from .client import TraceClient, get_default_client, observe, trace
from .errors import (
    ThetaAPIError,
    ThetaAuthError,
    ThetaConfigError,
    ThetaMediaUploadError,
    ThetaObservabilityError,
)
from .trace import Step, Trace
from . import types

__all__ = [
    "__version__",
    "TraceClient",
    "Trace",
    "Step",
    "trace",
    "observe",
    "get_default_client",
    "types",
    "AgentContext",
    "AgentResult",
    "wrap_agent",
    "ThetaObservabilityError",
    "ThetaAPIError",
    "ThetaAuthError",
    "ThetaConfigError",
    "ThetaMediaUploadError",
]
