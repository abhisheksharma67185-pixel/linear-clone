-- +goose Up
-- +goose StatementBegin

CREATE TABLE saved_filters (
  id text PRIMARY KEY DEFAULT ('sf_' || replace(gen_random_uuid()::text, '-', '')),
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  filters jsonb NOT NULL DEFAULT '{}',
  color text,
  is_default boolean NOT NULL DEFAULT false,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, name)
);
CREATE INDEX saved_filters_project_idx ON saved_filters(project_id);

-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS saved_filters;
