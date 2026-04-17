package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/go-chi/chi/v5"
	"github.com/theagi/theta-observability/api-go/internal/auth"
	"github.com/theagi/theta-observability/api-go/internal/models"
	"github.com/theagi/theta-observability/api-go/internal/store"
)

type Webhooks struct {
	Store *store.Store
}

func (h *Webhooks) List(w http.ResponseWriter, r *http.Request) {
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
	items, err := h.Store.ListWebhooks(r.Context(), projectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Webhooks) Create(w http.ResponseWriter, r *http.Request) {
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

	var req models.CreateWebhookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.URL == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "url required")
		return
	}
	if _, err := url.ParseRequestURI(req.URL); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "url must be a valid absolute URL")
		return
	}
	active := true
	if req.Active != nil {
		active = *req.Active
	}
	created, err := h.Store.CreateWebhook(
		r.Context(),
		projectID,
		req.URL,
		req.Events,
		active,
		uc.UserID,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (h *Webhooks) Patch(w http.ResponseWriter, r *http.Request) {
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

	var req models.UpdateWebhookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	webhookID := chi.URLParam(r, "webhook_id")
	eventsProvided := req.Events != nil
	if req.URL == nil && !eventsProvided && req.Active == nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "at least one field must be provided")
		return
	}
	if req.URL != nil {
		if _, err := url.ParseRequestURI(*req.URL); err != nil {
			writeErr(w, http.StatusBadRequest, "bad_request", "url must be a valid absolute URL")
			return
		}
	}
	updated, err := h.Store.UpdateWebhook(
		r.Context(),
		projectID,
		webhookID,
		req.URL,
		req.Events,
		eventsProvided,
		req.Active,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if updated == nil {
		writeErr(w, http.StatusNotFound, "not_found", "webhook not found")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *Webhooks) Delete(w http.ResponseWriter, r *http.Request) {
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
	webhookID := chi.URLParam(r, "webhook_id")
	if err := h.Store.DeleteWebhook(r.Context(), projectID, webhookID); err != nil {
		writeErr(w, http.StatusNotFound, "not_found", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}
