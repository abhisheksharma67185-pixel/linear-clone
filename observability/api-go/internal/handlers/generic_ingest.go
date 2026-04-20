package handlers

import (
	"bufio"
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ingest"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

// POST /v1/events — accept a provider-neutral canonical event envelope and
// normalize it into the existing trace ingest pipeline.
func (h *Traces) CreateEvent(w http.ResponseWriter, r *http.Request) {
	ac, ok := auth.APIKeyFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "missing api key context")
		return
	}

	var envelope models.CanonicalEnvelope
	if err := json.NewDecoder(io.LimitReader(r.Body, 10<<20)).Decode(&envelope); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}

	trace, err := ingest.NormalizeCanonicalEnvelope(&envelope, ac.ProjectID)
	if err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}

	resp, err := h.Pipeline.Ingest(r.Context(), ac.OrgID, trace)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "ingest_failed", err.Error())
		return
	}
	if h.Store != nil {
		_ = h.Store.RecordUsage(r.Context(), ac.OrgID, ac.ProjectID, "trace.ingested", 1)
		if len(envelope.Events) > 0 {
			_ = h.Store.RecordUsage(r.Context(), ac.OrgID, ac.ProjectID, "event.ingested", int64(len(envelope.Events)))
		}
	}

	writeJSON(w, http.StatusAccepted, map[string]any{
		"trace_id":      resp.TraceID,
		"ingest_status": resp.IngestStatus,
		"gcs_uri":       resp.GCSURI,
		"normalized":    true,
		"source":        "canonical_event_envelope",
	})
}

// POST /v1/imports/traces — bulk import Theta trace payloads or canonical event
// envelopes as either JSON arrays or NDJSON.
func (h *Traces) Import(w http.ResponseWriter, r *http.Request) {
	ac, ok := auth.APIKeyFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "missing api key context")
		return
	}

	items, err := parseImportItems(r.Body, r.Header.Get("Content-Type"))
	if err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if len(items) == 0 {
		writeErr(w, http.StatusBadRequest, "bad_request", "no import items provided")
		return
	}

	result := models.BulkImportResponse{
		Items: make([]models.BulkImportItemResult, 0, len(items)),
	}
	for i, raw := range items {
		kind := detectImportKind(raw)
		trace, traceID, err := decodeImportItem(raw, kind, ac.ProjectID)
		if err != nil {
			result.Failed++
			result.Items = append(result.Items, models.BulkImportItemResult{
				Index:  i,
				Kind:   kind,
				Status: "rejected",
				Error:  err.Error(),
			})
			continue
		}

		resp, ingestErr := h.Pipeline.Ingest(r.Context(), ac.OrgID, trace)
		if ingestErr != nil {
			result.Failed++
			result.Items = append(result.Items, models.BulkImportItemResult{
				Index:   i,
				Kind:    kind,
				TraceID: traceID,
				Status:  "failed",
				Error:   ingestErr.Error(),
			})
			continue
		}

		result.Accepted++
		result.Items = append(result.Items, models.BulkImportItemResult{
			Index:   i,
			Kind:    kind,
			TraceID: resp.TraceID,
			Status:  "accepted",
		})
	}

	status := http.StatusAccepted
	if result.Failed > 0 {
		status = http.StatusMultiStatus
	}
	writeJSON(w, status, result)
}

func parseImportItems(body io.Reader, contentType string) ([]json.RawMessage, error) {
	limited := io.LimitReader(body, 50<<20)
	if strings.Contains(contentType, "application/x-ndjson") || strings.Contains(contentType, "application/ndjson") {
		scanner := bufio.NewScanner(limited)
		scanner.Buffer(make([]byte, 1<<20), 8<<20)
		var out []json.RawMessage
		for scanner.Scan() {
			line := bytes.TrimSpace(scanner.Bytes())
			if len(line) == 0 {
				continue
			}
			out = append(out, append(json.RawMessage(nil), line...))
		}
		return out, scanner.Err()
	}

	var arr []json.RawMessage
	if err := json.NewDecoder(limited).Decode(&arr); err != nil {
		return nil, err
	}
	return arr, nil
}

func detectImportKind(raw json.RawMessage) string {
	var probe map[string]json.RawMessage
	if err := json.Unmarshal(raw, &probe); err != nil {
		return "unknown"
	}
	if _, ok := probe["events"]; ok {
		return "canonical_envelope"
	}
	if _, ok := probe["steps"]; ok {
		return "trace"
	}
	return "unknown"
}

func decodeImportItem(raw json.RawMessage, kind, projectID string) (*models.Trace, string, error) {
	switch kind {
	case "canonical_envelope":
		var envelope models.CanonicalEnvelope
		if err := json.Unmarshal(raw, &envelope); err != nil {
			return nil, "", err
		}
		trace, err := ingest.NormalizeCanonicalEnvelope(&envelope, projectID)
		if err != nil {
			return nil, envelope.TraceID, err
		}
		return trace, trace.TraceID, nil
	case "trace":
		var trace models.Trace
		if err := json.Unmarshal(raw, &trace); err != nil {
			return nil, "", err
		}
		trace.ProjectID = projectID
		if trace.SchemaVersion == "" {
			trace.SchemaVersion = "1.0"
		}
		return &trace, trace.TraceID, nil
	default:
		return nil, "", errors.New("unsupported import payload: expected trace.steps or canonical events")
	}
}
