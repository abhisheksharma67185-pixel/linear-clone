package ingest

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

func TestNormalizeCanonicalEnvelope(t *testing.T) {
	start := time.Date(2026, 4, 19, 10, 0, 0, 0, time.UTC)
	end := start.Add(3 * time.Second)

	env := &models.CanonicalEnvelope{
		Name:      "browser-checkout",
		Source:    "openclaw",
		Kind:      "browser_session",
		SessionID: "sess_123",
		UserID:    "user_123",
		Platform:  "desktop",
		Metadata:  json.RawMessage(`{"env":"prod"}`),
		Correlation: &models.CorrelationInfo{
			RootTraceID: "tr_root",
			RequestID:   "req_123",
		},
		Events: []models.CanonicalEvent{
			{
				EventID:   "evt_1",
				StepID:    "step_browser",
				StepType:  "custom",
				Type:      "span",
				Name:      "browser-step",
				Status:    "success",
				StartedAt: start,
				EndedAt:   end,
			},
			{
				EventID:   "evt_2",
				StepID:    "step_browser",
				Type:      "message",
				Role:      "user",
				StartedAt: start,
				Message: &models.Message{
					Role: "user",
					Content: []models.ContentPart{
						{Type: "text", Text: "search for shoes"},
					},
				},
			},
			{
				EventID:   "evt_3",
				StepID:    "step_browser",
				Type:      "tool",
				Name:      "click",
				StartedAt: start.Add(time.Second),
				ToolCall: &models.ToolCall{
					ID:   "tool_1",
					Name: "click",
				},
			},
			{
				EventID:   "evt_4",
				StepID:    "step_browser",
				Type:      "artifact",
				StartedAt: end,
				Attachment: &models.ContentPart{
					Type:   "image",
					URI:    "gs://theta/screenshot.png",
					Width:  1920,
					Height: 1080,
				},
			},
		},
	}

	trace, err := NormalizeCanonicalEnvelope(env, "proj_test")
	if err != nil {
		t.Fatalf("NormalizeCanonicalEnvelope returned error: %v", err)
	}

	if trace.ProjectID != "proj_test" {
		t.Fatalf("project_id = %q, want proj_test", trace.ProjectID)
	}
	if trace.Name != "browser-checkout" {
		t.Fatalf("name = %q", trace.Name)
	}
	if len(trace.Events) != 4 {
		t.Fatalf("events len = %d, want 4", len(trace.Events))
	}
	if len(trace.Steps) != 1 {
		t.Fatalf("steps len = %d, want 1", len(trace.Steps))
	}
	step := trace.Steps[0]
	if step.Name != "browser-step" {
		t.Fatalf("step name = %q, want browser-step", step.Name)
	}
	if len(step.Messages) != 1 {
		t.Fatalf("messages len = %d, want 1", len(step.Messages))
	}
	if len(step.ToolCalls) != 1 {
		t.Fatalf("tool_calls len = %d, want 1", len(step.ToolCalls))
	}
	if len(step.Attachments) != 1 {
		t.Fatalf("attachments len = %d, want 1", len(step.Attachments))
	}
	if !trace.HasMedia() {
		t.Fatal("expected trace.HasMedia to be true")
	}

	var metadata map[string]any
	if err := json.Unmarshal(trace.Metadata, &metadata); err != nil {
		t.Fatalf("unmarshal metadata: %v", err)
	}
	canonical, ok := metadata["theta_canonical"].(map[string]any)
	if !ok {
		t.Fatalf("theta_canonical metadata missing: %#v", metadata)
	}
	if canonical["source"] != "openclaw" {
		t.Fatalf("source = %#v, want openclaw", canonical["source"])
	}
}

func TestNormalizeCanonicalEnvelopeWithoutEventsCreatesRootStep(t *testing.T) {
	trace, err := NormalizeCanonicalEnvelope(&models.CanonicalEnvelope{
		Name: "batch-import",
		Kind: "workflow",
	}, "proj_test")
	if err != nil {
		t.Fatalf("NormalizeCanonicalEnvelope returned error: %v", err)
	}

	if len(trace.Steps) != 1 {
		t.Fatalf("steps len = %d, want 1", len(trace.Steps))
	}
	if trace.Steps[0].Name != "batch-import" {
		t.Fatalf("root step name = %q, want batch-import", trace.Steps[0].Name)
	}
}
