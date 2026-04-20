package handlers

import (
	"bufio"
	"encoding/json"
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ingest"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

type Steps struct {
	Pipeline *ingest.Pipeline
	BQ       *bq.Writer
}

// POST /v1/traces/:id/steps — accepts either a JSON array or NDJSON (one step
// per line) for streaming SDKs.
func (h *Steps) Append(w http.ResponseWriter, r *http.Request) {
	ac, ok := auth.APIKeyFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "missing api key")
		return
	}
	traceID := chi.URLParam(r, "id")
	if traceID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "trace_id required")
		return
	}

	ct := r.Header.Get("Content-Type")
	steps, err := parseSteps(r.Body, ct)
	if err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	// Stub trace just to reuse buildStepRow via pipeline helpers.
	t := &models.Trace{TraceID: traceID, ProjectID: ac.ProjectID}
	for i := range steps {
		row := ingest.BuildStepRowExported(t, &steps[i])
		h.BQ.Append("steps", row)
	}
	writeJSON(w, http.StatusAccepted, map[string]any{
		"trace_id":     traceID,
		"steps_queued": len(steps),
	})
}

func parseSteps(body io.Reader, contentType string) ([]models.Step, error) {
	lr := io.LimitReader(body, 20<<20)
	if contentType == "application/x-ndjson" || contentType == "application/ndjson" {
		var out []models.Step
		sc := bufio.NewScanner(lr)
		sc.Buffer(make([]byte, 1<<20), 4<<20)
		for sc.Scan() {
			line := sc.Bytes()
			if len(line) == 0 {
				continue
			}
			var s models.Step
			if err := json.Unmarshal(line, &s); err != nil {
				return nil, err
			}
			out = append(out, s)
		}
		return out, sc.Err()
	}
	var arr []models.Step
	if err := json.NewDecoder(lr).Decode(&arr); err != nil {
		return nil, err
	}
	return arr, nil
}
