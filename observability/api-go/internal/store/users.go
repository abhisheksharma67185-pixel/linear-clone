package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/theagi/theta-observability/api-go/internal/auth"
	"github.com/theagi/theta-observability/api-go/internal/ids"
)

type User struct {
	ID           string
	Email        string
	Name         string
	PasswordHash string
	CreatedAt    time.Time
}

// CreateUser inserts a user row. Password is already argon2id-hashed.
func (s *Store) CreateUser(ctx context.Context, email, name, password string) (*User, error) {
	hash, err := auth.HashPassword(password)
	if err != nil {
		return nil, err
	}
	u := &User{ID: ids.User(), Email: email, Name: name, PasswordHash: hash, CreatedAt: time.Now().UTC()}
	_, err = s.Pool.Exec(ctx, `
		INSERT INTO users (id, email, name, password_hash, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`, u.ID, u.Email, u.Name, u.PasswordHash, u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

// GetUserByEmail looks up a user for password login.
func (s *Store) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	u := &User{}
	err := s.Pool.QueryRow(ctx, `
		SELECT id, email, name, password_hash, created_at
		FROM users WHERE email = $1
	`, email).Scan(&u.ID, &u.Email, &u.Name, &u.PasswordHash, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return u, nil
}
