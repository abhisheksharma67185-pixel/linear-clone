package handlers

import (
	"encoding/json"
	"net/url"
	"reflect"
	"testing"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

func TestQueryValues(t *testing.T) {
	q := url.Values{
		"status": []string{"error", "running"},
		"model":  []string{"gpt-5,claude-opus-4.6"},
	}

	if got, want := queryValues(q, "status"), []string{"error", "running"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("queryValues status = %#v, want %#v", got, want)
	}

	if got, want := queryValues(q, "model"), []string{"gpt-5", "claude-opus-4.6"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("queryValues model = %#v, want %#v", got, want)
	}
}

func TestQueryMetadataFilters(t *testing.T) {
	q := url.Values{
		"meta_key":   []string{"workflow.stage", "customer.tier", ""},
		"meta_value": []string{"checkout", "enterprise", "ignored"},
	}

	got := queryMetadataFilters(q)
	want := []bq.MetadataFilter{
		{Key: "workflow.stage", Value: "checkout"},
		{Key: "customer.tier", Value: "enterprise"},
	}

	if !reflect.DeepEqual(got, want) {
		t.Fatalf("queryMetadataFilters = %#v, want %#v", got, want)
	}
}

func TestTraceMetadataMatches(t *testing.T) {
	item := models.TraceListItem{
		Metadata: json.RawMessage(`{"workflow":{"stage":"checkout"},"labels":["vip","fraud"]}`),
	}

	if !traceMetadataMatches(item, []bq.MetadataFilter{{Key: "workflow.stage", Value: "checkout"}}) {
		t.Fatal("expected nested metadata filter to match")
	}

	if !traceMetadataMatches(item, []bq.MetadataFilter{{Key: "labels", Value: "vip"}}) {
		t.Fatal("expected array metadata filter to match")
	}

	if traceMetadataMatches(item, []bq.MetadataFilter{{Key: "workflow.stage", Value: "payment"}}) {
		t.Fatal("expected metadata mismatch")
	}
}
