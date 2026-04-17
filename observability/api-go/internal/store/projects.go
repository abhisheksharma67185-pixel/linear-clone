package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/theagi/theta-observability/api-go/internal/ids"
	"github.com/theagi/theta-observability/api-go/internal/models"
)

// CreateProject inserts a project scoped to an org.
func (s *Store) CreateProject(ctx context.Context, orgID, name, slug string, description *string, createdBy string) (*models.Project, error) {
	p := &models.Project{
		ID:            ids.Project(),
		OrgID:         orgID,
		Name:          name,
		Slug:          slug,
		Description:   description,
		RetentionDays: 30,
		CreatedAt:     time.Now().UTC(),
	}
	err := s.Pool.QueryRow(ctx, `
		INSERT INTO projects (id, org_id, name, slug, description, retention_days, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, DEFAULT, $6, $7, $7)
		RETURNING description, retention_days
	`, p.ID, p.OrgID, p.Name, p.Slug, p.Description, createdBy, p.CreatedAt).Scan(&p.Description, &p.RetentionDays)
	if err != nil {
		return nil, err
	}
	return p, nil
}

// ListProjects returns projects in an org.
func (s *Store) ListProjects(ctx context.Context, orgID string) ([]models.Project, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT id, org_id, name, slug, description, retention_days, created_at
		FROM projects WHERE org_id = $1 ORDER BY created_at DESC
	`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Project
	for rows.Next() {
		var p models.Project
		if err := rows.Scan(&p.ID, &p.OrgID, &p.Name, &p.Slug, &p.Description, &p.RetentionDays, &p.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

// GetProject fetches by ID.
func (s *Store) GetProject(ctx context.Context, id string) (*models.Project, error) {
	var p models.Project
	err := s.Pool.QueryRow(ctx, `
		SELECT id, org_id, name, slug, description, retention_days, created_at
		FROM projects WHERE id = $1
	`, id).Scan(&p.ID, &p.OrgID, &p.Name, &p.Slug, &p.Description, &p.RetentionDays, &p.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// UpdateProject applies a partial update to a project and returns the updated row.
func (s *Store) UpdateProject(
	ctx context.Context,
	id string,
	name, slug, description *string,
	retentionDays *int,
) (*models.Project, error) {
	var p models.Project
	err := s.Pool.QueryRow(ctx, `
		UPDATE projects
		SET name = COALESCE($2, name),
		    slug = COALESCE($3, slug),
		    description = COALESCE($4, description),
		    retention_days = COALESCE($5, retention_days),
		    updated_at = NOW()
		WHERE id = $1
		RETURNING id, org_id, name, slug, description, retention_days, created_at
	`, id, name, slug, description, retentionDays).Scan(
		&p.ID,
		&p.OrgID,
		&p.Name,
		&p.Slug,
		&p.Description,
		&p.RetentionDays,
		&p.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}
