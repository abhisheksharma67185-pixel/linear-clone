package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ids"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

func defaultWebhookEvents(events []string) []string {
	if len(events) == 0 {
		return []string{"trace.created", "trace.errored"}
	}
	return events
}

func (s *Store) CreateWebhook(
	ctx context.Context,
	projectID, url string,
	events []string,
	active bool,
	createdBy string,
) (*models.CreateWebhookResponse, error) {
	secretSuffix, err := ids.RawSecret(32)
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	wh := &models.Webhook{
		ID:        ids.Webhook(),
		ProjectID: projectID,
		URL:       url,
		Events:    defaultWebhookEvents(events),
		Active:    active,
		CreatedAt: now,
	}
	secret := "whsec_" + secretSuffix
	_, err = s.Pool.Exec(ctx, `
		INSERT INTO webhooks (id, project_id, url, secret, events, active, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
	`, wh.ID, wh.ProjectID, wh.URL, secret, wh.Events, wh.Active, createdBy, wh.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &models.CreateWebhookResponse{
		Webhook: *wh,
		Secret:  secret,
	}, nil
}

func (s *Store) ListWebhooks(ctx context.Context, projectID string) ([]models.Webhook, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT id, project_id, url, events, active, last_delivery_at, last_delivery_status, created_at
		FROM webhooks
		WHERE project_id = $1
		ORDER BY created_at DESC
	`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Webhook
	for rows.Next() {
		var wh models.Webhook
		if err := rows.Scan(
			&wh.ID,
			&wh.ProjectID,
			&wh.URL,
			&wh.Events,
			&wh.Active,
			&wh.LastDeliveryAt,
			&wh.LastDeliveryStatus,
			&wh.CreatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, wh)
	}
	return out, rows.Err()
}

func (s *Store) UpdateWebhook(
	ctx context.Context,
	projectID, webhookID string,
	url *string,
	events []string,
	eventsProvided bool,
	active *bool,
) (*models.Webhook, error) {
	var eventsArg any
	if eventsProvided {
		eventsArg = defaultWebhookEvents(events)
	}
	var wh models.Webhook
	err := s.Pool.QueryRow(ctx, `
		UPDATE webhooks
		SET url = COALESCE($3, url),
		    events = COALESCE($4, events),
		    active = COALESCE($5, active),
		    updated_at = NOW()
		WHERE project_id = $1 AND id = $2
		RETURNING id, project_id, url, events, active, last_delivery_at, last_delivery_status, created_at
	`, projectID, webhookID, url, eventsArg, active).Scan(
		&wh.ID,
		&wh.ProjectID,
		&wh.URL,
		&wh.Events,
		&wh.Active,
		&wh.LastDeliveryAt,
		&wh.LastDeliveryStatus,
		&wh.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &wh, nil
}

func (s *Store) DeleteWebhook(ctx context.Context, projectID, webhookID string) error {
	ct, err := s.Pool.Exec(ctx, `
		DELETE FROM webhooks WHERE project_id = $1 AND id = $2
	`, projectID, webhookID)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return errors.New("not found")
	}
	return nil
}
