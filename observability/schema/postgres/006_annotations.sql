-- +goose Up
-- +goose StatementBegin

CREATE TABLE annotations (
  id text PRIMARY KEY DEFAULT ('ann_' || replace(gen_random_uuid()::text, '-', '')),
  trace_id text NOT NULL,
  step_id text,                    -- nullable; null = trace-level annotation
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label text,                      -- e.g. "pass", "fail", "hallucination", "good", "needs_review"
  score double precision,          -- 0.0-1.0 or arbitrary numeric
  comment text,
  annotation_type text NOT NULL DEFAULT 'manual' CHECK (annotation_type IN ('manual','automated','feedback')),
  user_id text,                    -- who created it (email or user id)
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX annotations_trace_idx ON annotations(trace_id);
CREATE INDEX annotations_project_idx ON annotations(project_id, created_at DESC);
CREATE INDEX annotations_label_idx ON annotations(project_id, label);
CREATE INDEX annotations_type_idx ON annotations(project_id, annotation_type);

-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS annotations;
