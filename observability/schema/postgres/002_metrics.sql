-- +goose Up
-- +goose StatementBegin

CREATE TABLE metrics (
  id text PRIMARY KEY DEFAULT ('met_' || replace(gen_random_uuid()::text, '-', '')),
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('automated','observed')),
  evaluator_prompt text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, name)
);

CREATE TABLE metric_events (
  id text PRIMARY KEY DEFAULT ('mev_' || replace(gen_random_uuid()::text, '-', '')),
  metric_id text NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  trace_id text NOT NULL,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  passed boolean,
  score double precision,
  label text,
  metadata jsonb,
  evaluated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX metric_events_trace_idx ON metric_events(trace_id);
CREATE INDEX metric_events_metric_idx ON metric_events(metric_id, evaluated_at DESC);
CREATE INDEX metric_events_project_idx ON metric_events(project_id, evaluated_at DESC);

-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS metric_events;
DROP TABLE IF EXISTS metrics;
