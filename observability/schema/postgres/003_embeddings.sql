-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE trace_embeddings (
  trace_id text PRIMARY KEY,
  project_id text NOT NULL,
  embedding vector(1024),
  text_hash text,           -- sha256 of the input text, for dedup
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX trace_embeddings_project_idx ON trace_embeddings(project_id);
-- Use ivfflat for approximate nearest neighbor (create after data exists)
-- CREATE INDEX trace_embeddings_ann_idx ON trace_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS trace_embeddings;
DROP EXTENSION IF EXISTS vector;
