package models

import (
	"encoding/json"
	"time"
)

// Trace mirrors the JSON Schema at observability/schema/trace.schema.json.
type Trace struct {
	SchemaVersion string            `json:"schema_version"`
	TraceID       string            `json:"trace_id"`
	ProjectID     string            `json:"project_id"`
	Name          string            `json:"name,omitempty"`
	RunID         string            `json:"run_id,omitempty"`
	RunType       string            `json:"run_type,omitempty"`
	UseCase       string            `json:"use_case,omitempty"`
	UserID        string            `json:"user_id,omitempty"`
	Group         string            `json:"group,omitempty"`
	Platform      string            `json:"platform,omitempty"`
	Model         string            `json:"model,omitempty"`
	Status        string            `json:"status,omitempty"`
	ErrorMessage  string            `json:"error_message,omitempty"`
	Tags          []string          `json:"tags,omitempty"`
	Metadata      json.RawMessage   `json:"metadata,omitempty"`
	StartedAt     time.Time         `json:"started_at,omitempty"`
	EndedAt       time.Time         `json:"ended_at,omitempty"`
	LatencyMS     int64             `json:"latency_ms,omitempty"`
	TokenUsage    *TokenUsage       `json:"token_usage,omitempty"`
	CostUSD       float64           `json:"cost_usd,omitempty"`
	Steps         []Step            `json:"steps,omitempty"`
}

type TokenUsage struct {
	Input  int64 `json:"input"`
	Output int64 `json:"output"`
	Total  int64 `json:"total"`
}

type Step struct {
	StepID        string            `json:"step_id"`
	ParentStepID  string            `json:"parent_step_id,omitempty"`
	Index         int64             `json:"index"`
	Type          string            `json:"type"`
	Name          string            `json:"name,omitempty"`
	Model         string            `json:"model,omitempty"`
	Status        string            `json:"status,omitempty"`
	StartedAt     time.Time         `json:"started_at,omitempty"`
	EndedAt       time.Time         `json:"ended_at,omitempty"`
	LatencyMS     int64             `json:"latency_ms,omitempty"`
	InputTokens   int64             `json:"input_tokens,omitempty"`
	OutputTokens  int64             `json:"output_tokens,omitempty"`
	Messages      []Message         `json:"messages,omitempty"`
	ToolCalls     []ToolCall        `json:"tool_calls,omitempty"`
	SensorFrames  []SensorFrame     `json:"sensor_frames,omitempty"`
	Metadata      json.RawMessage   `json:"metadata,omitempty"`
}

type Message struct {
	Role    string            `json:"role"`
	Content []ContentPart     `json:"content"`
}

type ContentPart struct {
	Type   string `json:"type"`
	Text   string `json:"text,omitempty"`
	URI    string `json:"uri,omitempty"`
	Mime   string `json:"mime,omitempty"`
	Width  int    `json:"width,omitempty"`
	Height int    `json:"height,omitempty"`
}

type ToolCall struct {
	ID        string          `json:"id"`
	Name      string          `json:"name"`
	Arguments json.RawMessage `json:"arguments,omitempty"`
	Result    json.RawMessage `json:"result,omitempty"`
}

type SensorFrame struct {
	Modality string  `json:"modality"`
	URI      string  `json:"uri"`
	FPS      float64 `json:"fps,omitempty"`
	Mime     string  `json:"mime,omitempty"`
}

// ModalitySet returns the de-duplicated list of modalities used across
// messages/attachments/sensor frames in a step.
func (s *Step) ModalitySet() []string {
	seen := map[string]struct{}{}
	for _, m := range s.Messages {
		for _, c := range m.Content {
			if c.Type != "" {
				seen[c.Type] = struct{}{}
			}
		}
	}
	for _, sf := range s.SensorFrames {
		if sf.Modality != "" {
			seen[sf.Modality] = struct{}{}
		}
	}
	out := make([]string, 0, len(seen))
	for k := range seen {
		out = append(out, k)
	}
	return out
}

// AttachmentCount returns total attachment-like content parts in a step.
func (s *Step) AttachmentCount() int {
	n := 0
	for _, m := range s.Messages {
		for _, c := range m.Content {
			if c.URI != "" {
				n++
			}
		}
	}
	return n + len(s.SensorFrames)
}

// HasMedia reports whether any step references media URIs or sensor frames.
func (t *Trace) HasMedia() bool {
	for _, s := range t.Steps {
		if s.AttachmentCount() > 0 {
			return true
		}
	}
	return false
}
