package bq

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"strconv"
	"strings"
	"time"

	"cloud.google.com/go/bigquery"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"google.golang.org/api/iterator"
)

func ratToFloat(r *big.Rat) float64 {
	if r == nil {
		return 0
	}
	f, _ := r.Float64()
	return f
}

// ListFilters is the set of dimensions supported by GET /v1/traces.
type ListFilters struct {
	ProjectID string
	Status    []string
	Platform  []string
	Model     []string
	UserID    string
	RunID     string
	RunType   []string
	UseCase   []string
	Group     string
	Tags      []string
	Metadata  []MetadataFilter
	Since     time.Time
	Until     time.Time
	Limit     int
	Cursor    string // opaque, encoded started_at|trace_id
}

type MetadataFilter struct {
	Key   string
	Value string
}

// ListTraces runs a parameterised SELECT against the `traces` table.
func (w *Writer) ListTraces(ctx context.Context, f ListFilters) ([]models.TraceListItem, string, error) {
	if f.Limit <= 0 || f.Limit > 500 {
		f.Limit = 50
	}
	var (
		where  []string
		params []bigquery.QueryParameter
	)
	add := func(cond string, p bigquery.QueryParameter) {
		where = append(where, cond)
		params = append(params, p)
	}
	if f.ProjectID != "" {
		add("project_id = @project_id", bigquery.QueryParameter{Name: "project_id", Value: f.ProjectID})
	}
	if len(f.Status) > 0 {
		add("status IN UNNEST(@status)", bigquery.QueryParameter{Name: "status", Value: f.Status})
	}
	if len(f.Platform) > 0 {
		add("platform IN UNNEST(@platform)", bigquery.QueryParameter{Name: "platform", Value: f.Platform})
	}
	if len(f.Model) > 0 {
		add("model IN UNNEST(@model)", bigquery.QueryParameter{Name: "model", Value: f.Model})
	}
	if f.UserID != "" {
		add("user_id = @user_id", bigquery.QueryParameter{Name: "user_id", Value: f.UserID})
	}
	if f.RunID != "" {
		add("run_id = @run_id", bigquery.QueryParameter{Name: "run_id", Value: f.RunID})
	}
	if len(f.RunType) > 0 {
		add("run_type IN UNNEST(@run_type)", bigquery.QueryParameter{Name: "run_type", Value: f.RunType})
	}
	if len(f.UseCase) > 0 {
		add("use_case IN UNNEST(@use_case)", bigquery.QueryParameter{Name: "use_case", Value: f.UseCase})
	}
	if f.Group != "" {
		add("`group` = @group", bigquery.QueryParameter{Name: "group", Value: f.Group})
	}
	if !f.Since.IsZero() {
		add("started_at >= @since", bigquery.QueryParameter{Name: "since", Value: f.Since})
	}
	if !f.Until.IsZero() {
		add("started_at < @until", bigquery.QueryParameter{Name: "until", Value: f.Until})
	}
	if len(f.Tags) > 0 {
		add("(SELECT COUNT(1) FROM UNNEST(tags) t WHERE t IN UNNEST(@tags)) > 0",
			bigquery.QueryParameter{Name: "tags", Value: f.Tags})
	}
	if f.Cursor != "" {
		cutTime, cutID, err := decodeCursor(f.Cursor)
		if err == nil {
			add("(started_at < @cur_t OR (started_at = @cur_t AND trace_id < @cur_id))",
				bigquery.QueryParameter{Name: "cur_t", Value: cutTime})
			params = append(params, bigquery.QueryParameter{Name: "cur_id", Value: cutID})
		}
	}
	whereSQL := ""
	if len(where) > 0 {
		whereSQL = "WHERE " + strings.Join(where, " AND ")
	}
	q := w.client.Query(fmt.Sprintf(`
		SELECT trace_id, project_id, name, run_id, run_type, use_case, `+"`group`"+`, status,
		       platform, model, user_id, TO_JSON_STRING(metadata) AS metadata,
		       started_at, latency_ms, total_tokens, cost_usd, step_count,
		       has_media, tags
		FROM `+"`%s.%s.traces`"+`
		%s
		ORDER BY started_at DESC, trace_id DESC
		LIMIT @limit
	`, w.client.Project(), w.dataset, whereSQL))
	q.Parameters = append(params, bigquery.QueryParameter{Name: "limit", Value: int64(f.Limit)})
	it, err := q.Read(ctx)
	if err != nil {
		return nil, "", fmt.Errorf("bq query: %w", err)
	}
	var out []models.TraceListItem
	var last models.TraceListItem
	for {
		var row struct {
			TraceID     string               `bigquery:"trace_id"`
			ProjectID   string               `bigquery:"project_id"`
			Name        bigquery.NullString  `bigquery:"name"`
			RunID       bigquery.NullString  `bigquery:"run_id"`
			RunType     bigquery.NullString  `bigquery:"run_type"`
			UseCase     bigquery.NullString  `bigquery:"use_case"`
			Group       bigquery.NullString  `bigquery:"group"`
			Status      bigquery.NullString  `bigquery:"status"`
			Platform    bigquery.NullString  `bigquery:"platform"`
			Model       bigquery.NullString  `bigquery:"model"`
			UserID      bigquery.NullString  `bigquery:"user_id"`
			Metadata    bigquery.NullString  `bigquery:"metadata"`
			StartedAt   time.Time            `bigquery:"started_at"`
			LatencyMS   int64                `bigquery:"latency_ms"`
			TotalTokens int64                `bigquery:"total_tokens"`
			CostUSD     *big.Rat             `bigquery:"cost_usd"`
			StepCount   int64                `bigquery:"step_count"`
			HasMedia    bool                 `bigquery:"has_media"`
			Tags        []string             `bigquery:"tags"`
		}
		err := it.Next(&row)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, "", err
		}
		item := models.TraceListItem{
			TraceID:     row.TraceID,
			ProjectID:   row.ProjectID,
			Name:        row.Name.StringVal,
			RunID:       row.RunID.StringVal,
			RunType:     row.RunType.StringVal,
			UseCase:     row.UseCase.StringVal,
			Group:       row.Group.StringVal,
			Status:      row.Status.StringVal,
			Platform:    row.Platform.StringVal,
			Model:       row.Model.StringVal,
			UserID:      row.UserID.StringVal,
			StartedAt:   row.StartedAt,
			LatencyMS:   row.LatencyMS,
			TotalTokens: row.TotalTokens,
			CostUSD:     ratToFloat(row.CostUSD),
			StepCount:   row.StepCount,
			HasMedia:    row.HasMedia,
			Tags:        row.Tags,
		}
		if metadata := normalizeRawJSON(row.Metadata.StringVal); len(metadata) > 0 {
			item.Metadata = metadata
		}
		out = append(out, item)
		last = item
	}
	next := ""
	if len(out) == f.Limit {
		next = encodeCursor(last.StartedAt, last.TraceID)
	}
	return out, next, nil
}

// GetTrace fetches a single flat row.
func (w *Writer) GetTrace(ctx context.Context, traceID string) (*models.TraceListItem, string, error) {
	q := w.client.Query(fmt.Sprintf(`
		SELECT trace_id, project_id, name, run_id, run_type, use_case, `+"`group`"+`, status,
		       platform, model, user_id, TO_JSON_STRING(metadata) AS metadata,
		       started_at, latency_ms, total_tokens, cost_usd, step_count,
		       has_media, tags, gcs_uri
		FROM `+"`%s.%s.traces`"+`
		WHERE trace_id = @trace_id LIMIT 1
	`, w.client.Project(), w.dataset))
	q.Parameters = []bigquery.QueryParameter{{Name: "trace_id", Value: traceID}}
	it, err := q.Read(ctx)
	if err != nil {
		return nil, "", err
	}
	var row struct {
		TraceID     string               `bigquery:"trace_id"`
		ProjectID   string               `bigquery:"project_id"`
		Name        bigquery.NullString  `bigquery:"name"`
		RunID       bigquery.NullString  `bigquery:"run_id"`
		RunType     bigquery.NullString  `bigquery:"run_type"`
		UseCase     bigquery.NullString  `bigquery:"use_case"`
		Group       bigquery.NullString  `bigquery:"group"`
		Status      bigquery.NullString  `bigquery:"status"`
		Platform    bigquery.NullString  `bigquery:"platform"`
		Model       bigquery.NullString  `bigquery:"model"`
		UserID      bigquery.NullString  `bigquery:"user_id"`
		Metadata    bigquery.NullString  `bigquery:"metadata"`
		StartedAt   time.Time            `bigquery:"started_at"`
		LatencyMS   int64                `bigquery:"latency_ms"`
		TotalTokens int64                `bigquery:"total_tokens"`
		CostUSD     *big.Rat             `bigquery:"cost_usd"`
		StepCount   int64                `bigquery:"step_count"`
		HasMedia    bool                 `bigquery:"has_media"`
		Tags        []string             `bigquery:"tags"`
		GCSURI      bigquery.NullString  `bigquery:"gcs_uri"`
	}
	if err := it.Next(&row); err != nil {
		if err == iterator.Done {
			return nil, "", nil
		}
		return nil, "", err
	}
	item := &models.TraceListItem{
		TraceID: row.TraceID, ProjectID: row.ProjectID, Name: row.Name.StringVal,
		RunID: row.RunID.StringVal, RunType: row.RunType.StringVal, UseCase: row.UseCase.StringVal, Group: row.Group.StringVal,
		Status: row.Status.StringVal, Platform: row.Platform.StringVal, Model: row.Model.StringVal,
		UserID: row.UserID.StringVal, StartedAt: row.StartedAt, LatencyMS: row.LatencyMS,
		TotalTokens: row.TotalTokens, CostUSD: ratToFloat(row.CostUSD),
		StepCount: row.StepCount, HasMedia: row.HasMedia, Tags: row.Tags,
	}
	if metadata := normalizeRawJSON(row.Metadata.StringVal); len(metadata) > 0 {
		item.Metadata = metadata
	}
	return item, row.GCSURI.StringVal, nil
}

func encodeCursor(t time.Time, id string) string {
	return base64.RawURLEncoding.EncodeToString([]byte(fmt.Sprintf("%d|%s", t.UnixNano(), id)))
}

func EncodeCursor(t time.Time, id string) string {
	return encodeCursor(t, id)
}

func decodeCursor(s string) (time.Time, string, error) {
	b, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return time.Time{}, "", err
	}
	parts := strings.SplitN(string(b), "|", 2)
	if len(parts) != 2 {
		return time.Time{}, "", fmt.Errorf("bad cursor")
	}
	var nano int64
	if _, err := fmt.Sscanf(parts[0], "%d", &nano); err != nil {
		return time.Time{}, "", err
	}
	return time.Unix(0, nano), parts[1], nil
}

func metadataJSONPath(key string) string {
	key = strings.TrimSpace(key)
	if key == "" {
		return ""
	}
	parts := strings.Split(key, ".")
	var builder strings.Builder
	builder.WriteString("$")
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			return ""
		}
		if isSimpleJSONPathSegment(part) {
			builder.WriteString(".")
			builder.WriteString(part)
			continue
		}
		builder.WriteString(".\"")
		builder.WriteString(strings.ReplaceAll(part, `"`, `\"`))
		builder.WriteString("\"")
	}
	return builder.String()
}

func isSimpleJSONPathSegment(segment string) bool {
	for i, r := range segment {
		switch {
		case r >= 'a' && r <= 'z':
		case r >= 'A' && r <= 'Z':
		case r == '_':
		case i > 0 && r >= '0' && r <= '9':
		default:
			return false
		}
	}
	return true
}

func normalizeRawJSON(value string) json.RawMessage {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}

	var decoded any
	if err := json.Unmarshal([]byte(value), &decoded); err != nil {
		return nil
	}

	if asString, ok := decoded.(string); ok {
		asString = strings.TrimSpace(asString)
		if json.Valid([]byte(asString)) {
			return json.RawMessage(asString)
		}
		return json.RawMessage(strconv.Quote(asString))
	}

	return json.RawMessage(value)
}
