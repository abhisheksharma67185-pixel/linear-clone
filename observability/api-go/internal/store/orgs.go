package store

import (
	"context"
	"errors"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ids"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/jackc/pgx/v5"
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

// GetOrg fetches a single org by ID.
func (s *Store) GetOrg(ctx context.Context, id string) (*models.Org, error) {
	var org models.Org
	err := s.Pool.QueryRow(ctx, `
		SELECT id, name, slug, plan, created_at
		FROM orgs
		WHERE id = $1
	`, id).Scan(&org.ID, &org.Name, &org.Slug, &org.Plan, &org.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &org, nil
}

// GetOrgByStripeCustomerID looks up the org bound to a Stripe customer.
func (s *Store) GetOrgByStripeCustomerID(ctx context.Context, customerID string) (*models.Org, error) {
	var org models.Org
	err := s.Pool.QueryRow(ctx, `
		SELECT id, name, slug, plan, created_at
		FROM orgs
		WHERE stripe_customer_id = $1
	`, customerID).Scan(&org.ID, &org.Name, &org.Slug, &org.Plan, &org.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &org, nil
}

// SetOrgStripeCustomer stores the Stripe customer mapping for an org.
func (s *Store) SetOrgStripeCustomer(ctx context.Context, orgID, customerID string) error {
	if customerID == "" {
		return nil
	}
	_, err := s.Pool.Exec(ctx, `
		UPDATE orgs
		SET stripe_customer_id = $2,
		    updated_at = NOW()
		WHERE id = $1
	`, orgID, customerID)
	return err
}

// UpdateOrgSubscription stores the latest Stripe subscription state for an org.
func (s *Store) UpdateOrgSubscription(
	ctx context.Context,
	orgID, customerID, subscriptionID string,
	plan *string,
) error {
	_, err := s.Pool.Exec(ctx, `
		UPDATE orgs
		SET stripe_customer_id = COALESCE(NULLIF($2, ''), stripe_customer_id),
		    stripe_subscription_id = $3,
		    plan = COALESCE($4, plan),
		    updated_at = NOW()
		WHERE id = $1
	`, orgID, customerID, subscriptionID, plan)
	return err
}

// ClearOrgSubscription removes the active subscription binding for an org.
func (s *Store) ClearOrgSubscription(ctx context.Context, orgID string, plan *string) error {
	_, err := s.Pool.Exec(ctx, `
		UPDATE orgs
		SET stripe_subscription_id = NULL,
		    plan = COALESCE($2, plan),
		    updated_at = NOW()
		WHERE id = $1
	`, orgID, plan)
	return err
}
