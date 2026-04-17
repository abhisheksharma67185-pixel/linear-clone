package incidents

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/theagi/theta-observability/api-go/internal/bq"
	"github.com/theagi/theta-observability/api-go/internal/store"
	"google.golang.org/api/iterator"
)

// Detector scans for recent error traces and groups them into incidents.
type Detector struct {
	Store        *store.Store
	BQ           *bq.Writer
	AnthropicKey string // for root cause generation
	Log          *slog.Logger
	ProjectID    string // BQ project
	Dataset      string // BQ dataset
}

// errorTrace represents a trace row returned from BQ with an error status.
type errorTrace struct {
	TraceID      string `bigquery:"trace_id"`
	ProjectID    string `bigquery:"project_id"`
	ErrorMessage string `bigquery:"error_message"`
	Name         string `bigquery:"name"`
	Model        string `bigquery:"model"`
	Platform     string `bigquery:"platform"`
}

// DetectIncidents scans for recent error traces and groups them into incidents.
func (d *Detector) DetectIncidents(ctx context.Context, projectID string) error {
	traces, err := d.queryRecentErrors(ctx, projectID)
	if err != nil {
		return fmt.Errorf("query recent errors: %w", err)
	}
	if len(traces) == 0 {
		d.Log.Info("no recent error traces found", "project_id", projectID)
		return nil
	}

	groups := groupByPattern(traces)

	for pattern, group := range groups {
		if len(group) < 2 {
			continue
		}

		traceIDs := make([]string, len(group))
		for i, t := range group {
			traceIDs[i] = t.TraceID
		}

		existing, err := d.Store.FindIncidentByPattern(ctx, projectID, pattern)
		if err != nil {
			d.Log.Error("find incident by pattern", "err", err, "pattern", pattern)
			continue
		}

		if existing != nil {
			if err := d.Store.AddTracesToIncident(ctx, existing.ID, traceIDs); err != nil {
				d.Log.Error("add traces to incident", "err", err, "incident_id", existing.ID)
			}
			continue
		}

		title := buildTitle(group[0])
		inc, err := d.Store.CreateIncident(ctx, projectID, title, pattern, traceIDs)
		if err != nil {
			d.Log.Error("create incident", "err", err, "pattern", pattern)
			continue
		}
		d.Log.Info("created incident", "incident_id", inc.ID, "traces", len(traceIDs))

		// Generate root cause analysis asynchronously.
		if d.AnthropicKey != "" {
			go d.analyzeRootCause(context.Background(), inc.ID, group)
		}
	}

	return nil
}

// queryRecentErrors fetches traces with status="error" from the last hour
// that are not already linked to an incident.
func (d *Detector) queryRecentErrors(ctx context.Context, projectID string) ([]errorTrace, error) {
	since := time.Now().Add(-1 * time.Hour)

	existingIDs, err := d.existingTraceIDs(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("existing trace ids: %w", err)
	}

	// Build query — avoid UNNEST for BQ emulator compatibility.
	baseSQL := fmt.Sprintf(`
		SELECT t.trace_id, t.project_id,
		       COALESCE(t.error_message, '') AS error_message,
		       COALESCE(t.name, '') AS name,
		       COALESCE(t.model, '') AS model,
		       COALESCE(t.platform, '') AS platform
		FROM `+"`%s.%s.traces`"+` t
		WHERE t.project_id = @project_id
		  AND t.status = 'error'
		  AND t.started_at >= @since
		ORDER BY t.started_at DESC
		LIMIT 500
	`, d.ProjectID, d.Dataset)
	q := d.BQ.Client().Query(baseSQL)
	q.Parameters = []bigquery.QueryParameter{
		{Name: "project_id", Value: projectID},
		{Name: "since", Value: since},
	}
	// Post-filter existing IDs in Go (simpler than UNNEST param issues on emulators).
	existingSet := make(map[string]bool, len(existingIDs))
	for _, id := range existingIDs {
		existingSet[id] = true
	}

	it, err := q.Read(ctx)
	if err != nil {
		return nil, fmt.Errorf("bq query: %w", err)
	}

	var out []errorTrace
	for {
		var row errorTrace
		if err := it.Next(&row); err == iterator.Done {
			break
		} else if err != nil {
			return nil, fmt.Errorf("bq scan: %w", err)
		}
		if !existingSet[row.TraceID] {
			out = append(out, row)
		}
	}
	return out, nil
}

// existingTraceIDs returns trace IDs already linked to incidents for this project.
func (d *Detector) existingTraceIDs(ctx context.Context, projectID string) ([]string, error) {
	q := d.BQ.Client().Query(fmt.Sprintf(`
		SELECT DISTINCT it.trace_id
		FROM `+"`%s.%s.traces`"+` t
		WHERE t.project_id = @project_id
		  AND t.status = 'error'
		  AND t.started_at >= @since
	`, d.ProjectID, d.Dataset))
	// We can't query PG from BQ, so instead we'll query PG for all incident trace IDs.
	// This is a simpler approach: get all incident_traces for this project's open incidents.
	rows, err := d.Store.Pool.Query(ctx, `
		SELECT it.trace_id FROM incident_traces it
		JOIN incidents i ON i.id = it.incident_id
		WHERE i.project_id = $1 AND i.status IN ('open','investigating')
	`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	_ = q // suppress unused warning — we replaced BQ approach with PG query
	return ids, rows.Err()
}

// groupByPattern groups error traces by the first 100 chars of their error message.
func groupByPattern(traces []errorTrace) map[string][]errorTrace {
	groups := make(map[string][]errorTrace)
	for _, t := range traces {
		pattern := normalizePattern(t.ErrorMessage)
		groups[pattern] = append(groups[pattern], t)
	}
	return groups
}

// normalizePattern extracts a grouping key from an error message.
// Uses the first 100 characters for simple grouping.
func normalizePattern(msg string) string {
	msg = strings.TrimSpace(msg)
	if len(msg) > 100 {
		msg = msg[:100]
	}
	if msg == "" {
		msg = "(empty error)"
	}
	return msg
}

func buildTitle(t errorTrace) string {
	msg := t.ErrorMessage
	if len(msg) > 80 {
		msg = msg[:80] + "..."
	}
	if msg == "" {
		msg = "Unknown error"
	}
	return fmt.Sprintf("[%s] %s", t.ProjectID, msg)
}

// analyzeRootCause calls the Anthropic API for root cause analysis.
func (d *Detector) analyzeRootCause(ctx context.Context, incidentID string, traces []errorTrace) {
	// Take a sample of up to 3 traces for analysis.
	sample := traces
	if len(sample) > 3 {
		sample = sample[:3]
	}

	traceJSONs := make([]string, len(sample))
	for i, t := range sample {
		b, _ := json.Marshal(t)
		traceJSONs[i] = string(b)
	}

	prompt := fmt.Sprintf(
		"You are analyzing traces from an observability system. These %d traces all failed with similar errors.\n\nTraces:\n%s\n\nWhat is the root cause of these failures? Be concise.",
		len(sample),
		strings.Join(traceJSONs, "\n"),
	)

	rootCause, err := d.callAnthropic(ctx, prompt)
	if err != nil {
		d.Log.Error("anthropic root cause", "err", err, "incident_id", incidentID)
		return
	}

	if err := d.Store.UpdateIncidentRootCause(ctx, incidentID, rootCause); err != nil {
		d.Log.Error("update root cause", "err", err, "incident_id", incidentID)
	}
}

// anthropicRequest / anthropicResponse model the Anthropic Messages API.
type anthropicRequest struct {
	Model     string             `json:"model"`
	MaxTokens int                `json:"max_tokens"`
	Messages  []anthropicMessage `json:"messages"`
}

type anthropicMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type anthropicResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
}

func (d *Detector) callAnthropic(ctx context.Context, prompt string) (string, error) {
	reqBody := anthropicRequest{
		Model:     "claude-haiku-4-5-20251001",
		MaxTokens: 500,
		Messages: []anthropicMessage{
			{Role: "user", Content: prompt},
		},
	}
	body, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://api.anthropic.com/v1/messages", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("new request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", d.AnthropicKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("http do: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(io.LimitReader(resp.Body, 64<<10))
	if err != nil {
		return "", fmt.Errorf("read response: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("anthropic API error %d: %s", resp.StatusCode, string(respBody))
	}

	var ar anthropicResponse
	if err := json.Unmarshal(respBody, &ar); err != nil {
		return "", fmt.Errorf("unmarshal response: %w", err)
	}
	if len(ar.Content) == 0 {
		return "", fmt.Errorf("empty response from anthropic")
	}
	return ar.Content[0].Text, nil
}
