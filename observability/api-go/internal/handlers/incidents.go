package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/incidents"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

// Incidents handles incident detection and management endpoints.
type Incidents struct {
	Store    *store.Store
	Detector *incidents.Detector
	Log      *slog.Logger
}

// GET /v1/incidents?project_id=...&status=open&limit=20
func (h *Incidents) List(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "project_id required")
		return
	}
	status := r.URL.Query().Get("status")
	limit := 20
	if s := r.URL.Query().Get("limit"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			limit = n
		}
	}

	items, err := h.Store.ListIncidents(r.Context(), projectID, status, limit)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

// GET /v1/incidents/{id}
func (h *Incidents) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "incident id required")
		return
	}

	inc, err := h.Store.GetIncident(r.Context(), id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if inc == nil {
		writeErr(w, http.StatusNotFound, "not_found", "incident not found")
		return
	}

	traceIDs, err := h.Store.ListIncidentTraces(r.Context(), id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	inc.TraceIDs = traceIDs

	writeJSON(w, http.StatusOK, inc)
}

// patchIncidentRequest is the PATCH /v1/incidents/{id} body.
type patchIncidentRequest struct {
	Status string `json:"status"`
}

// validIncidentStatuses are the statuses allowed in a PATCH request.
var validIncidentStatuses = map[string]bool{
	"open":          true,
	"investigating": true,
	"resolved":      true,
	"dismissed":     true,
}

// PATCH /v1/incidents/{id}
func (h *Incidents) Patch(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "incident id required")
		return
	}

	var req patchIncidentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if !validIncidentStatuses[req.Status] {
		writeErr(w, http.StatusBadRequest, "bad_request", "status must be one of: open, investigating, resolved, dismissed")
		return
	}

	inc, err := h.Store.GetIncident(r.Context(), id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if inc == nil {
		writeErr(w, http.StatusNotFound, "not_found", "incident not found")
		return
	}

	if err := h.Store.UpdateIncidentStatus(r.Context(), id, req.Status); err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}

	inc.Status = req.Status
	writeJSON(w, http.StatusOK, inc)
}

// detectRequest is the POST /v1/incidents/detect body.
type detectRequest struct {
	ProjectID string `json:"project_id"`
}

// POST /v1/incidents/detect — manually trigger detection for a project.
func (h *Incidents) Detect(w http.ResponseWriter, r *http.Request) {
	var req detectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.ProjectID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "project_id required")
		return
	}

	if err := h.Detector.DetectIncidents(r.Context(), req.ProjectID); err != nil {
		h.Log.Error("incident detection failed", "err", err, "project_id", req.ProjectID)
		writeErr(w, http.StatusInternalServerError, "detection_failed", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "detection_complete"})
}
