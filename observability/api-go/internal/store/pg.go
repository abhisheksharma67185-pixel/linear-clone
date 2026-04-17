package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Store is a thin wrapper over a pgx pool so callers can share one connection
// pool across all feature-specific files (users, orgs, keys, ...).
type Store struct {
	Pool *pgxpool.Pool
}

// New opens the pool and verifies connectivity.
func New(ctx context.Context, dsn string) (*Store, error) {
	if dsn == "" {
		return nil, fmt.Errorf("DB_URL is empty")
	}
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, fmt.Errorf("pgxpool.New: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("pgx ping: %w", err)
	}
	return &Store{Pool: pool}, nil
}

func (s *Store) Close() { s.Pool.Close() }

// Ping is used by /healthz readiness.
func (s *Store) Ping(ctx context.Context) error { return s.Pool.Ping(ctx) }
