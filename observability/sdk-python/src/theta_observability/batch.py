"""Background batch sender.

A daemon thread drains a bounded queue, POSTing step batches and final trace
commits to the ingest API. Fails soft — network errors never raise into user
code; instead they're logged and retried with exponential backoff.
"""

from __future__ import annotations

import logging
import queue
import random
import threading
import time
from dataclasses import dataclass
from typing import Any, Callable, Optional

import httpx

logger = logging.getLogger("theta_observability")


@dataclass
class _Job:
    method: str
    path: str
    json: Any
    attempts: int = 0


class BatchSender:
    """Background HTTP sender with retries + bounded queue.

    ``submit_json`` enqueues a POST; callers must not block on it. ``flush()``
    drains the queue and waits for in-flight requests (with a timeout).
    """

    MAX_ATTEMPTS = 5
    QUEUE_SIZE = 10_000

    def __init__(
        self,
        http: httpx.Client,
        flush_interval: float = 0.5,
        max_batch: int = 100,
        debug: bool = False,
    ):
        self._http = http
        self._flush_interval = flush_interval
        self._max_batch = max_batch
        self._debug = debug
        self._queue: "queue.Queue[Optional[_Job]]" = queue.Queue(maxsize=self.QUEUE_SIZE)
        self._stop = threading.Event()
        self._in_flight = 0
        self._pending_retries = 0
        self._in_flight_lock = threading.Lock()
        self._worker = threading.Thread(
            target=self._run, name="theta-obs-batch", daemon=True
        )
        self._worker.start()

    # -- public --

    def submit(self, method: str, path: str, json: Any) -> None:
        """Enqueue a request. Drops on full queue (fail-soft)."""
        try:
            self._queue.put_nowait(_Job(method=method, path=path, json=json))
        except queue.Full:
            logger.warning("theta-observability: batch queue full, dropping event %s %s", method, path)

    def flush(self, timeout: float = 5.0) -> bool:
        """Block until the queue is drained and in-flight requests return.

        Returns True if drained cleanly within ``timeout``.
        """
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if self._queue.empty():
                with self._in_flight_lock:
                    if self._in_flight == 0 and self._pending_retries == 0:
                        return True
            time.sleep(0.02)
        return False

    def close(self, timeout: float = 5.0) -> None:
        self.flush(timeout=timeout)
        self._stop.set()
        try:
            self._queue.put_nowait(None)
        except queue.Full:
            pass
        self._worker.join(timeout=timeout)

    # -- worker loop --

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                job = self._queue.get(timeout=self._flush_interval)
            except queue.Empty:
                continue
            if job is None:
                return
            with self._in_flight_lock:
                self._in_flight += 1
            try:
                self._send(job)
            finally:
                with self._in_flight_lock:
                    self._in_flight -= 1

    def _send(self, job: _Job) -> None:
        try:
            resp = self._http.request(job.method, job.path, json=job.json)
            if resp.status_code < 500 and resp.status_code != 429:
                if resp.status_code >= 400 and self._debug:
                    logger.warning(
                        "theta-observability: %s %s -> %s %s",
                        job.method, job.path, resp.status_code, resp.text[:200],
                    )
                return
            self._retry(job, reason=f"HTTP {resp.status_code}")
        except httpx.HTTPError as exc:
            self._retry(job, reason=str(exc))

    def _retry(self, job: _Job, reason: str) -> None:
        job.attempts += 1
        if job.attempts >= self.MAX_ATTEMPTS:
            logger.warning(
                "theta-observability: giving up on %s %s after %d attempts (%s)",
                job.method, job.path, job.attempts, reason,
            )
            return
        backoff = min(30.0, (2 ** job.attempts) * 0.25 + random.random() * 0.25)
        if self._debug:
            logger.info(
                "theta-observability: retry %d for %s %s in %.2fs (%s)",
                job.attempts, job.method, job.path, backoff, reason,
            )
        # Re-enqueue after sleep; done in a helper thread so we don't block the worker.
        with self._in_flight_lock:
            self._pending_retries += 1
        t = threading.Timer(backoff, self._requeue, args=(job,))
        t.daemon = True
        t.start()

    def _requeue(self, job: _Job) -> None:
        try:
            self._queue.put_nowait(job)
        except queue.Full:
            logger.warning("theta-observability: queue full on retry, dropping %s %s", job.method, job.path)
        finally:
            with self._in_flight_lock:
                self._pending_retries -= 1


__all__ = ["BatchSender"]
