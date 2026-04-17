package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/theagi/theta-observability/api-go/internal/auth"
	"github.com/theagi/theta-observability/api-go/internal/store"
)

// Annotations handles annotation CRUD.
type Annotations struct {
	Store *store.Store
}

// createAnnotationRequest is the POST /v1/traces/:id/annotations body.
type createAnnotationRequest struct {
	StepID         *string  `json:"step_id,omitempty"`
	ProjectID      string   `json:"project_id,omitempty"` // optional; resolved from API key if missing
	Label          *string  `json:"label,omitempty"`
	Score          *float64 `json:"score,omitempty"`
	Comment        *string  `json:"comment,omitempty"`
	AnnotationType *string  `json:"annotation_type,omitempty"`
	UserID         *string  `json:"user_id,omitempty"`
}

// POST /v1/traces/{id}/annotations — create an annotation. EitherAuth.
func (h *Annotations) Create(w http.ResponseWriter, r *http.Request) {
	traceID := chi.URLParam(r, "id")
	if traceID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "trace id required")
		return
	}

	var req createAnnotationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}

	// Resolve project_id: prefer body, then API key context.
	projectID := req.ProjectID
	if ac, ok := auth.APIKeyFromContext(r.Context()); ok && projectID == "" {
		projectID = ac.ProjectID
	}
	if projectID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "project_id required (in body or via API key)")
		return
	}

	// If JWT-authed, verify the user has access to the project's org.
	if uc, ok := auth.UserFromContext(r.Context()); ok {
		proj, err := h.Store.GetProject(r.Context(), projectID)
		if err != nil {
			writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
			return
		}
		if proj == nil {
			writeErr(w, http.StatusNotFound, "not_found", "project not found")
			return
		}
		if !contains(uc.Orgs, proj.OrgID) {
			writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
			return
		}
	}

	annType := "manual"
	if req.AnnotationType != nil && *req.AnnotationType != "" {
		annType = *req.AnnotationType
	}

	a, err := h.Store.CreateAnnotation(r.Context(), traceID, req.StepID, projectID, req.Label, req.Score, req.Comment, annType, req.UserID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, a)
}

// GET /v1/traces/{id}/annotations — list annotations for a trace. EitherAuth.
func (h *Annotations) ListForTrace(w http.ResponseWriter, r *http.Request) {
	traceID := chi.URLParam(r, "id")
	if traceID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "trace id required")
		return
	}

	items, err := h.Store.ListAnnotationsForTrace(r.Context(), traceID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

// GET /v1/annotations?project_id=&label=&annotation_type=&user_id=&limit= — list for project. JWT.
func (h *Annotations) List(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "project_id required")
		return
	}

	proj, err := h.Store.GetProject(r.Context(), projectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if proj == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return
	}
	if !contains(uc.Orgs, proj.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}

	filters := store.AnnotationFilters{}
	if v := r.URL.Query().Get("label"); v != "" {
		filters.Label = &v
	}
	if v := r.URL.Query().Get("annotation_type"); v != "" {
		filters.AnnotationType = &v
	}
	if v := r.URL.Query().Get("user_id"); v != "" {
		filters.UserID = &v
	}
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			filters.Limit = n
		}
	}

	items, err := h.Store.ListAnnotations(r.Context(), projectID, filters)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

// DELETE /v1/annotations/{id} — delete an annotation. JWT.
func (h *Annotations) Delete(w http.ResponseWriter, r *http.Request) {
	_, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	annotationID := chi.URLParam(r, "id")
	if annotationID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "annotation id required")
		return
	}
	if err := h.Store.DeleteAnnotation(r.Context(), annotationID); err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// GET /v1/annotations/labels?project_id= — distinct labels for a project. JWT.
func (h *Annotations) Labels(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "project_id required")
		return
	}

	proj, err := h.Store.GetProject(r.Context(), projectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if proj == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return
	}
	if !contains(uc.Orgs, proj.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}

	labels, err := h.Store.GetAnnotationLabels(r.Context(), projectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if labels == nil {
		labels = []string{}
	}
	writeJSON(w, http.StatusOK, map[string]any{"labels": labels})
}
