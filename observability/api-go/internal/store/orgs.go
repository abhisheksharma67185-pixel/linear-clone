package store

import (
	"context"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ids"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

// CreateOrg creates an org + an owner membership row for the creating user.
func (s *Store) CreateOrg(ctx context.Context, userID, name, slug string) (*models.Org, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	org := &models.Org{
		ID:        ids.Org(),
		Name:      name,
		Slug:      slug,
		Plan:      "free",
		CreatedAt: time.Now().UTC(),
	}
	if err := tx.QueryRow(ctx, `
		INSERT INTO orgs (id, name, slug, plan, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, 'free', $4, $5, $5)
		RETURNING plan
	`, org.ID, org.Name, org.Slug, userID, org.CreatedAt).Scan(&org.Plan); err != nil {
		return nil, err
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO org_members (org_id, user_id, role, created_at)
		VALUES ($1, $2, 'owner', NOW())
	`, org.ID, userID); err != nil {
		return nil, err
	}
	if _, err := tx.Exec(ctx, `
		UPDATE users
		SET default_org_id = COALESCE(default_org_id, $1), updated_at = NOW()
		WHERE id = $2
	`, org.ID, userID); err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return org, nil
}

// ListOrgsForUser returns all orgs a user is a member of.
func (s *Store) ListOrgsForUser(ctx context.Context, userID string) ([]models.Org, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT o.id, o.name, o.slug, o.plan, o.created_at
		FROM orgs o
		JOIN org_members m ON m.org_id = o.id
		WHERE m.user_id = $1
		ORDER BY o.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Org
	for rows.Next() {
		var o models.Org
		if err := rows.Scan(&o.ID, &o.Name, &o.Slug, &o.Plan, &o.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, rows.Err()
}
