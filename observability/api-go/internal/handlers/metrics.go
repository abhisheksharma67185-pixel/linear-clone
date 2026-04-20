package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

// Metrics handles metric definitions and metric events.
type Metrics struct {
	Store *store.Store
}

// createMetricRequest is the POST /v1/metrics body.
type createMetricRequest struct {
	ProjectID       string  `json:"project_id"`
	Name            string  `json:"name"`
	Type            string  `json:"type"`
	EvaluatorPrompt *string `json:"evaluator_prompt,omitempty"`
	Description     *string `json:"description,omitempty"`
}

// recordMetricEventRequest is the POST /v1/metrics/:id/events body.
type recordMetricEventRequest struct {
	TraceID  string           `json:"trace_id"`
	Passed   *bool            `json:"passed,omitempty"`
	Score    *float64         `json:"score,omitempty"`
	Label    *string          `json:"label,omitempty"`
	Metadata *json.RawMessage `json:"metadata,omitempty"`
}

// POST /v1/metrics — create a metric definition.
func (h *Metrics) Create(w http.ResponseWriter, r *http.Request) {
	uc, hasUser := auth.UserFromContext(r.Context())
	ac, hasKey := auth.APIKeyFromContext(r.Context())
	if !hasUser && !hasKey {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	var req createMetricRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.Name == "" || req.Type == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "project_id, name, and type required")
		return
	}
	if req.Type != "automated" && req.Type != "observed" {
		writeErr(w, http.StatusBadRequest, "bad_request", "type must be 'automated' or 'observed'")
		return
	}

	projectID := req.ProjectID
	if hasKey {
		if projectID == "" {
			projectID = ac.ProjectID
		}
		if projectID != ac.ProjectID {
			writeErr(w, http.StatusForbidden, "forbidden", "api key can only create metrics for its own project")
			return
		}
	} else {
		if projectID == "" {
			writeErr(w, http.StatusBadRequest, "bad_request", "project_id, name, and type required")
			return
		}
		// Verify user has access to the project's org.
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

	m, err := h.Store.CreateMetric(r.Context(), projectID, req.Name, req.Type, req.EvaluatorPrompt, req.Description)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, m)
}

// GET /v1/metrics?project_id=...
func (h *Metrics) List(w http.ResponseWriter, r *http.Request) {
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

	items, err := h.Store.ListMetrics(r.Context(), projectID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

// POST /v1/metrics/:id/events — record a metric event. Accepts either JWT
// or API key auth (EitherAuth group).
func (h *Metrics) RecordEvent(w http.ResponseWriter, r *http.Request) {
	idOrName := chi.URLParam(r, "id")

	var req recordMetricEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.TraceID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "trace_id required")
		return
	}

	// Resolve the metric — by ID if it looks like a metric ID, otherwise by
	// name using the project from auth context.
	var metricID, projectID string
	if strings.HasPrefix(idOrName, "met_") {
		m, err := h.Store.GetMetric(r.Context(), idOrName)
		if err != nil {
			writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
			return
		}
		if m == nil {
			writeErr(w, http.StatusNotFound, "not_found", "metric not found")
			return
		}
		metricID = m.ID
		projectID = m.ProjectID
	} else {
		// Treat as metric name — need project_id from auth.
		pid := projectIDFromContext(r)
		if pid == "" {
			writeErr(w, http.StatusBadRequest, "bad_request", "metric name lookup requires project context (use API key auth or metric ID)")
			return
		}
		m, err := h.Store.GetMetricByName(r.Context(), pid, idOrName)
		if err != nil {
			writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
			return
		}
		if m == nil {
			writeErr(w, http.StatusNotFound, "not_found", "metric not found")
			return
		}
		metricID = m.ID
		projectID = m.ProjectID
	}

	ev, err := h.Store.RecordMetricEvent(r.Context(), metricID, req.TraceID, projectID, req.Passed, req.Score, req.Label)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, ev)
}

// GET /v1/metrics/:id/events?limit=50
func (h *Metrics) ListEvents(w http.ResponseWriter, r *http.Request) {
	metricID := chi.URLParam(r, "id")
	limit := 50
	if s := r.URL.Query().Get("limit"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			limit = n
		}
	}

	items, err := h.Store.ListMetricEvents(r.Context(), metricID, limit)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

// GET /v1/traces/:id/metrics — all metric events for a trace.
func (h *Metrics) TraceMetrics(w http.ResponseWriter, r *http.Request) {
	traceID := chi.URLParam(r, "id")

	items, err := h.Store.GetMetricEventsForTrace(r.Context(), traceID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

// projectIDFromContext extracts the project ID from either API key or JWT
// auth context. API key context always carries a project ID; JWT does not.
func projectIDFromContext(r *http.Request) string {
	if ac, ok := auth.APIKeyFromContext(r.Context()); ok {
		return ac.ProjectID
	}
	return ""
}
