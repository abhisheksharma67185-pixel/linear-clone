package handlers

import (
	"strings"
	"testing"
)

func TestParseImportItemsJSON(t *testing.T) {
	body := strings.NewReader(`[{"trace_id":"tr_1","steps":[]},{"events":[]}]`)

	items, err := parseImportItems(body, "application/json")
	if err != nil {
		t.Fatalf("parseImportItems returned error: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("len(items) = %d, want 2", len(items))
	}
}

func TestParseImportItemsNDJSON(t *testing.T) {
	body := strings.NewReader("{\"trace_id\":\"tr_1\",\"steps\":[]}\n{\"events\":[]}\n")

	items, err := parseImportItems(body, "application/x-ndjson")
	if err != nil {
		t.Fatalf("parseImportItems returned error: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("len(items) = %d, want 2", len(items))
	}
}

func TestDetectImportKind(t *testing.T) {
	if got := detectImportKind([]byte(`{"trace_id":"tr_1","steps":[]}`)); got != "trace" {
		t.Fatalf("detectImportKind(trace) = %q, want trace", got)
	}
	if got := detectImportKind([]byte(`{"events":[]}`)); got != "canonical_envelope" {
		t.Fatalf("detectImportKind(canonical) = %q, want canonical_envelope", got)
	}
	if got := detectImportKind([]byte(`{"foo":"bar"}`)); got != "unknown" {
		t.Fatalf("detectImportKind(unknown) = %q, want unknown", got)
	}
}

func TestDecodeImportItemCanonicalEnvelope(t *testing.T) {
	trace, traceID, err := decodeImportItem([]byte(`{
		"name":"generic-run",
		"events":[{"type":"message","message":{"role":"user","content":[{"type":"text","text":"hi"}]}}]
	}`), "canonical_envelope", "proj_test")
	if err != nil {
		t.Fatalf("decodeImportItem returned error: %v", err)
	}
	if trace.ProjectID != "proj_test" {
		t.Fatalf("project_id = %q, want proj_test", trace.ProjectID)
	}
	if traceID == "" {
		t.Fatal("expected generated trace id")
	}
	if len(trace.Steps) != 1 {
		t.Fatalf("steps len = %d, want 1", len(trace.Steps))
	}
}
