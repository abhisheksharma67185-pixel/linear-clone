package store

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ids"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

// ListMembers returns members of an org joined with user emails.
func (s *Store) ListMembers(ctx context.Context, orgID string) ([]models.Member, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT m.org_id, m.user_id, u.email, m.role
		FROM org_members m
		JOIN users u ON u.id = m.user_id
		WHERE m.org_id = $1
		ORDER BY m.created_at ASC
	`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Member
	for rows.Next() {
		var m models.Member
		if err := rows.Scan(&m.OrgID, &m.UserID, &m.Email, &m.Role); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

// GetRole returns the role of a user within an org, or "" if not a member.
func (s *Store) GetRole(ctx context.Context, orgID, userID string) (string, error) {
	var role string
	err := s.Pool.QueryRow(ctx,
		`SELECT role FROM org_members WHERE org_id = $1 AND user_id = $2`,
		orgID, userID,
	).Scan(&role)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", nil
	}
	return role, err
}

// CreateInvite generates a random invite token and returns the invite row.
func (s *Store) CreateInvite(ctx context.Context, orgID, email, role string) (*models.Invite, error) {
	tok := make([]byte, 24)
	if _, err := rand.Read(tok); err != nil {
		return nil, err
	}
	inv := &models.Invite{
		ID:        ids.Invite(),
		OrgID:     orgID,
		Email:     email,
		Role:      role,
		Token:     hex.EncodeToString(tok),
		CreatedAt: time.Now().UTC(),
	}
	_, err := s.Pool.Exec(ctx, `
		INSERT INTO invites (id, org_id, email, role, token, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, inv.ID, inv.OrgID, inv.Email, inv.Role, inv.Token, inv.CreatedAt)
	if err != nil {
		return nil, err
	}
	return inv, nil
}

// AcceptInvite turns an invite token into an org_members row.
func (s *Store) AcceptInvite(ctx context.Context, token, userID string) (*models.Member, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)
	var orgID, email, role string
	err = tx.QueryRow(ctx,
		`SELECT org_id, email, role FROM invites WHERE token = $1 AND accepted_at IS NULL`, token,
	).Scan(&orgID, &email, &role)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("invalid or expired invite")
	}
	if err != nil {
		return nil, err
	}
	m := &models.Member{OrgID: orgID, UserID: userID, Email: email, Role: role}
	if _, err := tx.Exec(ctx,
		`INSERT INTO org_members (org_id, user_id, role, created_at) VALUES ($1,$2,$3,NOW())`,
		m.OrgID, m.UserID, m.Role,
	); err != nil {
		return nil, err
	}
	if _, err := tx.Exec(ctx, `UPDATE invites SET accepted_at = NOW() WHERE token = $1`, token); err != nil {
		return nil, err
	}
	return m, tx.Commit(ctx)
}
