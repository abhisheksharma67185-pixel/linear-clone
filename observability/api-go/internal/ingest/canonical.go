package ingest

import (
	"encoding/json"
	"errors"
	"sort"
	"strings"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ids"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

// NormalizeCanonicalEnvelope maps the generic event ingest contract into the
// existing Theta trace model so the current storage and dashboard layers can
// ingest non-SDK producers without a separate persistence path.
func NormalizeCanonicalEnvelope(env *models.CanonicalEnvelope, projectID string) (*models.Trace, error) {
	if env == nil {
		return nil, errors.New("envelope is nil")
	}
	if projectID == "" && env.ProjectID == "" {
		return nil, errors.New("project_id required")
	}

	traceID := env.TraceID
	if traceID == "" {
		traceID = ids.Trace()
	}
	traceProjectID := projectID
	if traceProjectID == "" {
		traceProjectID = env.ProjectID
	}

	trace := &models.Trace{
		SchemaVersion: models.CanonicalSchemaVersion,
		TraceID:       traceID,
		ProjectID:     traceProjectID,
		Name:          firstNonEmpty(env.Name, env.Kind, env.Source, "canonical-ingest"),
		RunID:         env.RunID,
		RunType:       env.RunType,
		UseCase:       env.UseCase,
		UserID:        env.UserID,
		Group:         env.Group,
		Platform:      env.Platform,
		Model:         env.Model,
		Status:        normalizeStatus(env.Status),
		StartedAt:     env.StartedAt.UTC(),
		EndedAt:       env.EndedAt.UTC(),
		LatencyMS:     env.LatencyMS,
		CostUSD:       env.CostUSD,
		Tags:          append([]string(nil), env.Tags...),
		Attachments:   append([]models.ContentPart(nil), env.Attachments...),
	}

	if trace.SchemaVersion == "" {
		trace.SchemaVersion = models.CanonicalSchemaVersion
	}

	trace.Metadata = normalizedTraceMetadata(env)
	trace.Events = make([]models.ObservedEvent, 0, len(env.Events))

	stepsByID := map[string]*models.Step{}
	stepOrder := []string{}
	rootStepID := ""
	nextIndex := int64(0)

	for i, event := range env.Events {
		observed := toObservedEvent(event)
		if observed.Index == 0 {
			observed.Index = int64(i)
		}
		trace.Events = append(trace.Events, observed)

		stepID := event.StepID
		if stepID == "" && event.Type == "span" && event.EventID != "" {
			stepID = ids.Step()
		}
		if stepID == "" {
			if rootStepID == "" {
				rootStepID = ids.Step()
			}
			stepID = rootStepID
			observed.StepID = stepID
			trace.Events[len(trace.Events)-1].StepID = stepID
		}
		if observed.StepID == "" {
			observed.StepID = stepID
			trace.Events[len(trace.Events)-1].StepID = stepID
		}

		step, ok := stepsByID[stepID]
		if !ok {
			step = &models.Step{
				StepID:       stepID,
				ParentStepID: event.ParentStepID,
				Index:        nextIndex,
				Type:         normalizeStepType(event.StepType, event.Type),
				Name:         firstNonEmpty(event.Name, env.Kind, "step"),
				Model:        firstNonEmpty(event.Model, env.Model),
				Status:       normalizeStatus(event.Status),
				StartedAt:    timestampOrZero(event.StartedAt),
				EndedAt:      timestampOrZero(event.EndedAt),
				LatencyMS:    event.LatencyMS,
				Metadata:     json.RawMessage("{}"),
			}
			nextIndex++
			stepsByID[stepID] = step
			stepOrder = append(stepOrder, stepID)
		}
		mergeEventIntoStep(step, &event, observed)
	}

	if len(stepOrder) == 0 {
		step := models.Step{
			StepID:    ids.Step(),
			Index:     0,
			Type:      normalizeStepType(env.Kind, "span"),
			Name:      trace.Name,
			Model:     trace.Model,
			Status:    trace.Status,
			StartedAt: timestampOrZero(trace.StartedAt),
			EndedAt:   timestampOrZero(trace.EndedAt),
			Metadata:  json.RawMessage("{}"),
		}
		trace.Steps = []models.Step{step}
	} else {
		trace.Steps = make([]models.Step, 0, len(stepOrder))
		for _, stepID := range stepOrder {
			step := stepsByID[stepID]
			finalizeStep(step)
			trace.Steps = append(trace.Steps, *step)
		}
		sort.SliceStable(trace.Steps, func(i, j int) bool {
			if trace.Steps[i].StartedAt.Equal(trace.Steps[j].StartedAt) {
				return trace.Steps[i].Index < trace.Steps[j].Index
			}
			if trace.Steps[i].StartedAt.IsZero() {
				return false
			}
			if trace.Steps[j].StartedAt.IsZero() {
				return true
			}
			return trace.Steps[i].StartedAt.Before(trace.Steps[j].StartedAt)
		})
	}

	finalizeTrace(trace)
	return trace, nil
}

func toObservedEvent(event models.CanonicalEvent) models.ObservedEvent {
	return models.ObservedEvent{
		EventID:       event.EventID,
		ParentEventID: event.ParentEventID,
		StepID:        event.StepID,
		ParentStepID:  event.ParentStepID,
		Index:         event.Index,
		Type:          event.Type,
		Name:          event.Name,
		Role:          event.Role,
		Status:        normalizeStatus(event.Status),
		StartedAt:     timestampOrZero(event.StartedAt),
		EndedAt:       timestampOrZero(event.EndedAt),
		LatencyMS:     event.LatencyMS,
		Model:         event.Model,
		Message:       event.Message,
		ToolCall:      event.ToolCall,
		Attachment:    event.Attachment,
		SensorFrame:   event.SensorFrame,
		Value:         normalizeRawJSON(event.Value),
		Metadata:      normalizeRawJSON(event.Metadata),
	}
}

func mergeEventIntoStep(step *models.Step, event *models.CanonicalEvent, observed models.ObservedEvent) {
	step.Events = append(step.Events, observed)

	if step.ParentStepID == "" {
		step.ParentStepID = event.ParentStepID
	}
	if step.Name == "" {
		step.Name = firstNonEmpty(event.Name, step.Name, "step")
	}
	if step.Type == "" {
		step.Type = normalizeStepType(event.StepType, event.Type)
	}
	if step.Model == "" {
		step.Model = event.Model
	}
	if step.Status == "" || step.Status == "running" {
		step.Status = normalizeStatus(event.Status)
	}
	if step.StartedAt.IsZero() && !event.StartedAt.IsZero() {
		step.StartedAt = event.StartedAt.UTC()
	}
	if !event.EndedAt.IsZero() && (step.EndedAt.IsZero() || step.EndedAt.Before(event.EndedAt)) {
		step.EndedAt = event.EndedAt.UTC()
	}
	if event.LatencyMS > 0 && step.LatencyMS == 0 {
		step.LatencyMS = event.LatencyMS
	}
	if len(event.Metadata) > 0 {
		step.Metadata = normalizeRawJSON(event.Metadata)
	}
	if event.Message != nil {
		step.Messages = append(step.Messages, *event.Message)
	}
	if event.ToolCall != nil {
		step.ToolCalls = append(step.ToolCalls, *event.ToolCall)
	}
	if event.Attachment != nil {
		step.Attachments = append(step.Attachments, *event.Attachment)
	}
	if event.SensorFrame != nil {
		step.SensorFrames = append(step.SensorFrames, *event.SensorFrame)
	}
}

func finalizeStep(step *models.Step) {
	if step.Type == "" {
		step.Type = "custom"
	}
	if step.Status == "" {
		step.Status = "success"
	}
	if step.Name == "" {
		step.Name = "step"
	}
	if step.Metadata == nil {
		step.Metadata = json.RawMessage("{}")
	}
	if step.LatencyMS == 0 && !step.StartedAt.IsZero() && !step.EndedAt.IsZero() {
		step.LatencyMS = step.EndedAt.Sub(step.StartedAt).Milliseconds()
	}
}

func finalizeTrace(trace *models.Trace) {
	if trace.Status == "" {
		trace.Status = "success"
	}
	if trace.StartedAt.IsZero() {
		for _, step := range trace.Steps {
			if !step.StartedAt.IsZero() && (trace.StartedAt.IsZero() || step.StartedAt.Before(trace.StartedAt)) {
				trace.StartedAt = step.StartedAt
			}
		}
	}
	if trace.EndedAt.IsZero() {
		for _, step := range trace.Steps {
			if !step.EndedAt.IsZero() && (trace.EndedAt.IsZero() || step.EndedAt.After(trace.EndedAt)) {
				trace.EndedAt = step.EndedAt
			}
		}
	}
	if trace.LatencyMS == 0 && !trace.StartedAt.IsZero() && !trace.EndedAt.IsZero() {
		trace.LatencyMS = trace.EndedAt.Sub(trace.StartedAt).Milliseconds()
	}
	if trace.Metadata == nil {
		trace.Metadata = json.RawMessage("{}")
	}
}

func normalizedTraceMetadata(env *models.CanonicalEnvelope) json.RawMessage {
	base := map[string]any{}
	if len(env.Metadata) > 0 {
		_ = json.Unmarshal(env.Metadata, &base)
	}
	canonical := map[string]any{}
	if env.Source != "" {
		canonical["source"] = env.Source
	}
	if env.Kind != "" {
		canonical["kind"] = env.Kind
	}
	if env.SessionID != "" {
		canonical["session_id"] = env.SessionID
	}
	if env.Correlation != nil {
		correlation := map[string]any{}
		if env.Correlation.SessionID != "" {
			correlation["session_id"] = env.Correlation.SessionID
		}
		if env.Correlation.RequestID != "" {
			correlation["request_id"] = env.Correlation.RequestID
		}
		if env.Correlation.ParentTraceID != "" {
			correlation["parent_trace_id"] = env.Correlation.ParentTraceID
		}
		if env.Correlation.RootTraceID != "" {
			correlation["root_trace_id"] = env.Correlation.RootTraceID
		}
		if len(env.Correlation.ExternalIDs) > 0 {
			var external any
			if json.Unmarshal(env.Correlation.ExternalIDs, &external) == nil {
				correlation["external_ids"] = external
			}
		}
		if len(correlation) > 0 {
			canonical["correlation"] = correlation
		}
	}
	if len(canonical) > 0 {
		base["theta_canonical"] = canonical
	}
	raw, err := json.Marshal(base)
	if err != nil {
		return json.RawMessage("{}")
	}
	return raw
}

func normalizeStatus(status string) string {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "success", "ok", "completed", "done":
		return "success"
	case "error", "failed", "failure":
		return "error"
	case "running", "in_progress", "started":
		return "running"
	case "cancelled", "canceled":
		return "cancelled"
	default:
		return strings.ToLower(strings.TrimSpace(status))
	}
}

func normalizeStepType(stepType, eventType string) string {
	switch strings.ToLower(strings.TrimSpace(firstNonEmpty(stepType, eventType))) {
	case "llm", "tool", "retrieval", "robotics", "human", "annotation", "custom":
		return strings.ToLower(strings.TrimSpace(firstNonEmpty(stepType, eventType)))
	case "message":
		return "llm"
	case "action", "span", "event", "artifact":
		return "custom"
	default:
		return "custom"
	}
}

func normalizeRawJSON(raw json.RawMessage) json.RawMessage {
	if len(raw) == 0 {
		return nil
	}
	return append(json.RawMessage(nil), raw...)
}

func timestampOrZero(ts time.Time) time.Time {
	if ts.IsZero() {
		return time.Time{}
	}
	return ts.UTC()
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}
