package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
	"github.com/go-chi/chi/v5"
)

type Monitors struct {
	Store *store.Store
	BQ    *bq.Writer
}

func (h *Monitors) List(w http.ResponseWriter, r *http.Request) {
	project, _, ok := h.authorizedProject(r, w)
	if !ok {
		return
	}
	items, err := h.Store.ListMonitorConfigs(r.Context(), project.ID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	enrichMonitorEvaluations(r.Context(), h.BQ, items)
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Monitors) Create(w http.ResponseWriter, r *http.Request) {
	project, uc, ok := h.authorizedProject(r, w)
	if !ok {
		return
	}
	var req models.CreateMonitorConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.Name == "" || req.SignalKey == "" || req.Operator == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "name, signal_key, and operator required")
		return
	}
	windowMinutes := 5
	if req.WindowMinutes != nil && *req.WindowMinutes > 0 {
		windowMinutes = *req.WindowMinutes
	}
	active := true
	if req.Active != nil {
		active = *req.Active
	}
	monitor, err := h.Store.CreateMonitorConfig(
		r.Context(),
		project.ID,
		req.Name,
		req.SignalKey,
		req.Operator,
		req.Description,
		req.WarnThreshold,
		req.CriticalThreshold,
		windowMinutes,
		req.GroupBy,
		req.Filters,
		active,
		uc.UserID,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	monitor.LatestEvaluation = evaluateMonitor(r.Context(), h.BQ, monitor)
	writeJSON(w, http.StatusCreated, monitor)
}

func (h *Monitors) Get(w http.ResponseWriter, r *http.Request) {
	monitor, _, ok := h.authorizedMonitor(r, w)
	if !ok {
		return
	}
	monitor.LatestEvaluation = evaluateMonitor(r.Context(), h.BQ, monitor)
	writeJSON(w, http.StatusOK, monitor)
}

func (h *Monitors) Patch(w http.ResponseWriter, r *http.Request) {
	_, _, ok := h.authorizedMonitor(r, w)
	if !ok {
		return
	}
	var req models.UpdateMonitorConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	monitorID := chi.URLParam(r, "monitor_id")
	updated, err := h.Store.UpdateMonitorConfig(r.Context(), monitorID, req.Name, req.Description, req.SignalKey, req.Operator, req.WarnThreshold, req.CriticalThreshold, req.WindowMinutes, req.GroupBy, req.Filters, req.Active)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if updated == nil {
		writeErr(w, http.StatusNotFound, "not_found", "monitor not found")
		return
	}
	updated.LatestEvaluation = evaluateMonitor(r.Context(), h.BQ, updated)
	writeJSON(w, http.StatusOK, updated)
}

func (h *Monitors) Delete(w http.ResponseWriter, r *http.Request) {
	_, _, ok := h.authorizedMonitor(r, w)
	if !ok {
		return
	}
	if err := h.Store.DeleteMonitorConfig(r.Context(), chi.URLParam(r, "monitor_id")); err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Monitors) authorizedProject(r *http.Request, w http.ResponseWriter) (*models.Project, *auth.UserContext, bool) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return nil, nil, false
	}
	projectID := chi.URLParam(r, "id")
	project, err := h.Store.GetProject(r.Context(), projectID)
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
	return project, uc, true
}

func (h *Monitors) authorizedMonitor(r *http.Request, w http.ResponseWriter) (*models.MonitorConfig, *auth.UserContext, bool) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return nil, nil, false
	}
	monitorID := chi.URLParam(r, "monitor_id")
	monitor, err := h.Store.GetMonitorConfig(r.Context(), monitorID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return nil, nil, false
	}
	if monitor == nil {
		writeErr(w, http.StatusNotFound, "not_found", "monitor not found")
		return nil, nil, false
	}
	project, err := h.Store.GetProject(r.Context(), monitor.ProjectID)
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
	return monitor, uc, true
}
