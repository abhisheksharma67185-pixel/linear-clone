-- +goose Up

CREATE TABLE conversation_threads (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  external_id text,
  user_id text,
  session_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX conversation_threads_project_external_idx
  ON conversation_threads(project_id, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX conversation_threads_project_idx
  ON conversation_threads(project_id, updated_at DESC);

CREATE INDEX conversation_threads_session_idx
  ON conversation_threads(project_id, session_id);

CREATE TABLE conversation_thread_traces (
  thread_id text NOT NULL REFERENCES conversation_threads(id) ON DELETE CASCADE,
  trace_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, trace_id)
);

CREATE INDEX conversation_thread_traces_trace_idx
  ON conversation_thread_traces(trace_id);

CREATE TABLE monitor_configs (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  signal_key text NOT NULL,
  operator text NOT NULL,
  warn_threshold double precision,
  critical_threshold double precision,
  window_minutes integer NOT NULL DEFAULT 5,
  group_by text,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX monitor_configs_project_idx
  ON monitor_configs(project_id, updated_at DESC);

-- +goose Down

DROP TABLE IF EXISTS monitor_configs;
DROP TABLE IF EXISTS conversation_thread_traces;
DROP TABLE IF EXISTS conversation_threads;
