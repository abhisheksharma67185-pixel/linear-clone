from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.import_evals_ui_traces import (
    attach_desktop_step_images,
    extract_generation_messages,
    mirror_trace_media,
)


def test_extract_generation_messages_maps_anthropic_blocks() -> None:
    obs = {
        "input": {
            "kwargs": {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "buy me shoes"},
                            {
                                "type": "image",
                                "source": {"type": "url", "url": "https://example.com/input.jpg"},
                            },
                        ],
                    },
                    {
                        "role": "assistant",
                        "content": [
                            {"type": "text", "text": "Opening Amazon."},
                            {
                                "type": "tool_use",
                                "id": "toolu_prev",
                                "name": "goto",
                                "input": {"url": "https://amazon.com"},
                            },
                        ],
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "tool_result",
                                "tool_use_id": "toolu_prev",
                                "content": [
                                    {
                                        "type": "image",
                                        "source": {
                                            "type": "url",
                                            "url": "https://example.com/result.jpg",
                                        },
                                    }
                                ],
                            }
                        ],
                    },
                ]
            }
        },
        "output": {
            "role": "assistant",
            "content": [
                {"type": "text", "text": "Now I am clicking search."},
                {
                    "type": "tool_use",
                    "id": "toolu_new",
                    "name": "click",
                    "input": {"x": 10, "y": 20},
                },
            ],
        },
    }

    messages, tool_calls = extract_generation_messages(obs)

    assert messages == [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "buy me shoes"},
                {"type": "image", "uri": "https://example.com/input.jpg", "mime": "image/jpeg"},
            ],
        },
        {
            "role": "assistant",
            "content": [{"type": "text", "text": "Opening Amazon."}],
        },
        {
            "role": "tool",
            "content": [{"type": "image", "uri": "https://example.com/result.jpg", "mime": "image/jpeg"}],
            "tool_call_id": "toolu_prev",
        },
        {
            "role": "assistant",
            "content": [{"type": "text", "text": "Now I am clicking search."}],
        },
    ]
    assert tool_calls == [
        {
            "id": "toolu_new",
            "name": "click",
            "arguments": {"x": 10, "y": 20},
        }
    ]


def test_mirror_trace_media_rewrites_remote_uris(monkeypatch) -> None:
    uploads: list[tuple[str, str, str, bytes, str]] = []

    def fake_download(uri: str, *, source_storage_client=None) -> tuple[bytes, str | None]:
        return (f"payload:{uri}".encode("utf-8"), "image/jpeg")

    def fake_upload(endpoint: str, bucket: str, key: str, content: bytes, content_type: str) -> None:
        uploads.append((endpoint, bucket, key, content, content_type))

    monkeypatch.setattr("scripts.import_evals_ui_traces.download_media_bytes", fake_download)
    monkeypatch.setattr("scripts.import_evals_ui_traces.upload_media_to_theta", fake_upload)

    payload = {
        "trace_id": "tr_test",
        "project_id": "proj_test",
        "steps": [
            {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "image", "uri": "https://example.com/a.jpg", "mime": "image/jpeg"},
                            {"type": "image", "uri": "https://example.com/a.jpg", "mime": "image/jpeg"},
                        ],
                    }
                ],
                "attachments": [],
                "sensor_frames": [],
                "events": [
                    {
                        "type": "artifact",
                        "attachment": {
                            "type": "image",
                            "uri": "https://example.com/b.jpg",
                            "mime": "image/jpeg",
                        },
                    }
                ],
            }
        ],
    }

    mirrored = mirror_trace_media(
        payload,
        org_id="org_test",
        target_gcs_endpoint="http://localhost:4443/storage/v1/",
        target_gcs_bucket="theta-obs-dev",
    )

    mirrored_uri = mirrored["steps"][0]["messages"][0]["content"][0]["uri"]
    mirrored_event_uri = mirrored["steps"][0]["events"][0]["attachment"]["uri"]
    assert mirrored_uri.startswith("gs://theta-obs-dev/orgs/org_test/projects/proj_test/traces/tr_test/attachments/")
    assert mirrored["steps"][0]["messages"][0]["content"][1]["uri"] == mirrored_uri
    assert mirrored_event_uri.startswith("gs://theta-obs-dev/orgs/org_test/projects/proj_test/traces/tr_test/attachments/")
    assert len(uploads) == 2
    assert uploads[0][1] == "theta-obs-dev"
    assert uploads[0][4] == "image/jpeg"


def test_attach_desktop_step_images_adds_artifact_event() -> None:
    payload = {
        "trace_id": "tr_demo",
        "project_id": "proj_demo",
        "steps": [
            {
                "step_id": "st_1",
                "type": "llm",
                "messages": [{"role": "user", "content": [{"type": "text", "text": "search for shoes"}]}],
                "tool_calls": [{"id": "tool_1", "name": "goto", "arguments": {"url": "https://amazon.com"}}],
            }
        ],
    }
    raw_trace = {
        "observations": [
            {
                "type": "generation",
                "input": {
                    "kwargs": {
                        "messages": [
                            {
                                "role": "assistant",
                                "content": [
                                    {
                                        "type": "tool_use",
                                        "id": "tool_1",
                                        "name": "goto",
                                        "input": {"url": "https://amazon.com"},
                                    }
                                ],
                            },
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "tool_result",
                                        "tool_use_id": "tool_1",
                                        "content": [
                                            {
                                                "type": "image",
                                                "source": {
                                                    "type": "url",
                                                    "url": "https://example.com/desktop-step.jpg",
                                                },
                                            }
                                        ],
                                    }
                                ],
                            },
                        ]
                    }
                },
            }
        ]
    }

    enriched = attach_desktop_step_images(payload, raw_trace, "desktop")

    events = enriched["steps"][0]["events"]
    assert len(events) == 1
    assert events[0]["type"] == "artifact"
    assert events[0]["attachment"]["uri"] == "https://example.com/desktop-step.jpg"
    assert events[0]["attachment"]["width"] == 1920
    assert events[0]["attachment"]["height"] == 1080
