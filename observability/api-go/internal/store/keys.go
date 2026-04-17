package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/theagi/theta-observability/api-go/internal/auth"
	"github.com/theagi/theta-observability/api-go/internal/ids"
	"github.com/theagi/theta-observability/api-go/internal/models"
)

// CreateAPIKey generates a plaintext key, stores its argon2id hash plus a
// sha256 fingerprint (for index lookup), and returns the plaintext exactly
// once.
func (s *Store) CreateAPIKey(ctx context.Context, projectID, name string) (*models.CreateAPIKeyResponse, error) {
	plaintext, err := ids.NewAPIKey()
	if err != nil {
		return nil, err
	}
	hash, err := auth.HashPassword(plaintext)
	if err != nil {
		return nil, err
	}
	fp := auth.FingerprintAPIKey(plaintext)
	keyID := ids.Token()
	now := time.Now().UTC()
	// prefix = first 8 chars after tk_ for display
	prefix := plaintext[:minInt(11, len(plaintext))]

	_, err = s.Pool.Exec(ctx, `
		INSERT INTO api_keys (id, project_id, name, prefix, fingerprint, hash, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, keyID, projectID, name, prefix, fp, hash, now)
	if err != nil {
		return nil, err
	}
	return &models.CreateAPIKeyResponse{
		APIKey: models.APIKey{
			ID: keyID, ProjectID: projectID, Name: name,
			Prefix: prefix, CreatedAt: now,
		},
		Plaintext: plaintext,
		Secret:    plaintext,
	}, nil
}

// ListAPIKeys returns non-secret metadata for a project's keys.
func (s *Store) ListAPIKeys(ctx context.Context, projectID string) ([]models.APIKey, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT id, project_id, name, prefix, created_at, revoked_at, last_used_at
		FROM api_keys WHERE project_id = $1 ORDER BY created_at DESC
	`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.APIKey
	for rows.Next() {
		var k models.APIKey
		if err := rows.Scan(&k.ID, &k.ProjectID, &k.Name, &k.Prefix, &k.CreatedAt, &k.RevokedAt, &k.LastUsedAt); err != nil {
			return nil, err
		}
		out = append(out, k)
	}
	return out, rows.Err()
}

// RevokeAPIKey marks a key revoked.
func (s *Store) RevokeAPIKey(ctx context.Context, keyID string) error {
	ct, err := s.Pool.Exec(ctx, `UPDATE api_keys SET revoked_at = NOW() WHERE id = $1`, keyID)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return errors.New("not found")
	}
	return nil
}

// VerifyKey implements auth.KeyVerifier. It uses the sha256 fingerprint for
// a fast indexed lookup, then runs argon2id compare on the candidate row.
func (s *Store) VerifyKey(ctx context.Context, plaintext string) (*auth.APIKeyContext, error) {
	fp := auth.FingerprintAPIKey(plaintext)
	var (
		keyID, projectID, orgID, hash string
		revokedAt                     *time.Time
	)
	err := s.Pool.QueryRow(ctx, `
		SELECT k.id, k.project_id, p.org_id, k.hash, k.revoked_at
		FROM api_keys k
		JOIN projects p ON p.id = k.project_id
		WHERE k.fingerprint = $1
		LIMIT 1
	`, fp).Scan(&keyID, &projectID, &orgID, &hash, &revokedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("not found")
	}
	if err != nil {
		return nil, err
	}
	if revokedAt != nil {
		return nil, fmt.Errorf("revoked")
	}
	if err := auth.VerifyPassword(hash, plaintext); err != nil {
		return nil, err
	}
	// update last_used_at asynchronously — ignore errors.
	go func() {
		_, _ = s.Pool.Exec(context.Background(),
			`UPDATE api_keys SET last_used_at = NOW() WHERE id = $1`, keyID)
	}()
	return &auth.APIKeyContext{
		KeyID: keyID, ProjectID: projectID, OrgID: orgID,
		Scopes: []string{"traces:write", "media:write"},
	}, nil
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
