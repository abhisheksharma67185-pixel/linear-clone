package store

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ids"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

func (s *Store) CreateMonitorConfig(
	ctx context.Context,
	projectID, name, signalKey, operator string,
	description *string,
	warnThreshold, criticalThreshold *float64,
	windowMinutes int,
	groupBy *string,
	filters json.RawMessage,
	active bool,
	createdBy string,
) (*models.MonitorConfig, error) {
	monitor := &models.MonitorConfig{
		ID:                ids.Monitor(),
		ProjectID:         projectID,
		Name:              name,
		Description:       description,
		SignalKey:         signalKey,
		Operator:          operator,
		WarnThreshold:     warnThreshold,
		CriticalThreshold: criticalThreshold,
		WindowMinutes:     windowMinutes,
		GroupBy:           groupBy,
		Filters:           normalizedJSON(filters),
		Active:            active,
		CreatedAt:         time.Now().UTC(),
		UpdatedAt:         time.Now().UTC(),
	}
	if createdBy != "" {
		monitor.CreatedBy = &createdBy
	}
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO monitor_configs (id, project_id, name, description, signal_key, operator, warn_threshold, critical_threshold, window_minutes, group_by, filters, active, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`, monitor.ID, monitor.ProjectID, monitor.Name, monitor.Description, monitor.SignalKey, monitor.Operator, monitor.WarnThreshold, monitor.CriticalThreshold, monitor.WindowMinutes, monitor.GroupBy, monitor.Filters, monitor.Active, monitor.CreatedBy, monitor.CreatedAt, monitor.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return monitor, nil
}

func (s *Store) ListMonitorConfigs(ctx context.Context, projectID string) ([]models.MonitorConfig, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT id, project_id, name, description, signal_key, operator, warn_threshold, critical_threshold, window_minutes, group_by, filters, active, created_by, created_at, updated_at
		FROM monitor_configs
		WHERE project_id = $1
		ORDER BY updated_at DESC
	`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.MonitorConfig
	for rows.Next() {
		monitor, err := scanMonitorConfig(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *monitor)
	}
	return out, rows.Err()
}

func (s *Store) GetMonitorConfig(ctx context.Context, monitorID string) (*models.MonitorConfig, error) {
	row := s.Pool.QueryRow(ctx, `
		SELECT id, project_id, name, description, signal_key, operator, warn_threshold, critical_threshold, window_minutes, group_by, filters, active, created_by, created_at, updated_at
		FROM monitor_configs
		WHERE id = $1
	`, monitorID)
	monitor, err := scanMonitorConfig(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return monitor, nil
}

func (s *Store) UpdateMonitorConfig(
	ctx context.Context,
	monitorID string,
	name, description, signalKey, operator *string,
	warnThreshold, criticalThreshold *float64,
	windowMinutes *int,
	groupBy *string,
	filters *json.RawMessage,
	active *bool,
) (*models.MonitorConfig, error) {
	row := s.Pool.QueryRow(ctx, `
		UPDATE monitor_configs
		SET name = COALESCE($2, name),
		    description = COALESCE($3, description),
		    signal_key = COALESCE($4, signal_key),
		    operator = COALESCE($5, operator),
		    warn_threshold = COALESCE($6, warn_threshold),
		    critical_threshold = COALESCE($7, critical_threshold),
		    window_minutes = COALESCE($8, window_minutes),
		    group_by = COALESCE($9, group_by),
		    filters = COALESCE($10, filters),
		    active = COALESCE($11, active),
		    updated_at = now()
		WHERE id = $1
		RETURNING id, project_id, name, description, signal_key, operator, warn_threshold, critical_threshold, window_minutes, group_by, filters, active, created_by, created_at, updated_at
	`, monitorID, name, description, signalKey, operator, warnThreshold, criticalThreshold, windowMinutes, groupBy, normalizedJSONPtr(filters), active)
	monitor, err := scanMonitorConfig(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return monitor, nil
}

func (s *Store) DeleteMonitorConfig(ctx context.Context, monitorID string) error {
	_, err := s.Pool.Exec(ctx, `DELETE FROM monitor_configs WHERE id = $1`, monitorID)
	return err
}

type monitorConfigScanner interface {
	Scan(dest ...any) error
}

func scanMonitorConfig(scanner monitorConfigScanner) (*models.MonitorConfig, error) {
	var monitor models.MonitorConfig
	if err := scanner.Scan(
		&monitor.ID,
		&monitor.ProjectID,
		&monitor.Name,
		&monitor.Description,
		&monitor.SignalKey,
		&monitor.Operator,
		&monitor.WarnThreshold,
		&monitor.CriticalThreshold,
		&monitor.WindowMinutes,
		&monitor.GroupBy,
		&monitor.Filters,
		&monitor.Active,
		&monitor.CreatedBy,
		&monitor.CreatedAt,
		&monitor.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &monitor, nil
}
