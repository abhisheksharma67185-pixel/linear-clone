-- +goose Up
-- +goose StatementBegin

CREATE TABLE clusters (
  id text PRIMARY KEY DEFAULT ('clu_' || replace(gen_random_uuid()::text, '-', '')),
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text,
  category text CHECK (category IN ('input','behavior','error','unknown')),
  trace_count int NOT NULL DEFAULT 0,
  representative_trace_id text,
  centroid vector(1024),
  first_seen_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX clusters_project_idx ON clusters(project_id, trace_count DESC);

CREATE TABLE cluster_traces (
  cluster_id text NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  trace_id text NOT NULL,
  distance float NOT NULL DEFAULT 0,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cluster_id, trace_id)
);
CREATE INDEX cluster_traces_trace_idx ON cluster_traces(trace_id);

-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS cluster_traces;
DROP TABLE IF EXISTS clusters;
