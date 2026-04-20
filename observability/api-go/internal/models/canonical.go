package models

import (
	"encoding/json"
	"time"
)

// CanonicalSchemaVersion is the public compatibility marker for generic,
// provider-neutral event ingest.
const CanonicalSchemaVersion = "1.0"

// CanonicalEnvelope is the versioned ingest contract for generic observability
// producers that do not emit Theta-native trace payloads directly.
type CanonicalEnvelope struct {
	SchemaVersion string           `json:"schema_version"`
	TraceID       string           `json:"trace_id,omitempty"`
	ProjectID     string           `json:"project_id,omitempty"`
	Name          string           `json:"name,omitempty"`
	Source        string           `json:"source,omitempty"`
	Kind          string           `json:"kind,omitempty"`
	RunID         string           `json:"run_id,omitempty"`
	RunType       string           `json:"run_type,omitempty"`
	UseCase       string           `json:"use_case,omitempty"`
	UserID        string           `json:"user_id,omitempty"`
	SessionID     string           `json:"session_id,omitempty"`
	Group         string           `json:"group,omitempty"`
	Platform      string           `json:"platform,omitempty"`
	Model         string           `json:"model,omitempty"`
	Status        string           `json:"status,omitempty"`
	Tags          []string         `json:"tags,omitempty"`
	Metadata      json.RawMessage  `json:"metadata,omitempty"`
	StartedAt     time.Time        `json:"started_at,omitempty"`
	EndedAt       time.Time        `json:"ended_at,omitempty"`
	LatencyMS     int64            `json:"latency_ms,omitempty"`
	CostUSD       float64          `json:"cost_usd,omitempty"`
	Correlation   *CorrelationInfo `json:"correlation,omitempty"`
	Events        []CanonicalEvent `json:"events,omitempty"`
	Attachments   []ContentPart    `json:"attachments,omitempty"`
}

type CorrelationInfo struct {
	SessionID     string          `json:"session_id,omitempty"`
	RequestID     string          `json:"request_id,omitempty"`
	ParentTraceID string          `json:"parent_trace_id,omitempty"`
	RootTraceID   string          `json:"root_trace_id,omitempty"`
	ExternalIDs   json.RawMessage `json:"external_ids,omitempty"`
}

type CanonicalEvent struct {
	EventID       string          `json:"event_id,omitempty"`
	ParentEventID string          `json:"parent_event_id,omitempty"`
	StepID        string          `json:"step_id,omitempty"`
	ParentStepID  string          `json:"parent_step_id,omitempty"`
	StepType      string          `json:"step_type,omitempty"`
	Index         int64           `json:"index,omitempty"`
	Type          string          `json:"type"`
	Name          string          `json:"name,omitempty"`
	Role          string          `json:"role,omitempty"`
	Status        string          `json:"status,omitempty"`
	Model         string          `json:"model,omitempty"`
	StartedAt     time.Time       `json:"started_at,omitempty"`
	EndedAt       time.Time       `json:"ended_at,omitempty"`
	LatencyMS     int64           `json:"latency_ms,omitempty"`
	Message       *Message        `json:"message,omitempty"`
	ToolCall      *ToolCall       `json:"tool_call,omitempty"`
	Attachment    *ContentPart    `json:"attachment,omitempty"`
	SensorFrame   *SensorFrame    `json:"sensor_frame,omitempty"`
	Value         json.RawMessage `json:"value,omitempty"`
	Metadata      json.RawMessage `json:"metadata,omitempty"`
}

type BulkImportResponse struct {
	Accepted int                    `json:"accepted"`
	Failed   int                    `json:"failed"`
	Items    []BulkImportItemResult `json:"items"`
}

type BulkImportItemResult struct {
	Index   int    `json:"index"`
	Kind    string `json:"kind"`
	TraceID string `json:"trace_id,omitempty"`
	Status  string `json:"status"`
	Error   string `json:"error,omitempty"`
}
