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

func (s *Store) CreateConversationThread(
	ctx context.Context,
	projectID string,
	title string,
	externalID, userID, sessionID *string,
	metadata json.RawMessage,
	traceIDs []string,
	createdBy string,
) (*models.ConversationThread, error) {
	thread := &models.ConversationThread{
		ID:         ids.Thread(),
		ProjectID:  projectID,
		Title:      title,
		ExternalID: externalID,
		UserID:     userID,
		SessionID:  sessionID,
		Metadata:   normalizedJSON(metadata),
		TraceIDs:   dedupeStrings(traceIDs),
		TraceCount: len(dedupeStrings(traceIDs)),
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}
	if createdBy != "" {
		thread.CreatedBy = &createdBy
	}

	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer rollback(tx, ctx)

	_, err = tx.Exec(ctx, `
		INSERT INTO conversation_threads (id, project_id, title, external_id, user_id, session_id, metadata, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`, thread.ID, thread.ProjectID, thread.Title, thread.ExternalID, thread.UserID, thread.SessionID, thread.Metadata, thread.CreatedBy, thread.CreatedAt, thread.UpdatedAt)
	if err != nil {
		return nil, err
	}
	if err := replaceThreadTraceIDs(ctx, tx, thread.ID, thread.TraceIDs); err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return thread, nil
}

func (s *Store) ListConversationThreads(ctx context.Context, projectID string, limit int) ([]models.ConversationThread, error) {
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT t.id, t.project_id, t.title, t.external_id, t.user_id, t.session_id,
		       t.metadata, t.created_by, t.created_at, t.updated_at,
		       COALESCE(array_agg(tt.trace_id ORDER BY tt.created_at) FILTER (WHERE tt.trace_id IS NOT NULL), '{}') AS trace_ids,
		       COUNT(tt.trace_id) AS trace_count
		FROM conversation_threads t
		LEFT JOIN conversation_thread_traces tt ON tt.thread_id = t.id
		WHERE t.project_id = $1
		GROUP BY t.id
		ORDER BY t.updated_at DESC
		LIMIT $2
	`, projectID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.ConversationThread
	for rows.Next() {
		thread, err := scanConversationThread(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *thread)
	}
	return out, rows.Err()
}

func (s *Store) GetConversationThread(ctx context.Context, threadID string) (*models.ConversationThread, error) {
	row := s.Pool.QueryRow(ctx, `
		SELECT t.id, t.project_id, t.title, t.external_id, t.user_id, t.session_id,
		       t.metadata, t.created_by, t.created_at, t.updated_at,
		       COALESCE(array_agg(tt.trace_id ORDER BY tt.created_at) FILTER (WHERE tt.trace_id IS NOT NULL), '{}') AS trace_ids,
		       COUNT(tt.trace_id) AS trace_count
		FROM conversation_threads t
		LEFT JOIN conversation_thread_traces tt ON tt.thread_id = t.id
		WHERE t.id = $1
		GROUP BY t.id
	`, threadID)
	thread, err := scanConversationThread(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return thread, nil
}

func (s *Store) UpdateConversationThread(
	ctx context.Context,
	threadID string,
	title, externalID, userID, sessionID *string,
	metadata *json.RawMessage,
	traceIDs *[]string,
) (*models.ConversationThread, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer rollback(tx, ctx)

	if _, err := tx.Exec(ctx, `
		UPDATE conversation_threads
		SET title = COALESCE($2, title),
		    external_id = COALESCE($3, external_id),
		    user_id = COALESCE($4, user_id),
		    session_id = COALESCE($5, session_id),
		    metadata = COALESCE($6, metadata),
		    updated_at = now()
		WHERE id = $1
	`, threadID, title, externalID, userID, sessionID, normalizedJSONPtr(metadata)); err != nil {
		return nil, err
	}

	if traceIDs != nil {
		if err := replaceThreadTraceIDs(ctx, tx, threadID, dedupeStrings(*traceIDs)); err != nil {
			return nil, err
		}
	}

	row := tx.QueryRow(ctx, `
		SELECT t.id, t.project_id, t.title, t.external_id, t.user_id, t.session_id,
		       t.metadata, t.created_by, t.created_at, t.updated_at,
		       COALESCE(array_agg(tt.trace_id ORDER BY tt.created_at) FILTER (WHERE tt.trace_id IS NOT NULL), '{}') AS trace_ids,
		       COUNT(tt.trace_id) AS trace_count
		FROM conversation_threads t
		LEFT JOIN conversation_thread_traces tt ON tt.thread_id = t.id
		WHERE t.id = $1
		GROUP BY t.id
	`, threadID)
	thread, err := scanConversationThread(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return thread, nil
}

func (s *Store) DeleteConversationThread(ctx context.Context, threadID string) error {
	_, err := s.Pool.Exec(ctx, `DELETE FROM conversation_threads WHERE id = $1`, threadID)
	return err
}

func replaceThreadTraceIDs(ctx context.Context, tx pgx.Tx, threadID string, traceIDs []string) error {
	if _, err := tx.Exec(ctx, `DELETE FROM conversation_thread_traces WHERE thread_id = $1`, threadID); err != nil {
		return err
	}
	for _, traceID := range dedupeStrings(traceIDs) {
		if _, err := tx.Exec(ctx, `
			INSERT INTO conversation_thread_traces (thread_id, trace_id, created_at)
			VALUES ($1, $2, now())
		`, threadID, traceID); err != nil {
			return err
		}
	}
	return nil
}

type conversationThreadScanner interface {
	Scan(dest ...any) error
}

func scanConversationThread(scanner conversationThreadScanner) (*models.ConversationThread, error) {
	var thread models.ConversationThread
	if err := scanner.Scan(
		&thread.ID,
		&thread.ProjectID,
		&thread.Title,
		&thread.ExternalID,
		&thread.UserID,
		&thread.SessionID,
		&thread.Metadata,
		&thread.CreatedBy,
		&thread.CreatedAt,
		&thread.UpdatedAt,
		&thread.TraceIDs,
		&thread.TraceCount,
	); err != nil {
		return nil, err
	}
	return &thread, nil
}

func rollback(tx pgx.Tx, ctx context.Context) {
	_ = tx.Rollback(ctx)
}

func normalizedJSON(raw json.RawMessage) json.RawMessage {
	if len(raw) == 0 {
		return json.RawMessage("{}")
	}
	return raw
}

func normalizedJSONPtr(raw *json.RawMessage) *json.RawMessage {
	if raw == nil {
		return nil
	}
	normalized := normalizedJSON(*raw)
	return &normalized
}

func dedupeStrings(values []string) []string {
	if len(values) == 0 {
		return nil
	}
	out := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))
	for _, value := range values {
		if value == "" {
			continue
		}
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		out = append(out, value)
	}
	return out
}
