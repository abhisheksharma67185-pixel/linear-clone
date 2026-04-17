package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/theagi/theta-observability/api-go/internal/clusters"
	"github.com/theagi/theta-observability/api-go/internal/models"
	"github.com/theagi/theta-observability/api-go/internal/store"
)

// Clusters handles cluster discovery and retrieval endpoints.
type Clusters struct {
	Store      *store.Store
	Discoverer *clusters.Discoverer
	Log        *slog.Logger
}

// GET /v1/clusters?project_id=...&limit=20 — list clusters sorted by trace_count desc.
func (h *Clusters) List(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "project_id required")
		return
	}
	limit := 20
	if s := r.URL.Query().Get("limit"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			limit = n
		}
	}

	items, err := h.Store.ListClusters(r.Context(), projectID, limit)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

// GET /v1/clusters/{id} — get cluster detail + trace list.
func (h *Clusters) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	c, err := h.Store.GetCluster(r.Context(), id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	if c == nil {
		writeErr(w, http.StatusNotFound, "not_found", "cluster not found")
		return
	}
	traces, err := h.Store.ListClusterTraces(r.Context(), id, 100)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	c.Traces = traces
	writeJSON(w, http.StatusOK, c)
}

// POST /v1/clusters/discover — manually trigger discovery.
func (h *Clusters) Discover(w http.ResponseWriter, r *http.Request) {
	var req models.DiscoverRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.ProjectID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "project_id required")
		return
	}
	if err := h.Discoverer.DiscoverClusters(r.Context(), req.ProjectID); err != nil {
		h.Log.Error("cluster discovery failed", "project", req.ProjectID, "err", err)
		writeErr(w, http.StatusInternalServerError, "discovery_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
