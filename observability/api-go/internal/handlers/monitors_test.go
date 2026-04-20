package handlers

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

func TestParseMonitorFilters(t *testing.T) {
	monitor := &models.MonitorConfig{
		ProjectID: "proj_test",
		Filters: json.RawMessage(`{
			"platform": ["desktop", "web"],
			"run_type": ["prod"],
			"tags": ["checkout"],
			"metadata.workflow.stage": ["payment"],
			"meta.customer.tier": "enterprise"
		}`),
	}

	filters, metadata := parseMonitorFilters(monitor)
	if got, want := filters.Platform, []string{"desktop", "web"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("platform filters = %#v, want %#v", got, want)
	}
	if got, want := filters.RunType, []string{"prod"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("run_type filters = %#v, want %#v", got, want)
	}
	if got, want := filters.Tags, []string{"checkout"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("tags filters = %#v, want %#v", got, want)
	}
	wantMetadata := []bq.MetadataFilter{
		{Key: "workflow.stage", Value: "payment"},
		{Key: "customer.tier", Value: "enterprise"},
	}
	if !reflect.DeepEqual(metadata, wantMetadata) {
		t.Fatalf("metadata filters = %#v, want %#v", metadata, wantMetadata)
	}
}

func TestAggregateMonitorValueAndState(t *testing.T) {
	items := []models.TraceListItem{
		{Status: "success", LatencyMS: 100, TotalTokens: 40, CostUSD: 0.01},
		{Status: "error", LatencyMS: 300, TotalTokens: 60, CostUSD: 0.03},
	}

	if got := aggregateMonitorValue(items, "latency_ms"); got != 200 {
		t.Fatalf("latency aggregate = %v, want 200", got)
	}
	if got := aggregateMonitorValue(items, "error_rate"); got != 50 {
		t.Fatalf("error rate = %v, want 50", got)
	}
	if got := aggregateMonitorValue(items, "success_rate"); got != 50 {
		t.Fatalf("success rate = %v, want 50", got)
	}
	if got := aggregateMonitorValue(items, "total_tokens"); got != 100 {
		t.Fatalf("total tokens = %v, want 100", got)
	}
	if got := aggregateMonitorValue(items, "cost_usd"); got != 0.04 {
		t.Fatalf("cost usd = %v, want 0.04", got)
	}
	if got := aggregateMonitorValue(items, "trace_count"); got != 2 {
		t.Fatalf("trace count = %v, want 2", got)
	}

	warn := 40.0
	critical := 80.0
	if got := classifyMonitorState(50, "gt", &warn, &critical); got != "warn" {
		t.Fatalf("state = %q, want warn", got)
	}
	if got := classifyMonitorState(90, "gt", &warn, &critical); got != "critical" {
		t.Fatalf("state = %q, want critical", got)
	}
	if got := classifyMonitorState(10, "gt", &warn, &critical); got != "ok" {
		t.Fatalf("state = %q, want ok", got)
	}
}

func TestMonitorGroupValueFromMetadata(t *testing.T) {
	item := models.TraceListItem{
		Platform: "desktop",
		Metadata: json.RawMessage(`{"customer":{"tier":"enterprise"}}`),
	}

	if got := monitorGroupValue(item, "platform"); got != "desktop" {
		t.Fatalf("platform group = %q, want desktop", got)
	}
	if got := monitorGroupValue(item, "meta.customer.tier"); got != "enterprise" {
		t.Fatalf("metadata group = %q, want enterprise", got)
	}
	if got := monitorGroupValue(item, "meta.customer.region"); got != "(missing)" {
		t.Fatalf("missing metadata group = %q, want (missing)", got)
	}
}
