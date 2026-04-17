package store

import (
	"context"
	"encoding/json"
	"time"

	"github.com/theagi/theta-observability/api-go/internal/ids"
	"github.com/theagi/theta-observability/api-go/internal/models"
)

// CreateSavedFilter inserts a new saved filter for a project.
func (s *Store) CreateSavedFilter(
	ctx context.Context,
	projectID, name string,
	description *string,
	filters json.RawMessage,
	color *string,
	isDefault bool,
	createdBy string,
) (*models.SavedFilter, error) {
	sf := &models.SavedFilter{
		ID:        ids.SavedFilter(),
		ProjectID: projectID,
		Name:      name,
		Filters:   filters,
		Color:     color,
		IsDefault: isDefault,
		CreatedAt: time.Now().UTC(),
	}
	if description != nil {
		sf.Description = description
	}
	if createdBy != "" {
		sf.CreatedBy = &createdBy
	}

	_, err := s.Pool.Exec(ctx, `
		INSERT INTO saved_filters (id, project_id, name, description, filters, color, is_default, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
	`, sf.ID, sf.ProjectID, sf.Name, sf.Description, sf.Filters, sf.Color, sf.IsDefault, sf.CreatedBy, sf.CreatedAt)
	if err != nil {
		return nil, err
	}
	return sf, nil
}

// ListSavedFilters returns all saved filters for a project, ordered by creation time.
func (s *Store) ListSavedFilters(ctx context.Context, projectID string) ([]models.SavedFilter, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT id, project_id, name, description, filters, color, is_default, created_by, created_at
		FROM saved_filters
		WHERE project_id = $1
		ORDER BY created_at ASC
	`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.SavedFilter
	for rows.Next() {
		var sf models.SavedFilter
		if err := rows.Scan(
			&sf.ID, &sf.ProjectID, &sf.Name, &sf.Description,
			&sf.Filters, &sf.Color, &sf.IsDefault, &sf.CreatedBy, &sf.CreatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, sf)
	}
	return out, rows.Err()
}

// UpdateSavedFilter patches a saved filter by ID.
func (s *Store) UpdateSavedFilter(
	ctx context.Context,
	filterID string,
	name *string,
	description *string,
	filters *json.RawMessage,
	color *string,
	isDefault *bool,
) (*models.SavedFilter, error) {
	// Build dynamic SET clauses.
	setClauses := "updated_at = now()"
	args := []any{}
	argIdx := 1

	if name != nil {
		setClauses += ", name = $" + itoa(argIdx)
		args = append(args, *name)
		argIdx++
	}
	if description != nil {
		setClauses += ", description = $" + itoa(argIdx)
		args = append(args, *description)
		argIdx++
	}
	if filters != nil {
		setClauses += ", filters = $" + itoa(argIdx)
		args = append(args, *filters)
		argIdx++
	}
	if color != nil {
		setClauses += ", color = $" + itoa(argIdx)
		args = append(args, *color)
		argIdx++
	}
	if isDefault != nil {
		setClauses += ", is_default = $" + itoa(argIdx)
		args = append(args, *isDefault)
		argIdx++
	}

	args = append(args, filterID)

	var sf models.SavedFilter
	err := s.Pool.QueryRow(ctx, `
		UPDATE saved_filters SET `+setClauses+`
		WHERE id = $`+itoa(argIdx)+`
		RETURNING id, project_id, name, description, filters, color, is_default, created_by, created_at
	`, args...).Scan(
		&sf.ID, &sf.ProjectID, &sf.Name, &sf.Description,
		&sf.Filters, &sf.Color, &sf.IsDefault, &sf.CreatedBy, &sf.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &sf, nil
}

// DeleteSavedFilter removes a saved filter by ID.
func (s *Store) DeleteSavedFilter(ctx context.Context, filterID string) error {
	_, err := s.Pool.Exec(ctx, `DELETE FROM saved_filters WHERE id = $1`, filterID)
	return err
}

// GetSavedFilter returns a single saved filter by ID.
func (s *Store) GetSavedFilter(ctx context.Context, filterID string) (*models.SavedFilter, error) {
	var sf models.SavedFilter
	err := s.Pool.QueryRow(ctx, `
		SELECT id, project_id, name, description, filters, color, is_default, created_by, created_at
		FROM saved_filters WHERE id = $1
	`, filterID).Scan(
		&sf.ID, &sf.ProjectID, &sf.Name, &sf.Description,
		&sf.Filters, &sf.Color, &sf.IsDefault, &sf.CreatedBy, &sf.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &sf, nil
}

// itoa is a tiny helper to avoid importing strconv for positional arg indexing.
func itoa(n int) string {
	if n < 10 {
		return string(rune('0' + n))
	}
	return string(rune('0'+n/10)) + string(rune('0'+n%10))
}
