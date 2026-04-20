package store

import (
	"context"
	"fmt"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ids"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

// AnnotationFilters holds optional filters for ListAnnotations.
type AnnotationFilters struct {
	Label          *string
	AnnotationType *string
	UserID         *string
	Since          *time.Time
	Limit          int
}

// CreateAnnotation inserts a new annotation scoped to a trace (and optionally a step).
func (s *Store) CreateAnnotation(ctx context.Context, traceID string, stepID *string, projectID string, label *string, score *float64, comment *string, annotationType string, userID *string) (*models.Annotation, error) {
	a := &models.Annotation{
		ID:             ids.Annotation(),
		TraceID:        traceID,
		StepID:         stepID,
		ProjectID:      projectID,
		Label:          label,
		Score:          score,
		Comment:        comment,
		AnnotationType: annotationType,
		UserID:         userID,
		CreatedAt:      time.Now().UTC(),
	}
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO annotations (id, trace_id, step_id, project_id, label, score, comment, annotation_type, user_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`, a.ID, a.TraceID, a.StepID, a.ProjectID, a.Label, a.Score, a.Comment, a.AnnotationType, a.UserID, a.CreatedAt)
	if err != nil {
		return nil, err
	}
	return a, nil
}

// ListAnnotationsForTrace returns all annotations attached to a trace.
func (s *Store) ListAnnotationsForTrace(ctx context.Context, traceID string) ([]models.Annotation, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT id, trace_id, step_id, project_id, label, score, comment, annotation_type, user_id, created_at
		FROM annotations WHERE trace_id = $1
		ORDER BY created_at DESC
	`, traceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Annotation
	for rows.Next() {
		var a models.Annotation
		if err := rows.Scan(&a.ID, &a.TraceID, &a.StepID, &a.ProjectID, &a.Label, &a.Score, &a.Comment, &a.AnnotationType, &a.UserID, &a.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

// ListAnnotations returns annotations for a project with optional filters.
func (s *Store) ListAnnotations(ctx context.Context, projectID string, filters AnnotationFilters) ([]models.Annotation, error) {
	query := `SELECT id, trace_id, step_id, project_id, label, score, comment, annotation_type, user_id, created_at
		FROM annotations WHERE project_id = $1`
	args := []any{projectID}
	argN := 2

	if filters.Label != nil {
		query += fmt.Sprintf(" AND label = $%d", argN)
		args = append(args, *filters.Label)
		argN++
	}
	if filters.AnnotationType != nil {
		query += fmt.Sprintf(" AND annotation_type = $%d", argN)
		args = append(args, *filters.AnnotationType)
		argN++
	}
	if filters.UserID != nil {
		query += fmt.Sprintf(" AND user_id = $%d", argN)
		args = append(args, *filters.UserID)
		argN++
	}
	if filters.Since != nil {
		query += fmt.Sprintf(" AND created_at >= $%d", argN)
		args = append(args, *filters.Since)
		argN++
	}

	query += " ORDER BY created_at DESC"

	limit := filters.Limit
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	query += fmt.Sprintf(" LIMIT $%d", argN)
	args = append(args, limit)

	rows, err := s.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Annotation
	for rows.Next() {
		var a models.Annotation
		if err := rows.Scan(&a.ID, &a.TraceID, &a.StepID, &a.ProjectID, &a.Label, &a.Score, &a.Comment, &a.AnnotationType, &a.UserID, &a.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

// DeleteAnnotation removes an annotation by ID.
func (s *Store) DeleteAnnotation(ctx context.Context, annotationID string) error {
	_, err := s.Pool.Exec(ctx, `DELETE FROM annotations WHERE id = $1`, annotationID)
	return err
}

// GetAnnotationLabels returns distinct label values for a project (for filter dropdowns).
func (s *Store) GetAnnotationLabels(ctx context.Context, projectID string) ([]string, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT DISTINCT label FROM annotations
		WHERE project_id = $1 AND label IS NOT NULL AND label != ''
		ORDER BY label
	`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []string
	for rows.Next() {
		var l string
		if err := rows.Scan(&l); err != nil {
			return nil, err
		}
		out = append(out, l)
	}
	return out, rows.Err()
}
