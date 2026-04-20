package store

import (
	"context"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

// RecordUsage appends a metered usage event.
func (s *Store) RecordUsage(ctx context.Context, orgID, projectID, kind string, quantity int64) error {
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO usage_events (org_id, project_id, kind, quantity, unit, occurred_at)
		VALUES ($1, $2, $3, $4, 'count', NOW())
	`, orgID, projectID, kind, quantity)
	return err
}

// GetUsage aggregates usage for the current billing period.
func (s *Store) GetUsage(ctx context.Context, orgID string, since, until time.Time) (*models.UsageResponse, error) {
	u := &models.UsageResponse{OrgID: orgID, PeriodStart: since, PeriodEnd: until}
	rows, err := s.Pool.Query(ctx, `
		SELECT kind, COALESCE(SUM(quantity), 0)
		FROM usage_events
		WHERE org_id = $1 AND occurred_at >= $2 AND occurred_at < $3
		GROUP BY kind
	`, orgID, since, until)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var kind string
		var quantity float64
		if err := rows.Scan(&kind, &quantity); err != nil {
			return nil, err
		}
		switch kind {
		case "trace.ingested", "step.ingested":
			u.EventsIngested += int64(quantity)
		case "media.bytes_stored":
			u.MediaBytes += int64(quantity)
		case "api.request":
			u.APIRequests += int64(quantity)
		}
	}
	return u, rows.Err()
}

// MarkUsageReported stamps all currently-unreported usage rows for an org.
func (s *Store) MarkUsageReported(ctx context.Context, orgID string) (int64, error) {
	ct, err := s.Pool.Exec(ctx, `
		UPDATE usage_events
		SET stripe_reported_at = NOW()
		WHERE org_id = $1
		  AND stripe_reported_at IS NULL
	`, orgID)
	if err != nil {
		return 0, err
	}
	return ct.RowsAffected(), nil
}
