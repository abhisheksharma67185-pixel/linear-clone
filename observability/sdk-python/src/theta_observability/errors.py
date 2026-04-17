"""Exception hierarchy for the Theta Observability SDK."""

from __future__ import annotations

from typing import Optional


class ThetaObservabilityError(Exception):
    """Base class for all SDK-raised errors."""


class ThetaAuthError(ThetaObservabilityError):
    """Raised when the API rejects the request with 401/403."""


class ThetaAPIError(ThetaObservabilityError):
    """A non-2xx HTTP response from the ingest API."""

    def __init__(self, status_code: int, detail: str, url: str):
        self.status_code = status_code
        self.detail = detail
        self.url = url
        super().__init__(f"Theta API error {status_code} ({url}): {detail}")


class ThetaConfigError(ThetaObservabilityError):
    """Raised when required configuration (api_key, project) is missing."""


class ThetaMediaUploadError(ThetaObservabilityError):
    """Raised when a media blob fails to upload to signed URL."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        self.status_code = status_code
        super().__init__(message)
