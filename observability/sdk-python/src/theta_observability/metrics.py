"""Metric recording helpers — POST metric events and definitions to the API."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any, Optional

if TYPE_CHECKING:  # pragma: no cover
    from .client import TraceClient

logger = logging.getLogger("theta_observability")


def record_metric(
    client: "TraceClient",
    metric_id_or_name: str,
    trace_id: str,
    *,
    passed: Optional[bool] = None,
    score: Optional[float] = None,
    label: Optional[str] = None,
) -> None:
    """POST a metric event against a trace.

    Fails softly — logs a warning on error instead of raising.
    """
    body: dict[str, Any] = {
        "trace_id": trace_id,
    }
    if passed is not None:
        body["passed"] = passed
    if score is not None:
        body["score"] = score
    if label is not None:
        body["label"] = label

    try:
        resp = client._http.post(
            f"/v1/metrics/{metric_id_or_name}/events",
            json=body,
        )
        if resp.status_code >= 400:
            logger.warning(
                "theta-observability: record_metric %r returned %d: %s",
                metric_id_or_name,
                resp.status_code,
                resp.text[:300],
            )
    except Exception:
        logger.warning(
            "theta-observability: record_metric %r failed",
            metric_id_or_name,
            exc_info=True,
        )


def create_metric(
    client: "TraceClient",
    name: str,
    type: str,
    *,
    evaluator_prompt: Optional[str] = None,
    description: Optional[str] = None,
    project_id: Optional[str] = None,
) -> None:
    """Create a metric definition (admin). Fails softly."""
    body: dict[str, Any] = {
        "project_id": project_id or client.project,
        "name": name,
        "type": type,
    }
    if evaluator_prompt is not None:
        body["evaluator_prompt"] = evaluator_prompt
    if description is not None:
        body["description"] = description

    try:
        resp = client._http.post("/v1/metrics", json=body)
        if resp.status_code >= 400:
            logger.warning(
                "theta-observability: create_metric %r returned %d: %s",
                name,
                resp.status_code,
                resp.text[:300],
            )
    except Exception:
        logger.warning(
            "theta-observability: create_metric %r failed",
            name,
            exc_info=True,
        )


__all__ = ["record_metric", "create_metric"]
