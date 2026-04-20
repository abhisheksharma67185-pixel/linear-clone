package handlers

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

func TestDiscoverMetadataFields(t *testing.T) {
	now := time.Now().UTC()
	items := []models.TraceListItem{
		{
			TraceID:   "tr_1",
			StartedAt: now,
			Metadata: json.RawMessage(`{
				"environment": "prod",
				"workflow": { "stage": "checkout", "attempt": 1 },
				"tags": ["vip", "checkout"],
				"flags": { "redacted": true }
			}`),
		},
		{
			TraceID:   "tr_2",
			StartedAt: now.Add(-time.Minute),
			Metadata: json.RawMessage(`{
				"environment": "prod",
				"workflow": { "stage": "checkout", "attempt": 2 },
				"tags": ["vip"],
				"flags": { "redacted": false },
				"release": "2026.04.20"
			}`),
		},
		{
			TraceID:   "tr_3",
			StartedAt: now.Add(-2 * time.Minute),
			Metadata: json.RawMessage(`{
				"environment": "staging",
				"workflow": { "stage": "review" },
				"flags": { "redacted": true }
			}`),
		},
	}

	fields := discoverMetadataFields(items)
	if len(fields) == 0 {
		t.Fatal("expected discovered metadata fields")
	}

	byKey := make(map[string]models.MetadataField, len(fields))
	for _, field := range fields {
		byKey[field.Key] = field
	}

	if got := byKey["environment"]; got.Occurrences != 3 || got.ValueType != "string" {
		t.Fatalf("environment = %#v", got)
	}
	if got := byKey["workflow.stage"]; got.Occurrences != 3 || got.ValueType != "string" {
		t.Fatalf("workflow.stage = %#v", got)
	}
	if got := byKey["workflow.attempt"]; got.Occurrences != 2 || got.ValueType != "number" {
		t.Fatalf("workflow.attempt = %#v", got)
	}
	if got := byKey["flags.redacted"]; got.Occurrences != 3 || got.ValueType != "boolean" {
		t.Fatalf("flags.redacted = %#v", got)
	}
	if got := byKey["tags"]; got.Occurrences != 3 || got.ValueType != "string" {
		t.Fatalf("tags = %#v", got)
	}
	if got := byKey["release"]; got.Occurrences != 1 || len(got.ExampleValues) != 1 || got.ExampleValues[0] != "2026.04.20" {
		t.Fatalf("release = %#v", got)
	}
}

func TestDiscoverMetadataFieldsSupportsArrayObjects(t *testing.T) {
	items := []models.TraceListItem{
		{
			TraceID: "tr_nested",
			Metadata: json.RawMessage(`{
				"contacts": [
					{ "channel": "email", "status": "queued" },
					{ "channel": "linkedin", "status": "sent" }
				]
			}`),
		},
	}

	fields := discoverMetadataFields(items)
	byKey := make(map[string]models.MetadataField, len(fields))
	for _, field := range fields {
		byKey[field.Key] = field
	}

	if got := byKey["contacts.channel"]; got.Occurrences != 2 || got.ValueType != "string" {
		t.Fatalf("contacts.channel = %#v", got)
	}
	if got := byKey["contacts.status"]; got.Occurrences != 2 || got.ValueType != "string" {
		t.Fatalf("contacts.status = %#v", got)
	}
}
