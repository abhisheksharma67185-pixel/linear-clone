package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/theagi/theta-observability/api-go/internal/auth"
	"github.com/theagi/theta-observability/api-go/internal/models"
	"github.com/theagi/theta-observability/api-go/internal/store"
)

type Auth struct {
	Store *store.Store
}

// POST /v1/signup — public. Creates user + org + owner membership.
func (h *Auth) Signup(w http.ResponseWriter, r *http.Request) {
	var req models.SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if req.Email == "" || req.Password == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "email and password required")
		return
	}
	if existing, _ := h.Store.GetUserByEmail(r.Context(), req.Email); existing != nil {
		writeErr(w, http.StatusConflict, "already_exists", "email already in use")
		return
	}
	u, err := h.Store.CreateUser(r.Context(), req.Email, req.Name, req.Password)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	orgName := req.OrgName
	if orgName == "" {
		orgName = req.Name
		if orgName == "" {
			orgName = req.Email
		}
	}
	org, err := h.Store.CreateOrg(r.Context(), u.ID, orgName, slugify(orgName))
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, models.SignupResponse{
		UserID: u.ID, OrgID: org.ID, Email: u.Email,
	})
}

// POST /v1/orgs — create a new org for the authenticated dashboard user.
func (h *Auth) CreateOrg(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	var req models.CreateOrgRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "name required")
		return
	}
	slug := req.Slug
	if slug == "" {
		slug = slugify(req.Name)
	}
	org, err := h.Store.CreateOrg(r.Context(), uc.UserID, req.Name, slug)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, org)
}

// GET /v1/orgs — list the caller's orgs.
func (h *Auth) ListOrgs(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	orgs, err := h.Store.ListOrgsForUser(r.Context(), uc.UserID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": orgs})
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	var b strings.Builder
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
		case r == ' ', r == '-', r == '_':
			b.WriteRune('-')
		}
	}
	out := b.String()
	for strings.Contains(out, "--") {
		out = strings.ReplaceAll(out, "--", "-")
	}
	return strings.Trim(out, "-")
}
