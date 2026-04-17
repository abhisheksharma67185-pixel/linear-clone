package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/theagi/theta-observability/api-go/internal/auth"
	"github.com/theagi/theta-observability/api-go/internal/models"
	"github.com/theagi/theta-observability/api-go/internal/store"
)

type Projects struct {
	Store *store.Store
}

// POST /v1/projects — create a project in an org the user belongs to.
func (h *Projects) Create(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	var req models.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.OrgID == "" || req.Name == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "org_id and name required")
		return
	}
	if req.Slug == "" {
		req.Slug = slugify(req.Name)
	}
	if !contains(uc.Orgs, req.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}
	p, err := h.Store.CreateProject(r.Context(), req.OrgID, req.Name, req.Slug, req.Description, uc.UserID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, p)
}

// GET /v1/projects?org_id=...
func (h *Projects) List(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	orgID := r.URL.Query().Get("org_id")
	if orgID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "org_id required")
		return
	}
	if !contains(uc.Orgs, orgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}
	ps, err := h.Store.ListProjects(r.Context(), orgID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": ps})
}

// GET /v1/projects/:id
func (h *Projects) Get(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	id := chi.URLParam(r, "id")
	p, err := h.Store.GetProject(r.Context(), id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if p == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return
	}
	if !contains(uc.Orgs, p.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}
	writeJSON(w, http.StatusOK, p)
}

// PATCH /v1/projects/:id
func (h *Projects) Patch(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	id := chi.URLParam(r, "id")
	project, err := h.Store.GetProject(r.Context(), id)
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

	var req models.UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.Name == nil && req.Slug == nil && req.Description == nil && req.RetentionDays == nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "at least one field must be provided")
		return
	}
	if req.RetentionDays != nil && *req.RetentionDays <= 0 {
		writeErr(w, http.StatusBadRequest, "bad_request", "retention_days must be greater than 0")
		return
	}
	updated, err := h.Store.UpdateProject(
		r.Context(),
		id,
		req.Name,
		req.Slug,
		req.Description,
		req.RetentionDays,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if updated == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func contains(xs []string, v string) bool {
	for _, x := range xs {
		if x == v {
			return true
		}
	}
	return false
}
