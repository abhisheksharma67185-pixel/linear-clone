package store

import (
	"context"
	"fmt"
)

// TextSearchResult holds a trace_id and its full-text-search rank.
type TextSearchResult struct {
	TraceID string
	Rank    float64
}

// UpsertTraceText stores extracted text for full-text search.
func (s *Store) UpsertTraceText(ctx context.Context, traceID, projectID, text, textHash string) error {
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO trace_embeddings (trace_id, project_id, text_content, text_hash)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (trace_id)
		DO UPDATE SET text_content = EXCLUDED.text_content,
		              text_hash = EXCLUDED.text_hash,
		              project_id = EXCLUDED.project_id
	`, traceID, projectID, text, textHash)
	return err
}

// FullTextSearch uses PostgreSQL tsvector for fast keyword + phrase search.
func (s *Store) FullTextSearch(ctx context.Context, projectID, query string, limit int) ([]TextSearchResult, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT trace_id,
		       ts_rank(to_tsvector('english', text_content), websearch_to_tsquery('english', $1)) AS rank
		FROM trace_embeddings
		WHERE project_id = $2
		  AND to_tsvector('english', text_content) @@ websearch_to_tsquery('english', $1)
		ORDER BY rank DESC
		LIMIT $3
	`, query, projectID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []TextSearchResult
	for rows.Next() {
		var r TextSearchResult
		if err := rows.Scan(&r.TraceID, &r.Rank); err != nil {
			return nil, err
		}
		results = append(results, r)
	}
	return results, rows.Err()
}

// UpsertEmbedding stores a vector embedding (for future use with pgvector).
func (s *Store) UpsertEmbedding(ctx context.Context, traceID, projectID string, embedding []float32, textHash string) error {
	vecStr := float32SliceToVectorLiteral(embedding)
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO trace_embeddings (trace_id, project_id, embedding, text_hash)
		VALUES ($1, $2, $3::vector, $4)
		ON CONFLICT (trace_id)
		DO UPDATE SET embedding = EXCLUDED.embedding,
		              text_hash = EXCLUDED.text_hash,
		              project_id = EXCLUDED.project_id
	`, traceID, projectID, vecStr, textHash)
	return err
}

// SearchEmbeddings finds closest embeddings by cosine distance (for future use).
func (s *Store) SearchEmbeddings(ctx context.Context, projectID string, queryEmbedding []float32, limit int) ([]TextSearchResult, error) {
	if limit <= 0 {
		limit = 10
	}
	vecStr := float32SliceToVectorLiteral(queryEmbedding)
	rows, err := s.Pool.Query(ctx, `
		SELECT trace_id, embedding <=> $1::vector AS distance
		FROM trace_embeddings
		WHERE project_id = $2
		ORDER BY embedding <=> $1::vector
		LIMIT $3
	`, vecStr, projectID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []TextSearchResult
	for rows.Next() {
		var r TextSearchResult
		if err := rows.Scan(&r.TraceID, &r.Rank); err != nil {
			return nil, err
		}
		results = append(results, r)
	}
	return results, rows.Err()
}

func float32SliceToVectorLiteral(v []float32) string {
	if len(v) == 0 {
		return "[]"
	}
	buf := make([]byte, 0, len(v)*12)
	buf = append(buf, '[')
	for i, f := range v {
		if i > 0 {
			buf = append(buf, ',')
		}
		buf = append(buf, []byte(fmt.Sprintf("%g", f))...)
	}
	buf = append(buf, ']')
	return string(buf)
}
