package handlers

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/embeddings"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

// Search handles full-text + semantic search over traces.
type Search struct {
	Store    *store.Store
	Embedder *embeddings.EmbeddingWorker
	BQ       *bq.Writer
	Log      *slog.Logger
}

// Search handles POST /v1/search.
func (h *Search) Search(w http.ResponseWriter, r *http.Request) {
	var req models.SearchRequest
	if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.Query == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "query is required")
		return
	}
	if req.ProjectID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "project_id is required")
		return
	}
	if req.Limit <= 0 || req.Limit > 100 {
		req.Limit = 50
	}

	// Full-text search via PostgreSQL tsvector.
	hits, err := h.Embedder.SearchTraces(r.Context(), req.Query, req.ProjectID, req.Limit)
	if err != nil {
		h.Log.Error("search failed", "err", err)
		writeErr(w, http.StatusInternalServerError, "search_failed", err.Error())
		return
	}

	// Enrich each hit with trace metadata from BQ.
	results := make([]models.SearchResult, 0, len(hits))
	for _, hit := range hits {
		sr := models.SearchResult{
			TraceID: hit.TraceID,
			Score:   hit.Rank,
		}
		if h.BQ != nil {
			item, _, bqErr := h.BQ.GetTrace(r.Context(), hit.TraceID)
			if bqErr == nil && item != nil {
				sr.Name = item.Name
				sr.Status = item.Status
				sr.UserID = item.UserID
				sr.StartedAt = item.StartedAt.Format("2006-01-02T15:04:05Z")
				sr.Tags = item.Tags
			}
		}
		results = append(results, sr)
	}

	writeJSON(w, http.StatusOK, models.SearchResponse{
		Results: results,
		Query:   req.Query,
	})
}
