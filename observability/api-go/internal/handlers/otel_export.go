package handlers

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/gcs"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

type Exports struct {
	Store *store.Store
	BQ    *bq.Writer
	GCS   *gcs.Client
}

func (h *Exports) ExportOTel(w http.ResponseWriter, r *http.Request) {
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
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 && parsed <= 1000 {
			limit = parsed
		}
	}

	filters := bq.ListFilters{ProjectID: projectID, Limit: limit}
	if sinceRaw := r.URL.Query().Get("since"); sinceRaw != "" {
		if since, err := time.Parse(time.RFC3339, sinceRaw); err == nil {
			filters.Since = since
		}
	}

	items, _, err := h.BQ.ListTraces(r.Context(), filters)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "query_failed", err.Error())
		return
	}

	traces := make([]models.Trace, 0, len(items))
	for _, item := range items {
		trace, err := h.loadTrace(r.Context(), item.TraceID)
		if err != nil {
			writeErr(w, http.StatusInternalServerError, "export_failed", err.Error())
			return
		}
		if trace != nil {
			traces = append(traces, *trace)
		}
	}

	exportBody := buildOTLPJSON(project, traces)
	w.Header().Set("Content-Type", "application/json")
	writeJSON(w, http.StatusOK, exportBody)
}

func (h *Exports) loadTrace(ctx context.Context, traceID string) (*models.Trace, error) {
	_, gcsURI, err := h.BQ.GetTrace(ctx, traceID)
	if err != nil {
		return nil, err
	}
	if gcsURI == "" {
		return nil, nil
	}
	key := trimTraceObjectKey(gcsURI, h.GCS.Bucket())
	reader, err := h.GCS.Get(ctx, key)
	if err != nil {
		return nil, err
	}
	defer reader.Close()
	body, err := io.ReadAll(io.LimitReader(reader, 50<<20))
	if err != nil {
		return nil, err
	}
	var trace models.Trace
	if err := json.Unmarshal(body, &trace); err != nil {
		return nil, err
	}
	return &trace, nil
}

func trimTraceObjectKey(gcsURI, bucket string) string {
	return trimPrefix(gcsURI, fmt.Sprintf("gs://%s/", bucket))
}

func trimPrefix(value, prefix string) string {
	if len(value) >= len(prefix) && value[:len(prefix)] == prefix {
		return value[len(prefix):]
	}
	return value
}

func buildOTLPJSON(project *models.Project, traces []models.Trace) map[string]any {
	spans := make([]map[string]any, 0, len(traces)*4)
	for _, trace := range traces {
		spans = append(spans, traceRootSpan(trace))
		for _, step := range trace.Steps {
			spans = append(spans, stepSpan(trace, step))
		}
	}

	return map[string]any{
		"resourceSpans": []map[string]any{
			{
				"resource": map[string]any{
					"attributes": []map[string]any{
						stringAttribute("service.name", project.Name),
						stringAttribute("theta.project_id", project.ID),
						stringAttribute("theta.org_id", project.OrgID),
						stringAttribute("theta.export_format", "otlp-json"),
					},
				},
				"scopeSpans": []map[string]any{
					{
						"scope": map[string]any{
							"name":    "theta-observability",
							"version": models.CanonicalSchemaVersion,
						},
						"spans": spans,
					},
				},
			},
		},
	}
}

func traceRootSpan(trace models.Trace) map[string]any {
	rootSpanID := otelSpanID(trace.TraceID + ":root")
	attributes := []map[string]any{
		stringAttribute("theta.trace_id", trace.TraceID),
		stringAttribute("theta.project_id", trace.ProjectID),
		stringAttribute("theta.status", trace.Status),
		intAttribute("theta.step_count", int64(len(trace.Steps))),
		boolAttribute("theta.has_media", trace.HasMedia()),
	}
	if trace.RunType != "" {
		attributes = append(attributes, stringAttribute("theta.run_type", trace.RunType))
	}
	if trace.Platform != "" {
		attributes = append(attributes, stringAttribute("theta.platform", trace.Platform))
	}
	if trace.Model != "" {
		attributes = append(attributes, stringAttribute("theta.model", trace.Model))
	}
	if trace.UserID != "" {
		attributes = append(attributes, stringAttribute("enduser.id", trace.UserID))
	}
	if trace.RunID != "" {
		attributes = append(attributes, stringAttribute("theta.run_id", trace.RunID))
	}

	return map[string]any{
		"traceId":           otelTraceID(trace.TraceID),
		"spanId":            rootSpanID,
		"name":              firstString(trace.Name, "theta.trace"),
		"kind":              1,
		"startTimeUnixNano": unixNanos(trace.StartedAt),
		"endTimeUnixNano":   unixNanos(nonZeroTime(trace.EndedAt, trace.StartedAt)),
		"attributes":        attributes,
		"status":            otelStatus(trace.Status, trace.ErrorMessage),
	}
}

func stepSpan(trace models.Trace, step models.Step) map[string]any {
	parentSpanID := otelSpanID(trace.TraceID + ":root")
	if step.ParentStepID != "" {
		parentSpanID = otelSpanID(step.ParentStepID)
	}

	attributes := []map[string]any{
		stringAttribute("theta.step_id", step.StepID),
		stringAttribute("theta.step_type", step.Type),
		stringAttribute("theta.status", step.Status),
		intAttribute("theta.step_index", step.Index),
		intAttribute("theta.message_count", int64(len(step.Messages))),
		intAttribute("theta.tool_call_count", int64(len(step.ToolCalls))),
		intAttribute("theta.attachment_count", int64(step.AttachmentCount())),
	}
	if step.Model != "" {
		attributes = append(attributes, stringAttribute("llm.model", step.Model))
	}
	if step.ParentStepID != "" {
		attributes = append(attributes, stringAttribute("theta.parent_step_id", step.ParentStepID))
	}

	return map[string]any{
		"traceId":           otelTraceID(trace.TraceID),
		"spanId":            otelSpanID(step.StepID),
		"parentSpanId":      parentSpanID,
		"name":              firstString(step.Name, step.Type, "theta.step"),
		"kind":              stepKind(step.Type),
		"startTimeUnixNano": unixNanos(nonZeroTime(step.StartedAt, trace.StartedAt)),
		"endTimeUnixNano":   unixNanos(nonZeroTime(step.EndedAt, step.StartedAt, trace.EndedAt, trace.StartedAt)),
		"attributes":        attributes,
		"events":            otelStepEvents(step),
		"status":            otelStatus(step.Status, ""),
	}
}

func otelStepEvents(step models.Step) []map[string]any {
	events := make([]map[string]any, 0, len(step.Events)+len(step.ToolCalls))
	for _, event := range step.Events {
		attributes := []map[string]any{
			stringAttribute("theta.event_type", event.Type),
		}
		if event.Status != "" {
			attributes = append(attributes, stringAttribute("theta.status", event.Status))
		}
		if event.Model != "" {
			attributes = append(attributes, stringAttribute("theta.model", event.Model))
		}
		if event.ToolCall != nil {
			attributes = append(attributes, stringAttribute("theta.tool_name", event.ToolCall.Name))
		}
		if event.Attachment != nil {
			attributes = append(attributes, stringAttribute("theta.attachment_type", event.Attachment.Type))
			if event.Attachment.URI != "" {
				attributes = append(attributes, stringAttribute("theta.attachment_uri", event.Attachment.URI))
			}
		}
		if event.Value != nil {
			if raw, err := json.Marshal(event.Value); err == nil {
				attributes = append(attributes, stringAttribute("theta.event_value", string(raw)))
			}
		}
		events = append(events, map[string]any{
			"name":              firstString(event.Name, event.Type, "theta.event"),
			"timeUnixNano":      unixNanos(nonZeroTime(event.StartedAt, event.EndedAt, step.StartedAt)),
			"attributes":        attributes,
		})
	}
	for _, call := range step.ToolCalls {
		events = append(events, map[string]any{
			"name":         firstString(call.Name, "theta.tool_call"),
			"timeUnixNano": unixNanos(nonZeroTime(step.StartedAt)),
			"attributes": []map[string]any{
				stringAttribute("theta.event_type", "tool_call"),
				stringAttribute("theta.tool_name", call.Name),
			},
		})
	}
	return events
}

func otelTraceID(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:16])
}

func otelSpanID(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:8])
}

func unixNanos(ts time.Time) string {
	if ts.IsZero() {
		return "0"
	}
	return strconv.FormatInt(ts.UTC().UnixNano(), 10)
}

func stringAttribute(key, value string) map[string]any {
	return map[string]any{"key": key, "value": map[string]any{"stringValue": value}}
}

func intAttribute(key string, value int64) map[string]any {
	return map[string]any{"key": key, "value": map[string]any{"intValue": strconv.FormatInt(value, 10)}}
}

func boolAttribute(key string, value bool) map[string]any {
	if value {
		return map[string]any{"key": key, "value": map[string]any{"boolValue": true}}
	}
	return map[string]any{"key": key, "value": map[string]any{"boolValue": false}}
}

func otelStatus(status, message string) map[string]any {
	code := 0
	if status == "error" {
		code = 2
	}
	return map[string]any{
		"code":    code,
		"message": message,
	}
}

func stepKind(stepType string) int {
	switch stepType {
	case "llm":
		return 2
	case "tool", "retrieval":
		return 3
	default:
		return 1
	}
}

func nonZeroTime(candidates ...time.Time) time.Time {
	for _, candidate := range candidates {
		if !candidate.IsZero() {
			return candidate.UTC()
		}
	}
	return time.Time{}
}

func firstString(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}
