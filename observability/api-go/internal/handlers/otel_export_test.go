package handlers

import (
	"testing"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

func TestBuildOTLPJSONIncludesTraceAndStepSpans(t *testing.T) {
	start := time.Date(2026, 4, 19, 10, 0, 0, 0, time.UTC)
	end := start.Add(2 * time.Second)
	trace := models.Trace{
		TraceID:    "tr_demo",
		ProjectID:  "proj_demo",
		Name:       "desktop-run",
		Status:     "success",
		StartedAt:  start,
		EndedAt:    end,
		RunType:    "desktop",
		Platform:   "desktop",
		Steps: []models.Step{
			{
				StepID:    "st_1",
				Index:     0,
				Type:      "tool",
				Name:      "click",
				Status:    "success",
				StartedAt: start,
				EndedAt:   start.Add(500 * time.Millisecond),
				Events: []models.ObservedEvent{
					{
						Type:      "artifact",
						Name:      "desktop_screenshot",
						StartedAt: start.Add(400 * time.Millisecond),
						Attachment: &models.ContentPart{
							Type: "image",
							URI:  "gs://theta-obs-dev/example.png",
						},
					},
				},
			},
		},
	}
	project := &models.Project{ID: "proj_demo", OrgID: "org_demo", Name: "Demo"}

	body := buildOTLPJSON(project, []models.Trace{trace})
	resourceSpans := body["resourceSpans"].([]map[string]any)
	scopeSpans := resourceSpans[0]["scopeSpans"].([]map[string]any)
	spans := scopeSpans[0]["spans"].([]map[string]any)

	if len(spans) != 2 {
		t.Fatalf("span count = %d, want 2", len(spans))
	}
	if spans[0]["name"] != "desktop-run" {
		t.Fatalf("root span name = %v", spans[0]["name"])
	}
	stepEvents := spans[1]["events"].([]map[string]any)
	if len(stepEvents) != 1 {
		t.Fatalf("step events len = %d, want 1", len(stepEvents))
	}
	if stepEvents[0]["name"] != "desktop_screenshot" {
		t.Fatalf("step event name = %v", stepEvents[0]["name"])
	}
}
