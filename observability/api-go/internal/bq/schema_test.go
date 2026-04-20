package bq

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"slices"
	"testing"
)

func TestEnsureSchemaViaAPICreatesMissingResources(t *testing.T) {
	t.Parallel()

	var requests []struct {
		Method string
		Path   string
		Body   map[string]any
	}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		record := struct {
			Method string
			Path   string
			Body   map[string]any
		}{
			Method: r.Method,
			Path:   r.URL.Path,
		}
		if r.Body != nil && r.Method == http.MethodPost {
			_ = json.NewDecoder(r.Body).Decode(&record.Body)
		}
		requests = append(requests, record)

		switch r.Method + " " + r.URL.Path {
		case "GET /bigquery/v2/projects/theta-obs-dev/datasets/theta_observability":
			http.NotFound(w, r)
		case "POST /bigquery/v2/projects/theta-obs-dev/datasets":
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{}`))
		case "GET /bigquery/v2/projects/theta-obs-dev/datasets/theta_observability/tables/traces":
			http.NotFound(w, r)
		case "GET /bigquery/v2/projects/theta-obs-dev/datasets/theta_observability/tables/steps":
			http.NotFound(w, r)
		case "POST /bigquery/v2/projects/theta-obs-dev/datasets/theta_observability/tables":
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{}`))
		default:
			t.Fatalf("unexpected request %s %s", r.Method, r.URL.Path)
		}
	}))
	defer srv.Close()

	writer := &Writer{
		project:    "theta-obs-dev",
		dataset:    "theta_observability",
		endpoint:   srv.URL,
		httpClient: srv.Client(),
	}

	if err := writer.ensureSchema(context.Background()); err != nil {
		t.Fatalf("ensureSchema() error = %v", err)
	}

	if len(requests) != 6 {
		t.Fatalf("expected 6 requests, got %d", len(requests))
	}

	datasetCreate := requests[1].Body
	if got := datasetCreate["location"]; got != "US" {
		t.Fatalf("dataset location = %v, want US", got)
	}

	tableNames := make([]string, 0, 2)
	for _, req := range requests {
		if req.Method != http.MethodPost || req.Path != "/bigquery/v2/projects/theta-obs-dev/datasets/theta_observability/tables" {
			continue
		}
		ref := req.Body["tableReference"].(map[string]any)
		tableNames = append(tableNames, ref["tableId"].(string))
	}
	slices.Sort(tableNames)
	if !slices.Equal(tableNames, []string{"steps", "traces"}) {
		t.Fatalf("created tables = %v, want [steps traces]", tableNames)
	}
}

func TestFieldType(t *testing.T) {
	t.Parallel()

	if got := fieldType("JSON"); got != "JSON" {
		t.Fatalf("fieldType(JSON) = %v, want JSON", got)
	}
	if got := fieldType("BOOL"); got != "BOOLEAN" {
		t.Fatalf("fieldType(BOOL) = %v, want BOOLEAN", got)
	}
}
