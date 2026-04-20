#!/usr/bin/env python3
"""
Reset project-scoped trace data in the local Theta dev stack.

This deletes:
- trace rows from BigQuery emulator (`traces`, `steps`)
- trace JSON + attachments under `orgs/*/projects/<project_id>/traces/` in fake-gcs
- trace-derived Postgres records for the project (annotations, embeddings, incidents, clusters, metric events, threads)

Intended for local backfill/re-import workflows.
"""

from __future__ import annotations

import argparse
import json
from urllib.parse import quote

import psycopg
import requests


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Reset local Theta trace data for a project.")
    parser.add_argument("--project-id", required=True)
    parser.add_argument("--postgres-dsn", default="postgres://theta:theta@localhost:5432/theta_obs?sslmode=disable")
    parser.add_argument("--gcs-endpoint", default="http://localhost:4443/storage/v1")
    parser.add_argument("--gcs-bucket", default="theta-obs-dev")
    parser.add_argument("--bq-endpoint", default="http://localhost:9050")
    parser.add_argument("--bq-project", default="theta-obs-dev")
    parser.add_argument("--bq-dataset", default="theta_observability")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def run_bq_delete(endpoint: str, project: str, query: str, dry_run: bool) -> None:
    if dry_run:
        print(f"[dry-run] BQ query: {query}")
        return
    response = requests.post(
        f"{endpoint.rstrip('/')}/bigquery/v2/projects/{project}/queries",
        headers={"content-type": "application/json"},
        json={"query": query, "useLegacySql": False},
        timeout=60,
    )
    response.raise_for_status()


def list_gcs_objects(endpoint: str, bucket: str, prefix: str) -> list[str]:
    base = endpoint.rstrip("/")
    objects: list[str] = []
    page_token: str | None = None
    while True:
        params = {"prefix": prefix}
        if page_token:
            params["pageToken"] = page_token
        response = requests.get(f"{base}/b/{bucket}/o", params=params, timeout=60)
        response.raise_for_status()
        payload = response.json()
        objects.extend(item["name"] for item in payload.get("items", []))
        page_token = payload.get("nextPageToken")
        if not page_token:
            return objects


def delete_gcs_object(endpoint: str, bucket: str, name: str, dry_run: bool) -> None:
    if dry_run:
        print(f"[dry-run] delete gs://{bucket}/{name}")
        return
    response = requests.delete(
        f"{endpoint.rstrip('/')}/b/{bucket}/o/{quote(name, safe='')}",
        timeout=60,
    )
    response.raise_for_status()


def reset_postgres(dsn: str, project_id: str, dry_run: bool) -> None:
    statements = [
        ("annotations", "DELETE FROM annotations WHERE project_id = %s"),
        ("trace_embeddings", "DELETE FROM trace_embeddings WHERE project_id = %s"),
        ("metric_events", "DELETE FROM metric_events WHERE project_id = %s"),
        ("incident_traces", "DELETE FROM incident_traces WHERE incident_id IN (SELECT id FROM incidents WHERE project_id = %s)"),
        ("incidents", "DELETE FROM incidents WHERE project_id = %s"),
        ("cluster_traces", "DELETE FROM cluster_traces WHERE cluster_id IN (SELECT id FROM clusters WHERE project_id = %s)"),
        ("clusters", "DELETE FROM clusters WHERE project_id = %s"),
        ("conversation_thread_traces", "DELETE FROM conversation_thread_traces WHERE thread_id IN (SELECT id FROM conversation_threads WHERE project_id = %s)"),
        ("conversation_threads", "DELETE FROM conversation_threads WHERE project_id = %s"),
    ]
    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            for label, statement in statements:
                if dry_run:
                    print(f"[dry-run] SQL {label}: {statement} [{project_id}]")
                    continue
                cur.execute(statement, (project_id,))
                print(f"postgres: cleared {label} ({cur.rowcount} rows)")
        if dry_run:
            conn.rollback()
        else:
            conn.commit()


def main() -> None:
    args = parse_args()
    project_id = args.project_id

    print(f"resetting trace data for project {project_id}")

    run_bq_delete(
        args.bq_endpoint,
        args.bq_project,
        f"DELETE FROM `{args.bq_project}.{args.bq_dataset}.steps` WHERE project_id = '{project_id}'",
        args.dry_run,
    )
    run_bq_delete(
        args.bq_endpoint,
        args.bq_project,
        f"DELETE FROM `{args.bq_project}.{args.bq_dataset}.traces` WHERE project_id = '{project_id}'",
        args.dry_run,
    )
    print("bigquery: cleared project rows")

    prefix = f"orgs/"
    object_names = [
        name
        for name in list_gcs_objects(args.gcs_endpoint, args.gcs_bucket, prefix)
        if f"/projects/{project_id}/traces/" in name
    ]
    for object_name in object_names:
        delete_gcs_object(args.gcs_endpoint, args.gcs_bucket, object_name, args.dry_run)
    print(f"gcs: cleared {len(object_names)} objects")

    reset_postgres(args.postgres_dsn, project_id, args.dry_run)
    print("done")


if __name__ == "__main__":
    main()
