package models

import (
	"encoding/json"
	"time"
)

// APIError is the canonical error response body.
type APIError struct {
	Error APIErrorBody `json:"error"`
}

type APIErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// IngestResponse is returned for POST /v1/traces.
type IngestResponse struct {
	TraceID      string `json:"trace_id"`
	IngestStatus string `json:"ingest_status"`
	GCSURI       string `json:"gcs_uri,omitempty"`
}

// SignedURLRequest / SignedURLResponse — POST /v1/media/signed-url.
type SignedURLRequest struct {
	TraceID     string `json:"trace_id"`
	Filename    string `json:"filename"`
	ContentType string `json:"content_type"`
	SizeBytes   int64  `json:"size_bytes"`
}

type SignedURLResponse struct {
	URL       string    `json:"url"`
	GSURI     string    `json:"gs_uri"`
	ExpiresAt time.Time `json:"expires_at"`
}

// Project DTOs.
type Project struct {
	ID            string    `json:"id"`
	OrgID         string    `json:"org_id"`
	Name          string    `json:"name"`
	Slug          string    `json:"slug"`
	Description   *string   `json:"description,omitempty"`
	RetentionDays int       `json:"retention_days"`
	CreatedAt     time.Time `json:"created_at"`
}

type CreateProjectRequest struct {
	OrgID       string  `json:"org_id"`
	Name        string  `json:"name"`
	Slug        string  `json:"slug"`
	Description *string `json:"description,omitempty"`
}

type UpdateProjectRequest struct {
	Name          *string `json:"name,omitempty"`
	Slug          *string `json:"slug,omitempty"`
	Description   *string `json:"description,omitempty"`
	RetentionDays *int    `json:"retention_days,omitempty"`
}

// API Key DTOs.
type APIKey struct {
	ID         string     `json:"id"`
	ProjectID  string     `json:"project_id"`
	Name       string     `json:"name"`
	Prefix     string     `json:"prefix"`
	CreatedAt  time.Time  `json:"created_at"`
	RevokedAt  *time.Time `json:"revoked_at,omitempty"`
	LastUsedAt *time.Time `json:"last_used_at,omitempty"`
}

type CreateAPIKeyResponse struct {
	APIKey
	Plaintext string `json:"plaintext,omitempty"` // legacy field retained for compatibility
	Secret    string `json:"secret,omitempty"`    // returned only on create
}

// Org / auth.
type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	OrgName  string `json:"org_name"`
}

type SignupResponse struct {
	UserID string `json:"user_id"`
	OrgID  string `json:"org_id"`
	Email  string `json:"email"`
}

type CreateOrgRequest struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type Org struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	Plan      string    `json:"plan"`
	CreatedAt time.Time `json:"created_at"`
}

// Members + invites.
type Member struct {
	ID     string `json:"id"`
	OrgID  string `json:"org_id"`
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}

type InviteRequest struct {
	OrgID string `json:"org_id"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

type Invite struct {
	ID        string    `json:"id"`
	OrgID     string    `json:"org_id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	Token     string    `json:"token"`
	CreatedAt time.Time `json:"created_at"`
}

// Incident DTOs.
type Incident struct {
	ID           string    `json:"id"`
	ProjectID    string    `json:"project_id"`
	Title        string    `json:"title"`
	Summary      string    `json:"summary,omitempty"`
	Status       string    `json:"status"`
	RootCause    *string   `json:"root_cause,omitempty"`
	Severity     string    `json:"severity"`
	ErrorPattern string    `json:"error_pattern,omitempty"`
	FirstSeenAt  time.Time `json:"first_seen_at"`
	LastSeenAt   time.Time `json:"last_seen_at"`
	TraceCount   int       `json:"trace_count"`
	TraceIDs     []string  `json:"trace_ids,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

// Trace list response.
type TraceListItem struct {
	TraceID     string          `json:"trace_id"`
	ProjectID   string          `json:"project_id"`
	Name        string          `json:"name,omitempty"`
	RunID       string          `json:"run_id,omitempty"`
	RunType     string          `json:"run_type,omitempty"`
	UseCase     string          `json:"use_case,omitempty"`
	Group       string          `json:"group,omitempty"`
	Status      string          `json:"status"`
	Platform    string          `json:"platform,omitempty"`
	Model       string          `json:"model,omitempty"`
	UserID      string          `json:"user_id,omitempty"`
	Metadata    json.RawMessage `json:"metadata,omitempty"`
	StartedAt   time.Time       `json:"started_at"`
	LatencyMS   int64           `json:"latency_ms"`
	TotalTokens int64           `json:"total_tokens"`
	CostUSD     float64         `json:"cost_usd"`
	StepCount   int64           `json:"step_count"`
	HasMedia    bool            `json:"has_media"`
	Tags        []string        `json:"tags,omitempty"`
}

type TraceListResponse struct {
	Items      []TraceListItem `json:"items"`
	NextCursor string          `json:"next_cursor,omitempty"`
}

// Usage.
type UsageResponse struct {
	OrgID          string    `json:"org_id"`
	EventsIngested int64     `json:"events_ingested"`
	MediaBytes     int64     `json:"media_bytes"`
	APIRequests    int64     `json:"api_requests"`
	PeriodStart    time.Time `json:"period_start"`
	PeriodEnd      time.Time `json:"period_end"`
}

// Semantic search.
type SearchRequest struct {
	Query     string `json:"query"`
	ProjectID string `json:"project_id"`
	Limit     int    `json:"limit"`
}

type SearchResult struct {
	TraceID   string   `json:"trace_id"`
	Name      string   `json:"name"`
	Status    string   `json:"status"`
	Score     float64  `json:"score"`
	UserID    string   `json:"user_id,omitempty"`
	StartedAt string   `json:"started_at,omitempty"`
	Tags      []string `json:"tags,omitempty"`
}

type SearchResponse struct {
	Results []SearchResult `json:"results"`
	Query   string         `json:"query"`
}

// Metrics.
type Metric struct {
	ID              string    `json:"id"`
	ProjectID       string    `json:"project_id"`
	Name            string    `json:"name"`
	Type            string    `json:"type"`
	EvaluatorPrompt *string   `json:"evaluator_prompt,omitempty"`
	Description     *string   `json:"description,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

type MetricEvent struct {
	ID          string    `json:"id"`
	MetricID    string    `json:"metric_id"`
	MetricName  string    `json:"metric_name,omitempty"`
	TraceID     string    `json:"trace_id"`
	Passed      *bool     `json:"passed,omitempty"`
	Score       *float64  `json:"score,omitempty"`
	Label       *string   `json:"label,omitempty"`
	EvaluatedAt time.Time `json:"evaluated_at"`
}

// Cluster DTOs.
type Cluster struct {
	ID                    string              `json:"id"`
	ProjectID             string              `json:"project_id"`
	Label                 string              `json:"label"`
	Description           string              `json:"description,omitempty"`
	Category              string              `json:"category"`
	TraceCount            int                 `json:"trace_count"`
	RepresentativeTraceID string              `json:"representative_trace_id,omitempty"`
	FirstSeenAt           time.Time           `json:"first_seen_at"`
	LastSeenAt            time.Time           `json:"last_seen_at"`
	CreatedAt             time.Time           `json:"created_at"`
	Traces                []ClusterTraceEntry `json:"traces,omitempty"`
}

type ClusterTraceEntry struct {
	TraceID  string  `json:"trace_id"`
	Distance float64 `json:"distance"`
}

type DiscoverRequest struct {
	ProjectID string `json:"project_id"`
}

// Annotations.
type Annotation struct {
	ID             string    `json:"id"`
	TraceID        string    `json:"trace_id"`
	StepID         *string   `json:"step_id,omitempty"`
	ProjectID      string    `json:"project_id"`
	Label          *string   `json:"label,omitempty"`
	Score          *float64  `json:"score,omitempty"`
	Comment        *string   `json:"comment,omitempty"`
	AnnotationType string    `json:"annotation_type"`
	UserID         *string   `json:"user_id,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

// Saved filters.
type SavedFilter struct {
	ID          string          `json:"id"`
	ProjectID   string          `json:"project_id"`
	Name        string          `json:"name"`
	Description *string         `json:"description,omitempty"`
	Filters     json.RawMessage `json:"filters"`
	Color       *string         `json:"color,omitempty"`
	IsDefault   bool            `json:"is_default"`
	CreatedBy   *string         `json:"created_by,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
}

type CreateSavedFilterRequest struct {
	Name        string          `json:"name"`
	Description *string         `json:"description,omitempty"`
	Filters     json.RawMessage `json:"filters"`
	Color       *string         `json:"color,omitempty"`
	IsDefault   *bool           `json:"is_default,omitempty"`
}

type UpdateSavedFilterRequest struct {
	Name        *string          `json:"name,omitempty"`
	Description *string          `json:"description,omitempty"`
	Filters     *json.RawMessage `json:"filters,omitempty"`
	Color       *string          `json:"color,omitempty"`
	IsDefault   *bool            `json:"is_default,omitempty"`
}

// Webhooks.
type Webhook struct {
	ID                 string     `json:"id"`
	ProjectID          string     `json:"project_id"`
	URL                string     `json:"url"`
	Events             []string   `json:"events"`
	Active             bool       `json:"active"`
	LastDeliveryAt     *time.Time `json:"last_delivery_at,omitempty"`
	LastDeliveryStatus *int       `json:"last_delivery_status,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
}

type CreateWebhookRequest struct {
	URL    string   `json:"url"`
	Events []string `json:"events,omitempty"`
	Active *bool    `json:"active,omitempty"`
}

type UpdateWebhookRequest struct {
	URL    *string  `json:"url,omitempty"`
	Events []string `json:"events,omitempty"`
	Active *bool    `json:"active,omitempty"`
}

type CreateWebhookResponse struct {
	Webhook
	Secret string `json:"secret"`
}

// Conversation threads.
type ConversationThread struct {
	ID         string          `json:"id"`
	ProjectID  string          `json:"project_id"`
	Title      string          `json:"title"`
	ExternalID *string         `json:"external_id,omitempty"`
	UserID     *string         `json:"user_id,omitempty"`
	SessionID  *string         `json:"session_id,omitempty"`
	Metadata   json.RawMessage `json:"metadata,omitempty"`
	TraceIDs   []string        `json:"trace_ids,omitempty"`
	TraceCount int             `json:"trace_count"`
	CreatedBy  *string         `json:"created_by,omitempty"`
	CreatedAt  time.Time       `json:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at"`
}

type CreateConversationThreadRequest struct {
	Title      string          `json:"title"`
	ExternalID *string         `json:"external_id,omitempty"`
	UserID     *string         `json:"user_id,omitempty"`
	SessionID  *string         `json:"session_id,omitempty"`
	Metadata   json.RawMessage `json:"metadata,omitempty"`
	TraceIDs   []string        `json:"trace_ids,omitempty"`
}

type UpdateConversationThreadRequest struct {
	Title      *string          `json:"title,omitempty"`
	ExternalID *string          `json:"external_id,omitempty"`
	UserID     *string          `json:"user_id,omitempty"`
	SessionID  *string          `json:"session_id,omitempty"`
	Metadata   *json.RawMessage `json:"metadata,omitempty"`
	TraceIDs   *[]string        `json:"trace_ids,omitempty"`
}

// Monitor configs.
type MonitorConfig struct {
	ID                string          `json:"id"`
	ProjectID         string          `json:"project_id"`
	Name              string          `json:"name"`
	Description       *string         `json:"description,omitempty"`
	SignalKey         string          `json:"signal_key"`
	Operator          string          `json:"operator"`
	WarnThreshold     *float64        `json:"warn_threshold,omitempty"`
	CriticalThreshold *float64        `json:"critical_threshold,omitempty"`
	WindowMinutes     int             `json:"window_minutes"`
	GroupBy           *string         `json:"group_by,omitempty"`
	Filters           json.RawMessage `json:"filters,omitempty"`
	Active            bool            `json:"active"`
	CreatedBy         *string         `json:"created_by,omitempty"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
}

type CreateMonitorConfigRequest struct {
	Name              string          `json:"name"`
	Description       *string         `json:"description,omitempty"`
	SignalKey         string          `json:"signal_key"`
	Operator          string          `json:"operator"`
	WarnThreshold     *float64        `json:"warn_threshold,omitempty"`
	CriticalThreshold *float64        `json:"critical_threshold,omitempty"`
	WindowMinutes     *int            `json:"window_minutes,omitempty"`
	GroupBy           *string         `json:"group_by,omitempty"`
	Filters           json.RawMessage `json:"filters,omitempty"`
	Active            *bool           `json:"active,omitempty"`
}

type UpdateMonitorConfigRequest struct {
	Name              *string          `json:"name,omitempty"`
	Description       *string          `json:"description,omitempty"`
	SignalKey         *string          `json:"signal_key,omitempty"`
	Operator          *string          `json:"operator,omitempty"`
	WarnThreshold     *float64         `json:"warn_threshold,omitempty"`
	CriticalThreshold *float64         `json:"critical_threshold,omitempty"`
	WindowMinutes     *int             `json:"window_minutes,omitempty"`
	GroupBy           *string          `json:"group_by,omitempty"`
	Filters           *json.RawMessage `json:"filters,omitempty"`
	Active            *bool            `json:"active,omitempty"`
}
