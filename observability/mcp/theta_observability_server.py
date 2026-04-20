#!/usr/bin/env python3
"""Minimal MCP stdio server for Theta Observability."""

from __future__ import annotations

import json
import os
import sys
from typing import Any

import requests


SERVER_INFO = {"name": "theta-observability", "version": "0.1.0"}
BASE_URL = os.environ.get("THETA_BASE_URL", "http://localhost:8080").rstrip("/")
API_KEY = os.environ.get("THETA_API_KEY", "")
BEARER_TOKEN = os.environ.get("THETA_BEARER_TOKEN", "")
DEFAULT_PROJECT = os.environ.get("THETA_PROJECT_ID", "")


TOOLS = [
    {
        "name": "theta_list_traces",
        "description": "List traces for a Theta project.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "limit": {"type": "integer", "default": 20},
                "status": {"type": "string"},
                "platform": {"type": "string"},
            },
        },
    },
    {
        "name": "theta_get_trace",
        "description": "Fetch a single trace with full payload.",
        "inputSchema": {
            "type": "object",
            "properties": {"trace_id": {"type": "string"}},
            "required": ["trace_id"],
        },
    },
    {
        "name": "theta_search_traces",
        "description": "Search traces semantically within a project.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "query": {"type": "string"},
                "limit": {"type": "integer", "default": 10},
            },
            "required": ["query"],
        },
    },
    {
        "name": "theta_export_otel",
        "description": "Export project traces as OTLP-style JSON.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "limit": {"type": "integer", "default": 100},
                "since": {"type": "string"},
            },
        },
    },
    {
        "name": "theta_list_threads",
        "description": "List conversation threads for a project.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "limit": {"type": "integer", "default": 50},
            },
        },
    },
    {
        "name": "theta_list_monitors",
        "description": "List monitor configs for a project.",
        "inputSchema": {
            "type": "object",
            "properties": {"project_id": {"type": "string"}},
        },
    },
]


def auth_headers(require_bearer: bool = False) -> dict[str, str]:
    if require_bearer:
        if not BEARER_TOKEN:
            raise RuntimeError("THETA_BEARER_TOKEN is required for this tool")
        return {"authorization": f"Bearer {BEARER_TOKEN}", "content-type": "application/json"}
    if API_KEY:
        return {"x-api-key": API_KEY, "content-type": "application/json"}
    if BEARER_TOKEN:
        return {"authorization": f"Bearer {BEARER_TOKEN}", "content-type": "application/json"}
    raise RuntimeError("Set THETA_API_KEY or THETA_BEARER_TOKEN")


def project_id_from(arguments: dict[str, Any]) -> str:
    return str(arguments.get("project_id") or DEFAULT_PROJECT or "")


def api_get(path: str, *, headers: dict[str, str], params: dict[str, Any] | None = None) -> Any:
    response = requests.get(f"{BASE_URL}{path}", headers=headers, params=params, timeout=60)
    response.raise_for_status()
    return response.json()


def api_post(path: str, *, headers: dict[str, str], payload: dict[str, Any]) -> Any:
    response = requests.post(f"{BASE_URL}{path}", headers=headers, json=payload, timeout=60)
    response.raise_for_status()
    return response.json()


def handle_tool_call(name: str, arguments: dict[str, Any]) -> Any:
    if name == "theta_list_traces":
        project_id = project_id_from(arguments)
        params = {"project_id": project_id, "limit": int(arguments.get("limit", 20))}
        if arguments.get("status"):
            params["status"] = arguments["status"]
        if arguments.get("platform"):
            params["platform"] = arguments["platform"]
        return api_get("/v1/traces", headers=auth_headers(), params=params)

    if name == "theta_get_trace":
        return api_get(f"/v1/traces/{arguments['trace_id']}", headers=auth_headers())

    if name == "theta_search_traces":
        project_id = project_id_from(arguments)
        return api_post(
            "/v1/search",
            headers=auth_headers(),
            payload={
                "project_id": project_id,
                "query": arguments["query"],
                "limit": int(arguments.get("limit", 10)),
            },
        )

    if name == "theta_export_otel":
        project_id = project_id_from(arguments)
        params = {"limit": int(arguments.get("limit", 100))}
        if arguments.get("since"):
            params["since"] = arguments["since"]
        return api_get(
            f"/v1/projects/{project_id}/exports/otel",
            headers=auth_headers(require_bearer=True),
            params=params,
        )

    if name == "theta_list_threads":
        project_id = project_id_from(arguments)
        return api_get(
            f"/v1/projects/{project_id}/threads",
            headers=auth_headers(require_bearer=True),
            params={"limit": int(arguments.get("limit", 50))},
        )

    if name == "theta_list_monitors":
        project_id = project_id_from(arguments)
        return api_get(
            f"/v1/projects/{project_id}/monitors",
            headers=auth_headers(require_bearer=True),
        )

    raise RuntimeError(f"unknown tool: {name}")


def write_message(payload: dict[str, Any]) -> None:
    body = json.dumps(payload).encode("utf-8")
    sys.stdout.write(f"Content-Length: {len(body)}\r\n\r\n")
    sys.stdout.flush()
    sys.stdout.buffer.write(body)
    sys.stdout.buffer.flush()


def read_message() -> dict[str, Any] | None:
    headers: dict[str, str] = {}
    while True:
        line = sys.stdin.buffer.readline()
        if not line:
            return None
        decoded = line.decode("utf-8").strip()
        if not decoded:
            break
        key, _, value = decoded.partition(":")
        headers[key.lower()] = value.strip()
    length = int(headers.get("content-length", "0"))
    if length <= 0:
        return None
    raw = sys.stdin.buffer.read(length)
    if not raw:
        return None
    return json.loads(raw.decode("utf-8"))


def success_response(request_id: Any, result: Any) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": request_id, "result": result}


def error_response(request_id: Any, message: str) -> dict[str, Any]:
    return {
        "jsonrpc": "2.0",
        "id": request_id,
        "error": {"code": -32000, "message": message},
    }


def main() -> None:
    while True:
        message = read_message()
        if message is None:
            return
        request_id = message.get("id")
        method = message.get("method")
        params = message.get("params") or {}

        try:
            if method == "initialize":
                write_message(
                    success_response(
                        request_id,
                        {
                            "protocolVersion": "2024-11-05",
                            "capabilities": {"tools": {}},
                            "serverInfo": SERVER_INFO,
                        },
                    )
                )
                continue

            if method == "tools/list":
                write_message(success_response(request_id, {"tools": TOOLS}))
                continue

            if method == "tools/call":
                result = handle_tool_call(params["name"], params.get("arguments") or {})
                write_message(
                    success_response(
                        request_id,
                        {
                            "content": [{"type": "text", "text": json.dumps(result, indent=2)}],
                            "isError": False,
                        },
                    )
                )
                continue

            if method == "notifications/initialized":
                continue

            write_message(error_response(request_id, f"unsupported method: {method}"))
        except Exception as exc:  # noqa: BLE001
            write_message(error_response(request_id, str(exc)))


if __name__ == "__main__":
    main()
