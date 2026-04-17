"""ID generation helpers. ULID-backed, prefix-tagged (tr_, st_, run_, ...)."""

from __future__ import annotations

import ulid


def generate_id(prefix: str) -> str:
    """Generate a prefixed ULID, e.g. ``generate_id("tr") -> "tr_01HW..."``."""
    return f"{prefix}_{ulid.new().str}"
