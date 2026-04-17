package store

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/theagi/theta-observability/api-go/internal/ids"
	"github.com/theagi/theta-observability/api-go/internal/models"
)

// CreateCluster inserts a new cluster row and returns the populated model.
func (s *Store) CreateCluster(ctx context.Context, projectID, label, category, representativeTraceID string, centroid []float32) (*models.Cluster, error) {
	now := time.Now().UTC()
	c := &models.Cluster{
		ID:                    ids.Cluster(),
		ProjectID:             projectID,
		Label:                 label,
		Category:              category,
		RepresentativeTraceID: representativeTraceID,
		TraceCount:            0,
		FirstSeenAt:           now,
		LastSeenAt:            now,
		CreatedAt:             now,
	}
	var centroidStr *string
	if len(centroid) > 0 {
		s := pgvectorString(centroid)
		centroidStr = &s
	}
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO clusters (id, project_id, label, category, representative_trace_id, centroid, first_seen_at, last_seen_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
	`, c.ID, c.ProjectID, c.Label, c.Category, c.RepresentativeTraceID, centroidStr, c.FirstSeenAt, c.LastSeenAt, c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert cluster: %w", err)
	}
	return c, nil
}

// ListClusters returns clusters for a project sorted by trace_count desc.
func (s *Store) ListClusters(ctx context.Context, projectID string, limit int) ([]models.Cluster, error) {
	if limit <= 0 || limit > 200 {
		limit = 20
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT id, project_id, label, COALESCE(description,''), COALESCE(category,'unknown'),
		       trace_count, COALESCE(representative_trace_id,''), first_seen_at, last_seen_at, created_at
		FROM clusters
		WHERE project_id = $1
		ORDER BY trace_count DESC
		LIMIT $2
	`, projectID, limit)
	if err != nil {
		return nil, fmt.Errorf("list clusters: %w", err)
	}
	defer rows.Close()
	var out []models.Cluster
	for rows.Next() {
		var c models.Cluster
		if err := rows.Scan(&c.ID, &c.ProjectID, &c.Label, &c.Description, &c.Category,
			&c.TraceCount, &c.RepresentativeTraceID, &c.FirstSeenAt, &c.LastSeenAt, &c.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan cluster: %w", err)
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

// GetCluster fetches a single cluster by ID.
func (s *Store) GetCluster(ctx context.Context, clusterID string) (*models.Cluster, error) {
	var c models.Cluster
	err := s.Pool.QueryRow(ctx, `
		SELECT id, project_id, label, COALESCE(description,''), COALESCE(category,'unknown'),
		       trace_count, COALESCE(representative_trace_id,''), first_seen_at, last_seen_at, created_at
		FROM clusters WHERE id = $1
	`, clusterID).Scan(&c.ID, &c.ProjectID, &c.Label, &c.Description, &c.Category,
		&c.TraceCount, &c.RepresentativeTraceID, &c.FirstSeenAt, &c.LastSeenAt, &c.CreatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get cluster: %w", err)
	}
	return &c, nil
}

// AddTracesToCluster inserts cluster_traces rows and updates the parent cluster counts.
func (s *Store) AddTracesToCluster(ctx context.Context, clusterID string, traces []models.ClusterTraceEntry) error {
	if len(traces) == 0 {
		return nil
	}
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// Batch insert cluster_traces.
	for _, t := range traces {
		_, err := tx.Exec(ctx, `
			INSERT INTO cluster_traces (cluster_id, trace_id, distance)
			VALUES ($1, $2, $3)
			ON CONFLICT (cluster_id, trace_id) DO UPDATE SET distance = EXCLUDED.distance
		`, clusterID, t.TraceID, t.Distance)
		if err != nil {
			return fmt.Errorf("insert cluster_trace: %w", err)
		}
	}

	// Update aggregate on parent cluster.
	_, err = tx.Exec(ctx, `
		UPDATE clusters SET
			trace_count = (SELECT count(*) FROM cluster_traces WHERE cluster_id = $1),
			updated_at = now()
		WHERE id = $1
	`, clusterID)
	if err != nil {
		return fmt.Errorf("update cluster count: %w", err)
	}

	return tx.Commit(ctx)
}

// ListClusterTraces returns traces belonging to a cluster, closest first.
func (s *Store) ListClusterTraces(ctx context.Context, clusterID string, limit int) ([]models.ClusterTraceEntry, error) {
	if limit <= 0 || limit > 500 {
		limit = 50
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT trace_id, distance FROM cluster_traces
		WHERE cluster_id = $1
		ORDER BY distance ASC
		LIMIT $2
	`, clusterID, limit)
	if err != nil {
		return nil, fmt.Errorf("list cluster traces: %w", err)
	}
	defer rows.Close()
	var out []models.ClusterTraceEntry
	for rows.Next() {
		var e models.ClusterTraceEntry
		if err := rows.Scan(&e.TraceID, &e.Distance); err != nil {
			return nil, fmt.Errorf("scan cluster trace: %w", err)
		}
		out = append(out, e)
	}
	return out, rows.Err()
}

// UpdateClusterLabel updates a cluster's label and description.
func (s *Store) UpdateClusterLabel(ctx context.Context, clusterID, label, description string) error {
	_, err := s.Pool.Exec(ctx, `
		UPDATE clusters SET label = $2, description = $3, updated_at = now()
		WHERE id = $1
	`, clusterID, label, description)
	if err != nil {
		return fmt.Errorf("update cluster label: %w", err)
	}
	return nil
}

// EmbeddingRow is a trace_id + its vector embedding read from trace_embeddings.
type EmbeddingRow struct {
	TraceID   string
	Embedding []float32
}

// GetAllEmbeddings returns all embeddings for a project since a given time.
// pgvector returns the vector column as text like "[0.1,0.2,...]", so we parse
// it as a JSON array of floats.
func (s *Store) GetAllEmbeddings(ctx context.Context, projectID string, since time.Time) ([]EmbeddingRow, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT trace_id, COALESCE(embedding::text, '')
		FROM trace_embeddings
		WHERE project_id = $1 AND created_at >= $2
		  AND embedding IS NOT NULL
	`, projectID, since)
	if err != nil {
		return nil, fmt.Errorf("get embeddings: %w", err)
	}
	defer rows.Close()
	var out []EmbeddingRow
	for rows.Next() {
		var traceID, embText string
		if err := rows.Scan(&traceID, &embText); err != nil {
			return nil, fmt.Errorf("scan embedding: %w", err)
		}
		if embText == "" {
			continue
		}
		vec, err := parseVectorText(embText)
		if err != nil {
			return nil, fmt.Errorf("parse embedding for %s: %w", traceID, err)
		}
		out = append(out, EmbeddingRow{TraceID: traceID, Embedding: vec})
	}
	return out, rows.Err()
}

// DeleteClustersByProject removes all clusters (and cascade their traces) for a project.
// Used before re-running discovery to avoid stale data.
func (s *Store) DeleteClustersByProject(ctx context.Context, projectID string) error {
	_, err := s.Pool.Exec(ctx, `DELETE FROM clusters WHERE project_id = $1`, projectID)
	if err != nil {
		return fmt.Errorf("delete clusters: %w", err)
	}
	return nil
}

// parseVectorText parses pgvector text representation "[0.1,0.2,...]" into []float32.
func parseVectorText(s string) ([]float32, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil, nil
	}
	// pgvector outputs "[0.1,0.2,0.3]" — valid JSON array.
	var f64s []float64
	if err := json.Unmarshal([]byte(s), &f64s); err != nil {
		return nil, err
	}
	out := make([]float32, len(f64s))
	for i, v := range f64s {
		out[i] = float32(v)
	}
	return out, nil
}

// pgvectorString formats []float32 as a pgvector-compatible literal "[0.1,0.2,...]".
func pgvectorString(v []float32) string {
	parts := make([]string, len(v))
	for i, f := range v {
		parts[i] = fmt.Sprintf("%g", f)
	}
	return "[" + strings.Join(parts, ",") + "]"
}
