package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/go-chi/chi/v5"
	"github.com/theagi/theta-observability/api-go/internal/auth"
	"github.com/theagi/theta-observability/api-go/internal/bq"
	"github.com/theagi/theta-observability/api-go/internal/gcs"
	"github.com/theagi/theta-observability/api-go/internal/ingest"
	"github.com/theagi/theta-observability/api-go/internal/models"
	"github.com/theagi/theta-observability/api-go/internal/sse"
	"github.com/theagi/theta-observability/api-go/internal/store"
)

type Traces struct {
	Pipeline *ingest.Pipeline
	BQ       *bq.Writer
	GCS      *gcs.Client
	Hub      *sse.Hub
	Store    *store.Store
}

// POST /v1/traces — accept full trace payload, run ingest pipeline.
func (h *Traces) Create(w http.ResponseWriter, r *http.Request) {
	ac, ok := auth.APIKeyFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "missing api key context")
		return
	}
	var t models.Trace
	if err := json.NewDecoder(io.LimitReader(r.Body, 10<<20)).Decode(&t); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	// force project scoping from the authenticated key
	t.ProjectID = ac.ProjectID
	resp, err := h.Pipeline.Ingest(r.Context(), ac.OrgID, &t)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "ingest_failed", err.Error())
		return
	}
	if h.Store != nil {
		_ = h.Store.RecordUsage(r.Context(), ac.OrgID, ac.ProjectID, "trace.ingested", 1)
		if len(t.Steps) > 0 {
			_ = h.Store.RecordUsage(r.Context(), ac.OrgID, ac.ProjectID, "step.ingested", int64(len(t.Steps)))
		}
	}
	writeJSON(w, http.StatusAccepted, resp)
}

// GET /v1/traces — list traces with filters + cursor pagination.
func (h *Traces) List(w http.ResponseWriter, r *http.Request) {
	ac, _ := auth.APIKeyFromContext(r.Context())
	uc, _ := auth.UserFromContext(r.Context())
	q := r.URL.Query()
	f := bq.ListFilters{
		ProjectID: q.Get("project_id"),
		Status:    queryValues(q, "status"),
		Platform:  queryValues(q, "platform"),
		Model:     queryValues(q, "model"),
		UserID:    q.Get("user_id"),
		RunID:     q.Get("run_id"),
		RunType:   queryValues(q, "run_type"),
		UseCase:   queryValues(q, "use_case"),
		Group:     q.Get("group"),
		Cursor:    q.Get("cursor"),
		Metadata:  queryMetadataFilters(q),
	}
	if tags := queryValues(q, "tags"); len(tags) > 0 {
		f.Tags = tags
	}
	if s := q.Get("since"); s != "" {
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			f.Since = t
		}
	}
	if s := q.Get("until"); s != "" {
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			f.Until = t
		}
	}
	if s := q.Get("limit"); s != "" {
		if n, err := strconv.Atoi(s); err == nil {
			f.Limit = n
		}
	}
	if ac != nil && f.ProjectID == "" {
		f.ProjectID = ac.ProjectID
	}
	if uc != nil && f.ProjectID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "project_id required")
		return
	}
	var (
		items []models.TraceListItem
		next  string
		err   error
	)
	if len(f.Metadata) > 0 {
		items, next, err = h.listWithMetadataFilters(r.Context(), f)
	} else {
		items, next, err = h.BQ.ListTraces(r.Context(), f)
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "query_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, models.TraceListResponse{Items: items, NextCursor: next})
}

// GET /v1/traces/:id — meta from BQ + streamed trace JSON from GCS.
func (h *Traces) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	item, gcsURI, err := h.BQ.GetTrace(r.Context(), id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "query_failed", err.Error())
		return
	}
	if item == nil {
		writeErr(w, http.StatusNotFound, "not_found", "trace not found")
		return
	}
	// gcsURI shape: gs://bucket/key
	key := strings.TrimPrefix(gcsURI, "gs://"+h.GCS.Bucket()+"/")
	rc, err := h.GCS.Get(r.Context(), key)
	if err != nil {
		// Index row exists but object missing — return meta only.
		writeJSON(w, http.StatusOK, map[string]any{"meta": item, "trace": nil})
		return
	}
	defer rc.Close()
	body, err := io.ReadAll(io.LimitReader(rc, 50<<20))
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "read_failed", err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"meta":`)
	_ = json.NewEncoder(w).Encode(item)
	fmt.Fprintf(w, `,"trace":%s}`, string(body))
}

// GET /v1/traces/:id/tail — SSE for live onboarding tail.
func (h *Traces) Tail(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeErr(w, http.StatusInternalServerError, "streaming_unsupported", "server does not support streaming")
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)

	sub, unsub := h.Hub.Subscribe(id)
	defer unsub()

	heartbeat := time.NewTicker(15 * time.Second)
	defer heartbeat.Stop()

	fmt.Fprintf(w, "event: ready\ndata: {}\n\n")
	flusher.Flush()

	for {
		select {
		case <-r.Context().Done():
			return
		case msg, ok := <-sub:
			if !ok {
				return
			}
			fmt.Fprintf(w, "event: trace\ndata: %s\n\n", string(msg))
			flusher.Flush()
		case <-heartbeat.C:
			fmt.Fprintf(w, ": keepalive\n\n")
			flusher.Flush()
		}
	}
}

// POST /v1/traces/:id/flag
func (h *Traces) Flag(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	traceID := chi.URLParam(r, "id")
	item, gcsURI, err := h.BQ.GetTrace(r.Context(), traceID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "query_failed", err.Error())
		return
	}
	if item == nil {
		writeErr(w, http.StatusNotFound, "not_found", "trace not found")
		return
	}
	project, err := h.Store.GetProject(r.Context(), item.ProjectID)
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

	updatedTags := mergeTraceTags(item.Tags, []string{"flagged-for-review"})
	if err := updateTraceTags(r.Context(), h.BQ, traceID, updatedTags); err != nil {
		writeErr(w, http.StatusInternalServerError, "update_failed", err.Error())
		return
	}
	if err := rewriteTraceTags(r.Context(), h.GCS, gcsURI, updatedTags); err != nil {
		writeErr(w, http.StatusInternalServerError, "rewrite_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "tags": updatedTags})
}

func queryValues(q url.Values, key string) []string {
	values := q[key]
	if len(values) == 0 {
		return nil
	}
	out := make([]string, 0, len(values))
	for _, value := range values {
		out = append(out, splitAndTrim(value, ",")...)
	}
	if len(out) == 0 {
		return nil
	}
	return out
}

func queryMetadataFilters(q url.Values) []bq.MetadataFilter {
	keys := q["meta_key"]
	values := q["meta_value"]
	if len(keys) == 0 || len(values) == 0 {
		return nil
	}
	out := make([]bq.MetadataFilter, 0, len(keys))
	for idx, key := range keys {
		if idx >= len(values) {
			break
		}
		key = strings.TrimSpace(key)
		value := strings.TrimSpace(values[idx])
		if key == "" || value == "" {
			continue
		}
		out = append(out, bq.MetadataFilter{
			Key:   key,
			Value: value,
		})
	}
	return out
}

func (h *Traces) listWithMetadataFilters(
	ctx context.Context,
	f bq.ListFilters,
) ([]models.TraceListItem, string, error) {
	base := f
	base.Metadata = nil

	limit := f.Limit
	if limit <= 0 || limit > 500 {
		limit = 50
	}
	batchLimit := limit * 4
	if batchLimit < 100 {
		batchLimit = 100
	}
	if batchLimit > 500 {
		batchLimit = 500
	}

	cursor := f.Cursor
	matched := make([]models.TraceListItem, 0, limit)

	for {
		base.Cursor = cursor
		base.Limit = batchLimit

		items, next, err := h.BQ.ListTraces(ctx, base)
		if err != nil {
			return nil, "", err
		}
		if len(items) == 0 {
			return matched, "", nil
		}

		filtered, lastIndex := filterTraceItemsByMetadata(items, f.Metadata)
		if len(filtered) > 0 {
			remaining := limit - len(matched)
			if len(filtered) >= remaining {
				matched = append(matched, filtered[:remaining]...)
				lastReturned := matched[len(matched)-1]
				if next != "" || lastIndex < len(items)-1 {
					return matched, bq.EncodeCursor(lastReturned.StartedAt, lastReturned.TraceID), nil
				}
				return matched, "", nil
			}
			matched = append(matched, filtered...)
		}

		if next == "" {
			return matched, "", nil
		}
		cursor = next
	}
}

func filterTraceItemsByMetadata(
	items []models.TraceListItem,
	filters []bq.MetadataFilter,
) ([]models.TraceListItem, int) {
	out := make([]models.TraceListItem, 0, len(items))
	lastIndex := -1
	for idx, item := range items {
		if !traceMetadataMatches(item, filters) {
			continue
		}
		out = append(out, item)
		lastIndex = idx
	}
	return out, lastIndex
}

func traceMetadataMatches(item models.TraceListItem, filters []bq.MetadataFilter) bool {
	if len(filters) == 0 {
		return true
	}
	if len(item.Metadata) == 0 {
		return false
	}

	var payload any
	if err := json.Unmarshal(item.Metadata, &payload); err != nil {
		return false
	}

	for _, filter := range filters {
		expected := strings.TrimSpace(strings.ToLower(filter.Value))
		if expected == "" {
			continue
		}
		values := metadataValuesForPath(payload, strings.Split(filter.Key, "."))
		matched := false
		for _, value := range values {
			if strings.ToLower(value) == expected {
				matched = true
				break
			}
		}
		if !matched {
			return false
		}
	}
	return true
}

func metadataValuesForPath(value any, path []string) []string {
	if len(path) == 0 {
		return scalarMetadataValues(value)
	}

	head := strings.TrimSpace(path[0])
	if head == "" {
		return nil
	}

	obj, ok := value.(map[string]any)
	if !ok {
		return nil
	}
	next, ok := obj[head]
	if !ok {
		return nil
	}
	return metadataValuesForPath(next, path[1:])
}

func scalarMetadataValues(value any) []string {
	switch typed := value.(type) {
	case nil:
		return nil
	case []any:
		out := make([]string, 0, len(typed))
		for _, item := range typed {
			out = append(out, scalarMetadataValues(item)...)
		}
		return out
	case map[string]any:
		b, err := json.Marshal(typed)
		if err != nil {
			return nil
		}
		return []string{string(b)}
	default:
		return []string{fmt.Sprint(typed)}
	}
}

func splitAndTrim(s, sep string) []string {
	parts := strings.Split(s, sep)
	out := parts[:0]
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

func mergeTraceTags(existing, additions []string) []string {
	seen := make(map[string]struct{}, len(existing)+len(additions))
	out := make([]string, 0, len(existing)+len(additions))
	for _, tag := range append(existing, additions...) {
		tag = strings.TrimSpace(tag)
		if tag == "" {
			continue
		}
		if _, ok := seen[tag]; ok {
			continue
		}
		seen[tag] = struct{}{}
		out = append(out, tag)
	}
	return out
}

func updateTraceTags(ctx context.Context, writer *bq.Writer, traceID string, tags []string) error {
	q := writer.Client().Query(fmt.Sprintf(`
		UPDATE `+"`%s.%s.traces`"+`
		SET tags = @tags
		WHERE trace_id = @trace_id
	`, writer.Client().Project(), writer.Dataset()))
	q.Parameters = []bigquery.QueryParameter{
		{Name: "trace_id", Value: traceID},
		{Name: "tags", Value: tags},
	}
	job, err := q.Run(ctx)
	if err != nil {
		return err
	}
	status, err := job.Wait(ctx)
	if err != nil {
		return err
	}
	if status != nil && status.Err() != nil {
		return status.Err()
	}
	return nil
}

func rewriteTraceTags(ctx context.Context, g *gcs.Client, gsURI string, tags []string) error {
	const prefix = "gs://"
	if !strings.HasPrefix(gsURI, prefix) {
		return fmt.Errorf("not a gs:// uri: %s", gsURI)
	}
	rest := strings.TrimPrefix(gsURI, prefix)
	parts := strings.SplitN(rest, "/", 2)
	if len(parts) != 2 {
		return fmt.Errorf("malformed gs uri: %s", gsURI)
	}
	key := parts[1]

	rd, err := g.Get(ctx, key)
	if err != nil {
		return fmt.Errorf("gcs get: %w", err)
	}
	defer rd.Close()
	body, err := io.ReadAll(rd)
	if err != nil {
		return fmt.Errorf("gcs read: %w", err)
	}
	var trace map[string]any
	if err := json.Unmarshal(body, &trace); err != nil {
		return fmt.Errorf("json parse: %w", err)
	}
	trace["tags"] = tags
	out, err := json.Marshal(trace)
	if err != nil {
		return fmt.Errorf("json marshal: %w", err)
	}
	return g.Put(ctx, key, strings.NewReader(string(out)), "application/json")
}
