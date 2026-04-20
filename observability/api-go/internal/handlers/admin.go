package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/gcs"
	"google.golang.org/api/iterator"
)

// Admin holds dependencies for org/owner-only mutation endpoints.
type Admin struct {
	BQ      *bq.Writer
	GCS     *gcs.Client
	Project string // BQ project id
	Dataset string // BQ dataset id
	Log     *slog.Logger
}

// allowedPatchFields restricts which trace fields the bulk patch may rewrite.
// Identity / partition / timing fields are explicitly NOT allowed.
var allowedPatchFields = map[string]bool{
	"run_id":   true,
	"run_type": true,
	"use_case": true,
	"group":    true,
	"tags":     true,
}

type bulkPatchRequest struct {
	Filter map[string]any `json:"filter"`
	Set    map[string]any `json:"set"`
	DryRun bool           `json:"dry_run"`
}

type bulkPatchResponse struct {
	Matched         int      `json:"matched"`
	Updated         int      `json:"updated"`
	GCSRewritten    int      `json:"gcs_rewritten"`
	GCSFailed       int      `json:"gcs_failed"`
	SampleTraceIDs  []string `json:"sample_trace_ids"`
	ChangedFields   []string `json:"changed_fields"`
	DryRun          bool     `json:"dry_run"`
	DurationMs      int64    `json:"duration_ms"`
}

// PATCH /v1/admin/traces/bulk
//
//	{ "filter": { "user_id": "...", "run_id": "..." },
//	  "set":    { "run_id": "..." },
//	  "dry_run": false }
//
// Owner-role JWT only. Allow-listed fields. Updates BQ row and rewrites the
// matching GCS trace JSON in place. Returns counts and a sample of trace_ids.
func (h *Admin) BulkPatch(w http.ResponseWriter, r *http.Request) {
	t0 := time.Now()
	uc, ok := auth.UserFromContext(r.Context())
	if !ok || uc == nil {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "dashboard JWT required")
		return
	}
	var req bulkPatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if len(req.Filter) == 0 {
		writeErr(w, http.StatusBadRequest, "bad_request", "filter must specify at least one field")
		return
	}
	if len(req.Set) == 0 {
		writeErr(w, http.StatusBadRequest, "bad_request", "set must specify at least one field")
		return
	}
	for k := range req.Set {
		if !allowedPatchFields[k] {
			writeErr(w, http.StatusBadRequest, "forbidden_field",
				fmt.Sprintf("field %q is not patchable; allowed: run_id, run_type, use_case, group, tags", k))
			return
		}
	}

	// Build WHERE clause from filter (only allow-listed identity dims).
	allowedFilter := map[string]bool{
		"user_id": true, "run_id": true, "project_id": true,
		"org_id": true, "use_case": true, "group": true, "platform": true, "model": true,
	}
	var where []string
	var qparams []bigquery.QueryParameter
	for k, v := range req.Filter {
		if !allowedFilter[k] {
			writeErr(w, http.StatusBadRequest, "forbidden_filter",
				fmt.Sprintf("filter field %q not allowed", k))
			return
		}
		col := k
		if k == "group" {
			col = "`group`"
		}
		where = append(where, fmt.Sprintf("%s = @f_%s", col, k))
		qparams = append(qparams, bigquery.QueryParameter{Name: "f_" + k, Value: v})
	}
	whereSQL := strings.Join(where, " AND ")

	// Step 1: collect matching trace_ids + gcs_uris.
	listSQL := fmt.Sprintf(
		"SELECT trace_id, gcs_uri FROM `%s.%s.traces` WHERE %s",
		h.Project, h.Dataset, whereSQL,
	)
	q := h.BQ.Client().Query(listSQL)
	q.Parameters = qparams
	it, err := q.Read(r.Context())
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "query_failed", err.Error())
		return
	}
	type matchRow struct {
		TraceID string `bigquery:"trace_id"`
		GCSURI  string `bigquery:"gcs_uri"`
	}
	var matches []matchRow
	for {
		var m matchRow
		if err := it.Next(&m); err == iterator.Done {
			break
		} else if err != nil {
			writeErr(w, http.StatusInternalServerError, "scan_failed", err.Error())
			return
		}
		matches = append(matches, m)
	}

	sample := make([]string, 0, 10)
	for i, m := range matches {
		if i >= 10 {
			break
		}
		sample = append(sample, m.TraceID)
	}
	resp := bulkPatchResponse{
		Matched:        len(matches),
		DryRun:         req.DryRun,
		SampleTraceIDs: sample,
	}
	for k := range req.Set {
		resp.ChangedFields = append(resp.ChangedFields, k)
	}
	if req.DryRun || len(matches) == 0 {
		resp.DurationMs = time.Since(t0).Milliseconds()
		writeJSON(w, http.StatusOK, resp)
		return
	}

	// Step 2: BQ UPDATE with allow-listed SET clauses.
	var sets []string
	updateParams := make([]bigquery.QueryParameter, 0, len(qparams)+len(req.Set))
	updateParams = append(updateParams, qparams...)
	for k, v := range req.Set {
		col := k
		if k == "group" {
			col = "`group`"
		}
		sets = append(sets, fmt.Sprintf("%s = @s_%s", col, k))
		updateParams = append(updateParams, bigquery.QueryParameter{Name: "s_" + k, Value: v})
	}
	updateSQL := fmt.Sprintf(
		"UPDATE `%s.%s.traces` SET %s WHERE %s",
		h.Project, h.Dataset, strings.Join(sets, ", "), whereSQL,
	)
	uq := h.BQ.Client().Query(updateSQL)
	uq.Parameters = updateParams
	job, err := uq.Run(r.Context())
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "update_failed", err.Error())
		return
	}
	status, err := job.Wait(r.Context())
	if err != nil || (status != nil && status.Err() != nil) {
		errMsg := "update job failed"
		if err != nil {
			errMsg = err.Error()
		} else if status != nil && status.Err() != nil {
			errMsg = status.Err().Error()
		}
		writeErr(w, http.StatusInternalServerError, "update_failed", errMsg)
		return
	}
	resp.Updated = len(matches)

	// Step 3: rewrite matching GCS trace JSON blobs.
	for _, m := range matches {
		if err := rewriteTraceJSON(r.Context(), h.GCS, m.GCSURI, req.Set); err != nil {
			h.Log.Warn("gcs rewrite failed", "trace_id", m.TraceID, "err", err)
			resp.GCSFailed++
			continue
		}
		resp.GCSRewritten++
	}

	h.Log.Info("admin bulk patch",
		"actor", uc.Email,
		"matched", resp.Matched,
		"updated", resp.Updated,
		"gcs_rewritten", resp.GCSRewritten,
		"gcs_failed", resp.GCSFailed,
	)
	resp.DurationMs = time.Since(t0).Milliseconds()
	writeJSON(w, http.StatusOK, resp)
}

func rewriteTraceJSON(ctx context.Context, g *gcs.Client, gsURI string, set map[string]any) error {
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
	var obj map[string]any
	if err := json.Unmarshal(body, &obj); err != nil {
		return fmt.Errorf("json parse: %w", err)
	}
	for k, v := range set {
		obj[k] = v
	}
	out, err := json.Marshal(obj)
	if err != nil {
		return fmt.Errorf("json marshal: %w", err)
	}
	return g.Put(ctx, key, bytes.NewReader(out), "application/json")
}

