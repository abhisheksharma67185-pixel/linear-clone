package ingest

import (
	"testing"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

func TestBuildTraceRowNormalizesNilArrayFields(t *testing.T) {
	t.Parallel()

	trace := &models.Trace{
		TraceID:   "tr_test",
		ProjectID: "proj_test",
		StartedAt: time.Date(2026, 4, 18, 1, 2, 3, 0, time.UTC),
		Steps: []models.Step{
			{
				StepID: "st_test",
				Type:   "tool",
			},
		},
	}

	traceRow := buildTraceRow(trace, "org_test", "gs://bucket/tr_test.json")
	if tags, ok := traceRow.Data["tags"].([]string); !ok || tags == nil || len(tags) != 0 {
		t.Fatalf("expected empty tags slice, got %#v", traceRow.Data["tags"])
	}

	stepRow := buildStepRow(trace, &trace.Steps[0])
	if modalities, ok := stepRow.Data["modalities"].([]string); !ok || modalities == nil || len(modalities) != 0 {
		t.Fatalf("expected empty modalities slice, got %#v", stepRow.Data["modalities"])
	}
}
