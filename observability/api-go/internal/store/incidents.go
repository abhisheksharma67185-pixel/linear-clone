package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/theagi/theta-observability/api-go/internal/ids"
	"github.com/theagi/theta-observability/api-go/internal/models"
)

// CreateIncident inserts a new incident with initial linked traces.
func (s *Store) CreateIncident(ctx context.Context, projectID, title, errorPattern string, traceIDs []string) (*models.Incident, error) {
	now := time.Now().UTC()
	inc := &models.Incident{
		ID:           ids.Incident(),
		ProjectID:    projectID,
		Title:        title,
		Status:       "open",
		Severity:     "medium",
		ErrorPattern: errorPattern,
		FirstSeenAt:  now,
		LastSeenAt:   now,
		TraceCount:   len(traceIDs),
		CreatedAt:    now,
	}

	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	_, err = tx.Exec(ctx, `
		INSERT INTO incidents (id, project_id, title, status, severity, error_pattern,
		                       first_seen_at, last_seen_at, trace_count, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
	`, inc.ID, inc.ProjectID, inc.Title, inc.Status, inc.Severity, inc.ErrorPattern,
		inc.FirstSeenAt, inc.LastSeenAt, inc.TraceCount, inc.CreatedAt)
	if err != nil {
		return nil, err
	}

	for _, tid := range traceIDs {
		_, err = tx.Exec(ctx, `
			INSERT INTO incident_traces (incident_id, trace_id) VALUES ($1, $2)
			ON CONFLICT DO NOTHING
		`, inc.ID, tid)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	inc.TraceIDs = traceIDs
	return inc, nil
}

// ListIncidents returns incidents for a project, optionally filtered by status.
func (s *Store) ListIncidents(ctx context.Context, projectID, status string, limit int) ([]models.Incident, error) {
	if limit <= 0 || limit > 200 {
		limit = 20
	}
	query := `
		SELECT id, project_id, title, summary, status, root_cause, severity,
		       error_pattern, first_seen_at, last_seen_at, trace_count, created_at
		FROM incidents
		WHERE project_id = $1
	`
	args := []any{projectID}

	if status != "" {
		query += ` AND status = $2`
		args = append(args, status)
	}
	query += ` ORDER BY last_seen_at DESC LIMIT ` + pgIntParam(len(args)+1)
	args = append(args, limit)

	rows, err := s.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Incident
	for rows.Next() {
		var inc models.Incident
		var summary, rootCause, errorPattern *string
		if err := rows.Scan(
			&inc.ID, &inc.ProjectID, &inc.Title, &summary, &inc.Status,
			&rootCause, &inc.Severity, &errorPattern,
			&inc.FirstSeenAt, &inc.LastSeenAt, &inc.TraceCount, &inc.CreatedAt,
		); err != nil {
			return nil, err
		}
		if summary != nil {
			inc.Summary = *summary
		}
		inc.RootCause = rootCause
		if errorPattern != nil {
			inc.ErrorPattern = *errorPattern
		}
		out = append(out, inc)
	}
	return out, rows.Err()
}

// GetIncident fetches a single incident by ID.
func (s *Store) GetIncident(ctx context.Context, incidentID string) (*models.Incident, error) {
	var inc models.Incident
	var summary, rootCause, errorPattern *string
	err := s.Pool.QueryRow(ctx, `
		SELECT id, project_id, title, summary, status, root_cause, severity,
		       error_pattern, first_seen_at, last_seen_at, trace_count, created_at
		FROM incidents WHERE id = $1
	`, incidentID).Scan(
		&inc.ID, &inc.ProjectID, &inc.Title, &summary, &inc.Status,
		&rootCause, &inc.Severity, &errorPattern,
		&inc.FirstSeenAt, &inc.LastSeenAt, &inc.TraceCount, &inc.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if summary != nil {
		inc.Summary = *summary
	}
	inc.RootCause = rootCause
	if errorPattern != nil {
		inc.ErrorPattern = *errorPattern
	}
	return &inc, nil
}

// UpdateIncidentStatus sets the status and updated_at timestamp.
func (s *Store) UpdateIncidentStatus(ctx context.Context, incidentID, status string) error {
	_, err := s.Pool.Exec(ctx, `
		UPDATE incidents SET status = $2, updated_at = now() WHERE id = $1
	`, incidentID, status)
	return err
}

// UpdateIncidentRootCause sets the root_cause analysis text.
func (s *Store) UpdateIncidentRootCause(ctx context.Context, incidentID, rootCause string) error {
	_, err := s.Pool.Exec(ctx, `
		UPDATE incidents SET root_cause = $2, updated_at = now() WHERE id = $1
	`, incidentID, rootCause)
	return err
}

// AddTracesToIncident links additional trace IDs and updates counters.
func (s *Store) AddTracesToIncident(ctx context.Context, incidentID string, traceIDs []string) error {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	for _, tid := range traceIDs {
		_, err = tx.Exec(ctx, `
			INSERT INTO incident_traces (incident_id, trace_id) VALUES ($1, $2)
			ON CONFLICT DO NOTHING
		`, incidentID, tid)
		if err != nil {
			return err
		}
	}

	_, err = tx.Exec(ctx, `
		UPDATE incidents SET
			trace_count = (SELECT count(*) FROM incident_traces WHERE incident_id = $1),
			last_seen_at = now(),
			updated_at = now()
		WHERE id = $1
	`, incidentID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// ListIncidentTraces returns the trace IDs linked to an incident.
func (s *Store) ListIncidentTraces(ctx context.Context, incidentID string) ([]string, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT trace_id FROM incident_traces WHERE incident_id = $1 ORDER BY added_at DESC
	`, incidentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []string
	for rows.Next() {
		var tid string
		if err := rows.Scan(&tid); err != nil {
			return nil, err
		}
		out = append(out, tid)
	}
	return out, rows.Err()
}

// FindIncidentByPattern looks up an open incident with the same error pattern.
func (s *Store) FindIncidentByPattern(ctx context.Context, projectID, errorPattern string) (*models.Incident, error) {
	var inc models.Incident
	var summary, rootCause, ep *string
	err := s.Pool.QueryRow(ctx, `
		SELECT id, project_id, title, summary, status, root_cause, severity,
		       error_pattern, first_seen_at, last_seen_at, trace_count, created_at
		FROM incidents
		WHERE project_id = $1 AND error_pattern = $2
		  AND status IN ('open','investigating')
		ORDER BY created_at DESC LIMIT 1
	`, projectID, errorPattern).Scan(
		&inc.ID, &inc.ProjectID, &inc.Title, &summary, &inc.Status,
		&rootCause, &inc.Severity, &ep,
		&inc.FirstSeenAt, &inc.LastSeenAt, &inc.TraceCount, &inc.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if summary != nil {
		inc.Summary = *summary
	}
	inc.RootCause = rootCause
	if ep != nil {
		inc.ErrorPattern = *ep
	}
	return &inc, nil
}

// pgIntParam returns a positional parameter string like "$3".
func pgIntParam(n int) string {
	return "$" + intToStr(n)
}

func intToStr(n int) string {
	if n < 10 {
		return string(rune('0' + n))
	}
	return intToStr(n/10) + string(rune('0'+n%10))
}
