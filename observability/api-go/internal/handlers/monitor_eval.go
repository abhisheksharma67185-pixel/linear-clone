package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"strings"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

var supportedMonitorSignals = []string{
	"latency_ms",
	"error_rate",
	"success_rate",
	"total_tokens",
	"cost_usd",
	"trace_count",
}

func enrichMonitorEvaluations(
	ctx context.Context,
	writer *bq.Writer,
	monitors []models.MonitorConfig,
) {
	if writer == nil {
		return
	}
	for idx := range monitors {
		monitors[idx].LatestEvaluation = evaluateMonitor(ctx, writer, &monitors[idx])
	}
}

func evaluateMonitor(
	ctx context.Context,
	writer *bq.Writer,
	monitor *models.MonitorConfig,
) *models.MonitorEvaluation {
	now := time.Now().UTC()
	windowStart := now.Add(-time.Duration(monitor.WindowMinutes) * time.Minute)
	if !monitor.Active {
		return &models.MonitorEvaluation{
			State:       "paused",
			SampleSize:  0,
			WindowStart: windowStart,
			WindowEnd:   now,
			EvaluatedAt: now,
		}
	}
	if !slices.Contains(supportedMonitorSignals, monitor.SignalKey) {
		return &models.MonitorEvaluation{
			State:       "unsupported",
			SampleSize:  0,
			WindowStart: windowStart,
			WindowEnd:   now,
			EvaluatedAt: now,
		}
	}

	listFilters, metadataFilters := parseMonitorFilters(monitor)
	listFilters.ProjectID = monitor.ProjectID
	listFilters.Since = windowStart
	listFilters.Until = now
	listFilters.Limit = 500

	items, err := collectMonitorTraceItems(ctx, writer, listFilters, metadataFilters)
	if err != nil || len(items) == 0 {
		state := "no_data"
		if err != nil {
			state = "error"
		}
		return &models.MonitorEvaluation{
			State:       state,
			SampleSize:  0,
			WindowStart: windowStart,
			WindowEnd:   now,
			EvaluatedAt: now,
		}
	}

	value := aggregateMonitorValue(items, monitor.SignalKey)
	state := classifyMonitorState(value, monitor.Operator, monitor.WarnThreshold, monitor.CriticalThreshold)
	evaluation := &models.MonitorEvaluation{
		State:       state,
		Value:       &value,
		SampleSize:  int64(len(items)),
		WindowStart: windowStart,
		WindowEnd:   now,
		EvaluatedAt: now,
	}

	groupBy := strings.TrimSpace(ptrString(monitor.GroupBy))
	if groupBy == "" {
		return evaluation
	}

	grouped := make(map[string][]models.TraceListItem)
	for _, item := range items {
		group := monitorGroupValue(item, groupBy)
		grouped[group] = append(grouped[group], item)
	}
	groupStates := make([]models.MonitorGroupState, 0, len(grouped))
	maxState := state
	for group, groupItems := range grouped {
		groupValue := aggregateMonitorValue(groupItems, monitor.SignalKey)
		groupState := classifyMonitorState(groupValue, monitor.Operator, monitor.WarnThreshold, monitor.CriticalThreshold)
		if monitorStateRank(groupState) > monitorStateRank(maxState) {
			maxState = groupState
		}
		groupStates = append(groupStates, models.MonitorGroupState{
			Group:      group,
			Value:      groupValue,
			State:      groupState,
			SampleSize: int64(len(groupItems)),
		})
	}
	slices.SortFunc(groupStates, func(a, b models.MonitorGroupState) int {
		if rankDiff := monitorStateRank(b.State) - monitorStateRank(a.State); rankDiff != 0 {
			return rankDiff
		}
		return strings.Compare(a.Group, b.Group)
	})
	evaluation.State = maxState
	evaluation.GroupStates = groupStates
	return evaluation
}

func collectMonitorTraceItems(
	ctx context.Context,
	writer *bq.Writer,
	filters bq.ListFilters,
	metadataFilters []bq.MetadataFilter,
) ([]models.TraceListItem, error) {
	cursor := ""
	items := make([]models.TraceListItem, 0, filters.Limit)
	for {
		filters.Cursor = cursor
		batch, next, err := writer.ListTraces(ctx, filters)
		if err != nil {
			return nil, err
		}
		if len(metadataFilters) > 0 {
			filtered, _ := filterTraceItemsByMetadata(batch, metadataFilters)
			batch = filtered
		}
		items = append(items, batch...)
		if next == "" {
			break
		}
		cursor = next
	}
	return items, nil
}

func parseMonitorFilters(monitor *models.MonitorConfig) (bq.ListFilters, []bq.MetadataFilter) {
	var raw map[string]any
	if len(monitor.Filters) > 0 {
		_ = json.Unmarshal(monitor.Filters, &raw)
	}
	filters := bq.ListFilters{}
	metadata := make([]bq.MetadataFilter, 0)
	for key, value := range raw {
		normalizedKey := strings.TrimSpace(strings.ToLower(key))
		switch normalizedKey {
		case "status":
			filters.Status = monitorFilterValues(value)
		case "platform":
			filters.Platform = monitorFilterValues(value)
		case "model":
			filters.Model = monitorFilterValues(value)
		case "user_id":
			values := monitorFilterValues(value)
			if len(values) > 0 {
				filters.UserID = values[0]
			}
		case "run_id":
			values := monitorFilterValues(value)
			if len(values) > 0 {
				filters.RunID = values[0]
			}
		case "run_type":
			filters.RunType = monitorFilterValues(value)
		case "use_case":
			filters.UseCase = monitorFilterValues(value)
		case "group":
			values := monitorFilterValues(value)
			if len(values) > 0 {
				filters.Group = values[0]
			}
		case "tags":
			filters.Tags = monitorFilterValues(value)
		default:
			switch {
			case strings.HasPrefix(normalizedKey, "meta."):
				for _, expected := range monitorFilterValues(value) {
					metadata = append(metadata, bq.MetadataFilter{
						Key:   strings.TrimPrefix(normalizedKey, "meta."),
						Value: expected,
					})
				}
			case strings.HasPrefix(normalizedKey, "metadata."):
				for _, expected := range monitorFilterValues(value) {
					metadata = append(metadata, bq.MetadataFilter{
						Key:   strings.TrimPrefix(normalizedKey, "metadata."),
						Value: expected,
					})
				}
			}
		}
	}
	return filters, metadata
}

func monitorFilterValues(value any) []string {
	switch typed := value.(type) {
	case string:
		if trimmed := strings.TrimSpace(typed); trimmed != "" {
			return []string{trimmed}
		}
	case []any:
		out := make([]string, 0, len(typed))
		for _, item := range typed {
			out = append(out, monitorFilterValues(item)...)
		}
		return out
	default:
		if rendered := strings.TrimSpace(fmt.Sprint(typed)); rendered != "" && rendered != "<nil>" {
			return []string{rendered}
		}
	}
	return nil
}

func aggregateMonitorValue(items []models.TraceListItem, signalKey string) float64 {
	switch signalKey {
	case "latency_ms":
		var total int64
		for _, item := range items {
			total += item.LatencyMS
		}
		return float64(total) / float64(len(items))
	case "error_rate":
		var failures int
		for _, item := range items {
			if item.Status == "error" {
				failures++
			}
		}
		return (float64(failures) / float64(len(items))) * 100
	case "success_rate":
		var successes int
		for _, item := range items {
			if item.Status == "success" {
				successes++
			}
		}
		return (float64(successes) / float64(len(items))) * 100
	case "total_tokens":
		var total int64
		for _, item := range items {
			total += item.TotalTokens
		}
		return float64(total)
	case "cost_usd":
		var total float64
		for _, item := range items {
			total += item.CostUSD
		}
		return total
	case "trace_count":
		return float64(len(items))
	default:
		return 0
	}
}

func classifyMonitorState(value float64, operator string, warnThreshold, criticalThreshold *float64) string {
	if criticalThreshold != nil && compareMonitorValue(value, operator, *criticalThreshold) {
		return "critical"
	}
	if warnThreshold != nil && compareMonitorValue(value, operator, *warnThreshold) {
		return "warn"
	}
	return "ok"
}

func compareMonitorValue(value float64, operator string, threshold float64) bool {
	switch operator {
	case "gt":
		return value > threshold
	case "gte":
		return value >= threshold
	case "lt":
		return value < threshold
	case "lte":
		return value <= threshold
	case "eq":
		return value == threshold
	default:
		return false
	}
}

func monitorStateRank(state string) int {
	switch state {
	case "critical":
		return 5
	case "warn":
		return 4
	case "error":
		return 3
	case "unsupported":
		return 2
	case "no_data":
		return 1
	case "paused":
		return 0
	default:
		return -1
	}
}

func monitorGroupValue(item models.TraceListItem, groupBy string) string {
	switch {
	case strings.HasPrefix(groupBy, "meta."):
		return firstMonitorMetadataValue(item.Metadata, strings.TrimPrefix(groupBy, "meta."))
	case strings.HasPrefix(groupBy, "metadata."):
		return firstMonitorMetadataValue(item.Metadata, strings.TrimPrefix(groupBy, "metadata."))
	case groupBy == "platform":
		return fallbackMonitorGroup(item.Platform)
	case groupBy == "model":
		return fallbackMonitorGroup(item.Model)
	case groupBy == "status":
		return fallbackMonitorGroup(item.Status)
	case groupBy == "run_type":
		return fallbackMonitorGroup(item.RunType)
	case groupBy == "use_case":
		return fallbackMonitorGroup(item.UseCase)
	case groupBy == "user_id":
		return fallbackMonitorGroup(item.UserID)
	case groupBy == "group":
		return fallbackMonitorGroup(item.Group)
	default:
		return fallbackMonitorGroup(groupBy)
	}
}

func fallbackMonitorGroup(value string) string {
	if strings.TrimSpace(value) == "" {
		return "(missing)"
	}
	return value
}

func firstMonitorMetadataValue(raw json.RawMessage, key string) string {
	if len(raw) == 0 {
		return "(missing)"
	}
	var payload any
	if err := json.Unmarshal(raw, &payload); err != nil {
		return "(missing)"
	}
	values := metadataValuesForPath(payload, strings.Split(key, "."))
	if len(values) == 0 {
		return "(missing)"
	}
	return values[0]
}

func ptrString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
