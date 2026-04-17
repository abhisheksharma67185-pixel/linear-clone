-- +goose Up
-- +goose StatementBegin

CREATE TABLE incidents (
  id text PRIMARY KEY DEFAULT ('inc_' || replace(gen_random_uuid()::text, '-', '')),
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','dismissed')),
  root_cause text,
  severity text DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  first_seen_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  trace_count int NOT NULL DEFAULT 0,
  error_pattern text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX incidents_project_status_idx ON incidents(project_id, status);
CREATE INDEX incidents_project_time_idx ON incidents(project_id, last_seen_at DESC);

CREATE TABLE incident_traces (
  incident_id text NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  trace_id text NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (incident_id, trace_id)
);
CREATE INDEX incident_traces_trace_idx ON incident_traces(trace_id);

-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS incident_traces;
DROP TABLE IF EXISTS incidents;
