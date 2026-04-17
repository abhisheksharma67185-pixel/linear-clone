package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/theagi/theta-observability/api-go/internal/auth"
	"github.com/theagi/theta-observability/api-go/internal/store"
)

type Keys struct {
	Store *store.Store
}

// POST /v1/projects/:id/keys — create a new API key for the project.
func (h *Keys) Create(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	projectID := chi.URLParam(r, "id")
	p, err := h.Store.GetProject(r.Context(), projectID)
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
	var body struct {
		Name string `json:"name"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if body.Name == "" {
		body.Name = "default"
	}
	k, err := h.Store.CreateAPIKey(r.Context(), projectID, body.Name)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, k)
}

// GET /v1/projects/:id/keys
func (h *Keys) List(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	projectID := chi.URLParam(r, "id")
	p, err := h.Store.GetProject(r.Context(), projectID)
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
	ks, err := h.Store.ListAPIKeys(r.Context(), projectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": ks})
}

// DELETE /v1/projects/:id/keys/:key_id
func (h *Keys) Revoke(w http.ResponseWriter, r *http.Request) {
	_, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	keyID := chi.URLParam(r, "key_id")
	if err := h.Store.RevokeAPIKey(r.Context(), keyID); err != nil {
		writeErr(w, http.StatusNotFound, "not_found", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "revoked"})
}
