package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

// SavedFilters handles CRUD for saved filter presets.
type SavedFilters struct {
	Store *store.Store
}

// GET /v1/projects/{id}/saved-filters — list all saved filters for a project.
func (h *SavedFilters) List(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	projectID := chi.URLParam(r, "id")
	project, err := h.Store.GetProject(r.Context(), projectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if project == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return
	}
	if !contains(uc.Orgs, project.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}

	items, err := h.Store.ListSavedFilters(r.Context(), projectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

// POST /v1/projects/{id}/saved-filters — create a saved filter.
func (h *SavedFilters) Create(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	projectID := chi.URLParam(r, "id")
	project, err := h.Store.GetProject(r.Context(), projectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if project == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return
	}
	if !contains(uc.Orgs, project.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}

	var req models.CreateSavedFilterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.Name == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "name required")
		return
	}
	if len(req.Filters) == 0 {
		writeErr(w, http.StatusBadRequest, "bad_request", "filters required")
		return
	}

	isDefault := false
	if req.IsDefault != nil {
		isDefault = *req.IsDefault
	}

	sf, err := h.Store.CreateSavedFilter(
		r.Context(),
		projectID,
		req.Name,
		req.Description,
		req.Filters,
		req.Color,
		isDefault,
		uc.UserID,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, sf)
}

// PATCH /v1/saved-filters/{id} — update a saved filter.
func (h *SavedFilters) Patch(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	filterID := chi.URLParam(r, "id")

	// Look up the filter to verify org membership.
	existing, err := h.Store.GetSavedFilter(r.Context(), filterID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "not_found", "saved filter not found")
		return
	}
	project, err := h.Store.GetProject(r.Context(), existing.ProjectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if project == nil || !contains(uc.Orgs, project.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}

	var req models.UpdateSavedFilterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.Name == nil && req.Description == nil && req.Filters == nil && req.Color == nil && req.IsDefault == nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "at least one field must be provided")
		return
	}

	updated, err := h.Store.UpdateSavedFilter(
		r.Context(),
		filterID,
		req.Name,
		req.Description,
		req.Filters,
		req.Color,
		req.IsDefault,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

// DELETE /v1/saved-filters/{id} — delete a saved filter.
func (h *SavedFilters) Delete(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	filterID := chi.URLParam(r, "id")

	// Look up the filter to verify org membership.
	existing, err := h.Store.GetSavedFilter(r.Context(), filterID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "not_found", "saved filter not found")
		return
	}
	project, err := h.Store.GetProject(r.Context(), existing.ProjectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if project == nil || !contains(uc.Orgs, project.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}

	if err := h.Store.DeleteSavedFilter(r.Context(), filterID); err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}
