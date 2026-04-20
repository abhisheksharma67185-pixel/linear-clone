package bq

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"cloud.google.com/go/bigquery"
)

func TestInsertAllUsesEmulatorEndpoint(t *testing.T) {
	t.Parallel()

	var (
		gotPath string
		gotBody struct {
			Kind string `json:"kind"`
			Rows []struct {
				InsertID string         `json:"insertId"`
				JSON     map[string]any `json:"json"`
			} `json:"rows"`
		}
	)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		if err := json.NewDecoder(r.Body).Decode(&gotBody); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{}`))
	}))
	defer srv.Close()

	startedAt := time.Date(2026, 4, 18, 1, 2, 3, 456000000, time.UTC)
	writer := &Writer{
		project:    "theta-obs-dev",
		dataset:    "theta_observability",
		endpoint:   srv.URL + "/",
		httpClient: srv.Client(),
	}

	err := writer.insertAll(context.Background(), "traces", []bigquery.ValueSaver{
		Row{
			InsertID: "tr_test",
			Data: map[string]bigquery.Value{
				"trace_id":   "tr_test",
				"project_id": "proj_test",
				"started_at": startedAt,
				"tags":       []string{"smoke"},
			},
		},
	})
	if err != nil {
		t.Fatalf("insertAll returned error: %v", err)
	}

	if gotPath != "/bigquery/v2/projects/theta-obs-dev/datasets/theta_observability/tables/traces/insertAll" {
		t.Fatalf("unexpected path %q", gotPath)
	}
	if gotBody.Kind != "bigquery#tableDataInsertAllRequest" {
		t.Fatalf("unexpected kind %q", gotBody.Kind)
	}
	if len(gotBody.Rows) != 1 {
		t.Fatalf("expected 1 row, got %d", len(gotBody.Rows))
	}
	if gotBody.Rows[0].InsertID != "tr_test" {
		t.Fatalf("unexpected insertId %q", gotBody.Rows[0].InsertID)
	}
	if gotBody.Rows[0].JSON["started_at"] != startedAt.Format(time.RFC3339Nano) {
		t.Fatalf("unexpected started_at %v", gotBody.Rows[0].JSON["started_at"])
	}
}

func TestInsertAllReturnsInsertErrors(t *testing.T) {
	t.Parallel()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"insertErrors":[{"index":0}]}`))
	}))
	defer srv.Close()

	writer := &Writer{
		project:    "theta-obs-dev",
		dataset:    "theta_observability",
		endpoint:   srv.URL,
		httpClient: srv.Client(),
	}

	err := writer.insertAll(context.Background(), "traces", []bigquery.ValueSaver{
		Row{InsertID: "tr_test", Data: map[string]bigquery.Value{"trace_id": "tr_test"}},
	})
	if err == nil {
		t.Fatal("expected insertAll to fail when insertErrors are returned")
	}
}
