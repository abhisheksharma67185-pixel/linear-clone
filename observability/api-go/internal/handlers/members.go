package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

type Members struct {
	Store *store.Store
}

// GET /v1/orgs/:org_id/members
func (h *Members) List(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	orgID := chi.URLParam(r, "org_id")
	if !contains(uc.Orgs, orgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}
	ms, err := h.Store.ListMembers(r.Context(), orgID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": ms})
}

// POST /v1/invites
func (h *Members) Invite(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	var req models.InviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.OrgID == "" || req.Email == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "org_id and email required")
		return
	}
	if req.Role == "" {
		req.Role = "member"
	}
	if !contains(uc.Orgs, req.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return
	}
	role, err := h.Store.GetRole(r.Context(), req.OrgID, uc.UserID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if role != "owner" && role != "admin" {
		writeErr(w, http.StatusForbidden, "forbidden", "must be owner or admin to invite")
		return
	}
	inv, err := h.Store.CreateInvite(r.Context(), req.OrgID, req.Email, req.Role)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, inv)
}

// POST /v1/invites/accept
func (h *Members) Accept(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	var req struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Token == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "token required")
		return
	}
	m, err := h.Store.AcceptInvite(r.Context(), req.Token, uc.UserID)
	if err != nil {
		writeErr(w, http.StatusBadRequest, "invalid_invite", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, m)
}
