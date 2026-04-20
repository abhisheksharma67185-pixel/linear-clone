package ingest

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/embeddings"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/gcs"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ids"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/sse"
)

// Pipeline performs: validate -> GCS put -> BQ enqueue -> SSE publish -> embed.
type Pipeline struct {
	GCS      *gcs.Client
	BQ       *bq.Writer
	Hub      *sse.Hub
	Embedder *embeddings.EmbeddingWorker
	Log      *slog.Logger
}

// Ingest runs the full pipeline synchronously through the GCS upload, then
// fire-and-forgets the BQ append so the client sees low p50 latency.
func (p *Pipeline) Ingest(ctx context.Context, orgID string, t *models.Trace) (*models.IngestResponse, error) {
	if err := validate(t); err != nil {
		return nil, fmt.Errorf("validate: %w", err)
	}
	if t.TraceID == "" {
		t.TraceID = ids.Trace()
	}
	if t.SchemaVersion == "" {
		t.SchemaVersion = "1.0"
	}
	if t.StartedAt.IsZero() {
		t.StartedAt = time.Now().UTC()
	}
	if t.Status == "" {
		t.Status = "success"
	}

	// 1) GCS upload of raw JSON
	objectKey := gcs.TraceObjectKey(orgID, t.ProjectID, t.TraceID)
	buf, err := json.Marshal(t)
	if err != nil {
		return nil, fmt.Errorf("marshal trace: %w", err)
	}
	if err := p.GCS.Put(ctx, objectKey, bytes.NewReader(buf), "application/json"); err != nil {
		return nil, fmt.Errorf("gcs put: %w", err)
	}
	gcsURI := p.GCS.GSURI(objectKey)

	// 2) BQ rows (append; writer flushes on 100 rows / 500ms)
	p.BQ.Append("traces", buildTraceRow(t, orgID, gcsURI))
	for _, s := range t.Steps {
		p.BQ.Append("steps", buildStepRow(t, &s))
	}

	// 3) SSE publish for live-tail onboarding
	p.Hub.Publish(t.TraceID, buf)

	// 4) Embedding (non-blocking)
	if p.Embedder != nil && p.Embedder.Enabled() {
		traceBuf := make([]byte, len(buf))
		copy(traceBuf, buf)
		go p.Embedder.EmbedTrace(context.Background(), t.TraceID, t.ProjectID, traceBuf)
	}

	p.Log.Info("trace ingested",
		"trace_id", t.TraceID, "project_id", t.ProjectID,
		"steps", len(t.Steps), "has_media", t.HasMedia())

	return &models.IngestResponse{
		TraceID:      t.TraceID,
		IngestStatus: "accepted",
		GCSURI:       gcsURI,
	}, nil
}

func validate(t *models.Trace) error {
	if t == nil {
		return errors.New("trace is nil")
	}
	if t.ProjectID == "" {
		return errors.New("project_id required")
	}
	return nil
}

// BuildStepRowExported exposes buildStepRow so the /steps handler can enqueue
// additional steps outside the full ingest path.
func BuildStepRowExported(t *models.Trace, s *models.Step) bq.Row {
	return buildStepRow(t, s)
}

func buildTraceRow(t *models.Trace, orgID, gcsURI string) bq.Row {
	var input, output, total int64
	if t.TokenUsage != nil {
		input = t.TokenUsage.Input
		output = t.TokenUsage.Output
		total = t.TokenUsage.Total
	}
	tags := t.Tags
	if tags == nil {
		tags = []string{}
	}
	ingestDate := t.StartedAt.UTC().Format("2006-01-02")
	return bq.Row{
		InsertID: t.TraceID,
		Data: map[string]bigquery.Value{
			"trace_id":       t.TraceID,
			"project_id":     t.ProjectID,
			"org_id":         orgID,
			"ingest_date":    ingestDate,
			"name":           t.Name,
			"run_id":         t.RunID,
			"run_type":       t.RunType,
			"use_case":       t.UseCase,
			"group":          t.Group,
			"platform":       t.Platform,
			"model":          t.Model,
			"user_id":        t.UserID,
			"status":         t.Status,
			"error_message":  t.ErrorMessage,
			"started_at":     t.StartedAt,
			"ended_at":       t.EndedAt,
			"latency_ms":     t.LatencyMS,
			"input_tokens":   input,
			"output_tokens":  output,
			"total_tokens":   total,
			"cost_usd":       t.CostUSD,
			"tags":           tags,
			"metadata":       string(t.Metadata),
			"step_count":     int64(len(t.Steps)),
			"has_media":      t.HasMedia(),
			"gcs_uri":        gcsURI,
			"schema_version": t.SchemaVersion,
		},
	}
}

func buildStepRow(t *models.Trace, s *models.Step) bq.Row {
	ingestDate := t.StartedAt.UTC().Format("2006-01-02")
	msgCount := len(s.Messages)
	toolCount := len(s.ToolCalls)
	modalities := s.ModalitySet()
	if modalities == nil {
		modalities = []string{}
	}
	return bq.Row{
		InsertID: t.TraceID + ":" + s.StepID,
		Data: map[string]bigquery.Value{
			"trace_id":         t.TraceID,
			"step_id":          s.StepID,
			"parent_step_id":   s.ParentStepID,
			"index":            s.Index,
			"project_id":       t.ProjectID,
			"ingest_date":      ingestDate,
			"type":             s.Type,
			"name":             s.Name,
			"model":            s.Model,
			"status":           s.Status,
			"started_at":       s.StartedAt,
			"ended_at":         s.EndedAt,
			"latency_ms":       s.LatencyMS,
			"input_tokens":     s.InputTokens,
			"output_tokens":    s.OutputTokens,
			"message_count":    int64(msgCount),
			"tool_call_count":  int64(toolCount),
			"attachment_count": int64(s.AttachmentCount()),
			"modalities":       modalities,
			"metadata":         string(s.Metadata),
		},
	}
}
