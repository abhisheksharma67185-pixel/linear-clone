package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

type Threads struct {
	Store *store.Store
}

func (h *Threads) List(w http.ResponseWriter, r *http.Request) {
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
	limit := 100
	if raw := r.URL.Query().Get("limit"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			limit = parsed
		}
	}
	items, err := h.Store.ListConversationThreads(r.Context(), projectID, limit)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Threads) Create(w http.ResponseWriter, r *http.Request) {
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

	var req models.CreateConversationThreadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.Title == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "title required")
		return
	}
	thread, err := h.Store.CreateConversationThread(r.Context(), projectID, req.Title, req.ExternalID, req.UserID, req.SessionID, req.Metadata, req.TraceIDs, uc.UserID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, thread)
}

func (h *Threads) Get(w http.ResponseWriter, r *http.Request) {
	thread, uc, ok := h.authorizedThread(r, w)
	if !ok {
		return
	}
	if !contains(uc.Orgs, thread.ProjectID) {
		// no-op; project org access already checked in authorizedThread
	}
	writeJSON(w, http.StatusOK, thread)
}

func (h *Threads) Patch(w http.ResponseWriter, r *http.Request) {
	_, _, ok := h.authorizedThread(r, w)
	if !ok {
		return
	}
	var req models.UpdateConversationThreadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	threadID := chi.URLParam(r, "thread_id")
	updated, err := h.Store.UpdateConversationThread(r.Context(), threadID, req.Title, req.ExternalID, req.UserID, req.SessionID, req.Metadata, req.TraceIDs)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if updated == nil {
		writeErr(w, http.StatusNotFound, "not_found", "thread not found")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *Threads) Delete(w http.ResponseWriter, r *http.Request) {
	_, _, ok := h.authorizedThread(r, w)
	if !ok {
		return
	}
	if err := h.Store.DeleteConversationThread(r.Context(), chi.URLParam(r, "thread_id")); err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Threads) authorizedThread(r *http.Request, w http.ResponseWriter) (*models.ConversationThread, *auth.UserContext, bool) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return nil, nil, false
	}
	threadID := chi.URLParam(r, "thread_id")
	thread, err := h.Store.GetConversationThread(r.Context(), threadID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return nil, nil, false
	}
	if thread == nil {
		writeErr(w, http.StatusNotFound, "not_found", "thread not found")
		return nil, nil, false
	}
	project, err := h.Store.GetProject(r.Context(), thread.ProjectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return nil, nil, false
	}
	if project == nil {
		writeErr(w, http.StatusNotFound, "not_found", "project not found")
		return nil, nil, false
	}
	if !contains(uc.Orgs, project.OrgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member of org")
		return nil, nil, false
	}
	return thread, uc, true
}
