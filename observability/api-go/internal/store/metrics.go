package store

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ids"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/jackc/pgx/v5"
)

// CreateMetric inserts a new metric definition scoped to a project.
func (s *Store) CreateMetric(ctx context.Context, projectID, name, metricType string, evaluatorPrompt, description *string) (*models.Metric, error) {
	m := &models.Metric{
		ID:              ids.Metric(),
		ProjectID:       projectID,
		Name:            name,
		Type:            metricType,
		EvaluatorPrompt: evaluatorPrompt,
		Description:     description,
		CreatedAt:       time.Now().UTC(),
	}
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO metrics (id, project_id, name, type, evaluator_prompt, description, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
	`, m.ID, m.ProjectID, m.Name, m.Type, m.EvaluatorPrompt, m.Description, m.CreatedAt)
	if err != nil {
		return nil, err
	}
	return m, nil
}

// GetOrCreateMetricByName returns the existing project-scoped metric if present,
// otherwise inserts a new one atomically. This keeps SDK metric recording
// idempotent for first-write flows.
func (s *Store) GetOrCreateMetricByName(ctx context.Context, projectID, name, metricType string, evaluatorPrompt, description *string) (*models.Metric, error) {
	createdAt := time.Now().UTC()
	var m models.Metric
	err := s.Pool.QueryRow(ctx, `
		INSERT INTO metrics (id, project_id, name, type, evaluator_prompt, description, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
		ON CONFLICT (project_id, name)
		DO UPDATE SET updated_at = EXCLUDED.updated_at
		RETURNING id, project_id, name, type, evaluator_prompt, description, created_at
	`, ids.Metric(), projectID, name, metricType, evaluatorPrompt, description, createdAt).
		Scan(&m.ID, &m.ProjectID, &m.Name, &m.Type, &m.EvaluatorPrompt, &m.Description, &m.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

// ListMetrics returns all metrics for a project.
func (s *Store) ListMetrics(ctx context.Context, projectID string) ([]models.Metric, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT id, project_id, name, type, evaluator_prompt, description, created_at
		FROM metrics WHERE project_id = $1 ORDER BY created_at DESC
	`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Metric
	for rows.Next() {
		var m models.Metric
		if err := rows.Scan(&m.ID, &m.ProjectID, &m.Name, &m.Type, &m.EvaluatorPrompt, &m.Description, &m.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

// GetMetricByName looks up a metric by project + name (for SDK callers that
// pass a name instead of an id).
func (s *Store) GetMetricByName(ctx context.Context, projectID, name string) (*models.Metric, error) {
	var m models.Metric
	err := s.Pool.QueryRow(ctx, `
		SELECT id, project_id, name, type, evaluator_prompt, description, created_at
		FROM metrics WHERE project_id = $1 AND name = $2
	`, projectID, name).Scan(&m.ID, &m.ProjectID, &m.Name, &m.Type, &m.EvaluatorPrompt, &m.Description, &m.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

// GetMetric fetches a metric by ID.
func (s *Store) GetMetric(ctx context.Context, id string) (*models.Metric, error) {
	var m models.Metric
	err := s.Pool.QueryRow(ctx, `
		SELECT id, project_id, name, type, evaluator_prompt, description, created_at
		FROM metrics WHERE id = $1
	`, id).Scan(&m.ID, &m.ProjectID, &m.Name, &m.Type, &m.EvaluatorPrompt, &m.Description, &m.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

// RecordMetricEvent inserts an evaluation event for a metric on a trace.
func (s *Store) RecordMetricEvent(ctx context.Context, metricID, traceID, projectID string, passed *bool, score *float64, label *string, metadata *json.RawMessage) (*models.MetricEvent, error) {
	ev := &models.MetricEvent{
		ID:          ids.MetricEvent(),
		MetricID:    metricID,
		TraceID:     traceID,
		Passed:      passed,
		Score:       score,
		Label:       label,
		Metadata:    normalizeJSON(metadata),
		EvaluatedAt: time.Now().UTC(),
	}
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO metric_events (id, metric_id, trace_id, project_id, passed, score, label, metadata, evaluated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, ev.ID, ev.MetricID, traceID, projectID, ev.Passed, ev.Score, ev.Label, ev.Metadata, ev.EvaluatedAt)
	if err != nil {
		return nil, err
	}
	return ev, nil
}

// ListMetricEvents returns the most recent events for a given metric.
func (s *Store) ListMetricEvents(ctx context.Context, metricID string, limit int) ([]models.MetricEvent, error) {
	if limit <= 0 || limit > 500 {
		limit = 50
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT me.id, me.metric_id, m.name, me.trace_id, me.passed, me.score, me.label, me.metadata, me.evaluated_at
		FROM metric_events me
		JOIN metrics m ON m.id = me.metric_id
		WHERE me.metric_id = $1
		ORDER BY me.evaluated_at DESC
		LIMIT $2
	`, metricID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.MetricEvent
	for rows.Next() {
		var ev models.MetricEvent
		if err := rows.Scan(&ev.ID, &ev.MetricID, &ev.MetricName, &ev.TraceID, &ev.Passed, &ev.Score, &ev.Label, &ev.Metadata, &ev.EvaluatedAt); err != nil {
			return nil, err
		}
		out = append(out, ev)
	}
	return out, rows.Err()
}

// GetMetricEventsForTrace returns all metric events attached to a trace.
func (s *Store) GetMetricEventsForTrace(ctx context.Context, traceID string) ([]models.MetricEvent, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT me.id, me.metric_id, m.name, me.trace_id, me.passed, me.score, me.label, me.metadata, me.evaluated_at
		FROM metric_events me
		JOIN metrics m ON m.id = me.metric_id
		WHERE me.trace_id = $1
		ORDER BY me.evaluated_at DESC
	`, traceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.MetricEvent
	for rows.Next() {
		var ev models.MetricEvent
		if err := rows.Scan(&ev.ID, &ev.MetricID, &ev.MetricName, &ev.TraceID, &ev.Passed, &ev.Score, &ev.Label, &ev.Metadata, &ev.EvaluatedAt); err != nil {
			return nil, err
		}
		out = append(out, ev)
	}
	return out, rows.Err()
}

func normalizeJSON(raw *json.RawMessage) json.RawMessage {
	if raw == nil {
		return nil
	}
	if len(*raw) == 0 {
		return nil
	}
	out := make(json.RawMessage, len(*raw))
	copy(out, *raw)
	return out
}
