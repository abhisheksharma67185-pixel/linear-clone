package bq

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/googleapi"
)

type fieldSpec struct {
	Name        string
	Type        string
	Mode        string
	Description string
}

type tableSpec struct {
	Name           string
	PartitionField string
	ClusterFields  []string
	Fields         []fieldSpec
}

var bqTableSpecs = []tableSpec{
	{
		Name:           "traces",
		PartitionField: "ingest_date",
		ClusterFields:  []string{"project_id", "status"},
		Fields: []fieldSpec{
			{Name: "trace_id", Type: "STRING", Mode: "REQUIRED", Description: "Unique trace identifier (ULID-style, prefixed `tr_`). Primary key."},
			{Name: "project_id", Type: "STRING", Mode: "REQUIRED", Description: "Project the trace belongs to. Cluster column."},
			{Name: "org_id", Type: "STRING", Mode: "REQUIRED", Description: "Org that owns the project."},
			{Name: "ingest_date", Type: "DATE", Mode: "REQUIRED", Description: "UTC date the trace was ingested. Partition column (DAY)."},
			{Name: "name", Type: "STRING", Mode: "NULLABLE", Description: "Human-readable trace name (e.g. `checkout-agent`)."},
			{Name: "run_id", Type: "STRING", Mode: "NULLABLE", Description: "Customer-supplied run identifier."},
			{Name: "run_type", Type: "STRING", Mode: "NULLABLE", Description: "prod | eval | dev | test | replay | backfill | other."},
			{Name: "use_case", Type: "STRING", Mode: "NULLABLE", Description: "Customer-supplied use case label (e.g. `web-shopping`)."},
			{Name: "group", Type: "STRING", Mode: "NULLABLE", Description: "Customer-supplied group label (e.g. `nightly-2026-04-15`)."},
			{Name: "platform", Type: "STRING", Mode: "NULLABLE", Description: "web | mobile | desktop | server | robot | sim | cli | other."},
			{Name: "model", Type: "STRING", Mode: "NULLABLE", Description: "Primary model attributed to this trace."},
			{Name: "user_id", Type: "STRING", Mode: "NULLABLE", Description: "Customer-supplied end-user identifier."},
			{Name: "status", Type: "STRING", Mode: "REQUIRED", Description: "success | error | running | cancelled. Cluster column."},
			{Name: "error_message", Type: "STRING", Mode: "NULLABLE", Description: "Top-level trace error message, if status = error."},
			{Name: "started_at", Type: "TIMESTAMP", Mode: "NULLABLE", Description: "Trace start timestamp."},
			{Name: "ended_at", Type: "TIMESTAMP", Mode: "NULLABLE", Description: "Trace end timestamp."},
			{Name: "latency_ms", Type: "INT64", Mode: "NULLABLE", Description: "ended_at - started_at in milliseconds."},
			{Name: "input_tokens", Type: "INT64", Mode: "NULLABLE", Description: "Summed input tokens across all llm steps."},
			{Name: "output_tokens", Type: "INT64", Mode: "NULLABLE", Description: "Summed output tokens across all llm steps."},
			{Name: "total_tokens", Type: "INT64", Mode: "NULLABLE", Description: "Summed total tokens across all llm steps."},
			{Name: "cost_usd", Type: "NUMERIC", Mode: "NULLABLE", Description: "Estimated trace cost in USD."},
			{Name: "tags", Type: "STRING", Mode: "REPEATED", Description: "Customer-supplied tags."},
			{Name: "metadata", Type: "JSON", Mode: "NULLABLE", Description: "Free-form trace metadata JSON."},
			{Name: "step_count", Type: "INT64", Mode: "NULLABLE", Description: "Number of steps in the trace."},
			{Name: "has_media", Type: "BOOL", Mode: "NULLABLE", Description: "True if any step has image/audio/video/sensor/file attachments."},
			{Name: "gcs_uri", Type: "STRING", Mode: "NULLABLE", Description: "gs:// URI of the canonical trace JSON blob."},
			{Name: "schema_version", Type: "STRING", Mode: "REQUIRED", Description: "Version of the trace payload schema (`1.0`)."},
		},
	},
	{
		Name:           "steps",
		PartitionField: "ingest_date",
		ClusterFields:  []string{"project_id", "status"},
		Fields: []fieldSpec{
			{Name: "trace_id", Type: "STRING", Mode: "REQUIRED", Description: "Parent trace id (FK to traces.trace_id)."},
			{Name: "step_id", Type: "STRING", Mode: "REQUIRED", Description: "Unique step id within a trace. PK together with trace_id."},
			{Name: "parent_step_id", Type: "STRING", Mode: "NULLABLE", Description: "Parent step id for nested steps. Null at top level."},
			{Name: "index", Type: "INT64", Mode: "NULLABLE", Description: "Ordered index among siblings."},
			{Name: "project_id", Type: "STRING", Mode: "REQUIRED", Description: "Project the parent trace belongs to. Cluster column."},
			{Name: "org_id", Type: "STRING", Mode: "REQUIRED", Description: "Org the parent project belongs to."},
			{Name: "ingest_date", Type: "DATE", Mode: "REQUIRED", Description: "UTC date the parent trace was ingested. Partition column (DAY)."},
			{Name: "type", Type: "STRING", Mode: "REQUIRED", Description: "llm | tool | retrieval | robotics | human | annotation | custom."},
			{Name: "name", Type: "STRING", Mode: "NULLABLE", Description: "Human-readable step name."},
			{Name: "model", Type: "STRING", Mode: "NULLABLE", Description: "Model name for llm steps."},
			{Name: "status", Type: "STRING", Mode: "REQUIRED", Description: "success | error | running | cancelled. Cluster column."},
			{Name: "error_message", Type: "STRING", Mode: "NULLABLE", Description: "Step error message, if status = error."},
			{Name: "started_at", Type: "TIMESTAMP", Mode: "NULLABLE", Description: "Step start timestamp."},
			{Name: "ended_at", Type: "TIMESTAMP", Mode: "NULLABLE", Description: "Step end timestamp."},
			{Name: "latency_ms", Type: "INT64", Mode: "NULLABLE", Description: "ended_at - started_at, in milliseconds."},
			{Name: "input_tokens", Type: "INT64", Mode: "NULLABLE", Description: "Input tokens consumed by this step."},
			{Name: "output_tokens", Type: "INT64", Mode: "NULLABLE", Description: "Output tokens emitted by this step."},
			{Name: "cost_usd", Type: "NUMERIC", Mode: "NULLABLE", Description: "Estimated step cost in USD."},
			{Name: "message_count", Type: "INT64", Mode: "NULLABLE", Description: "Number of messages on this step."},
			{Name: "tool_call_count", Type: "INT64", Mode: "NULLABLE", Description: "Number of tool_calls on this step."},
			{Name: "attachment_count", Type: "INT64", Mode: "NULLABLE", Description: "Number of media attachments (images/audio/video/sensor/file)."},
			{Name: "modalities", Type: "STRING", Mode: "REPEATED", Description: "Distinct modalities present: text, image, audio, video, sensor, file."},
			{Name: "metadata", Type: "JSON", Mode: "NULLABLE", Description: "Free-form step metadata JSON."},
		},
	},
}

func (w *Writer) ensureSchema(ctx context.Context) error {
	if err := w.ensureDataset(ctx); err != nil {
		return err
	}
	for _, spec := range bqTableSpecs {
		if err := w.ensureTable(ctx, spec); err != nil {
			return err
		}
	}
	return nil
}

func (w *Writer) ensureDataset(ctx context.Context) error {
	if w.endpoint != "" {
		return w.ensureDatasetViaAPI(ctx)
	}

	ds := w.client.Dataset(w.dataset)
	if _, err := ds.Metadata(ctx); err == nil {
		return nil
	} else if !isNotFound(err) {
		return fmt.Errorf("dataset metadata: %w", err)
	}

	if err := ds.Create(ctx, &bigquery.DatasetMetadata{Location: "US"}); err != nil && !isAlreadyExists(err) {
		return fmt.Errorf("create dataset %s: %w", w.dataset, err)
	}
	return nil
}

func (w *Writer) ensureTable(ctx context.Context, spec tableSpec) error {
	if w.endpoint != "" {
		return w.ensureTableViaAPI(ctx, spec)
	}

	table := w.client.Dataset(w.dataset).Table(spec.Name)
	if _, err := table.Metadata(ctx); err == nil {
		return nil
	} else if !isNotFound(err) {
		return fmt.Errorf("table metadata %s: %w", spec.Name, err)
	}

	meta := &bigquery.TableMetadata{
		Schema: spec.toBigQuerySchema(),
		TimePartitioning: &bigquery.TimePartitioning{
			Field: spec.PartitionField,
			Type:  bigquery.DayPartitioningType,
		},
		Clustering: &bigquery.Clustering{Fields: append([]string(nil), spec.ClusterFields...)},
	}
	if err := table.Create(ctx, meta); err != nil && !isAlreadyExists(err) {
		return fmt.Errorf("create table %s: %w", spec.Name, err)
	}
	return nil
}

func (w *Writer) ensureDatasetViaAPI(ctx context.Context) error {
	url := fmt.Sprintf("%s/bigquery/v2/projects/%s/datasets/%s", trimEndpoint(w.endpoint), w.project, w.dataset)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("build dataset metadata request: %w", err)
	}
	resp, err := w.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("get dataset metadata: %w", err)
	}
	_ = resp.Body.Close()
	switch resp.StatusCode {
	case http.StatusOK:
		return nil
	case http.StatusNotFound:
	default:
		return fmt.Errorf("dataset metadata responded %d", resp.StatusCode)
	}

	payload := map[string]any{
		"datasetReference": map[string]string{
			"projectId": w.project,
			"datasetId": w.dataset,
		},
		"location": "US",
	}
	if err := w.postJSON(ctx, fmt.Sprintf("%s/bigquery/v2/projects/%s/datasets", trimEndpoint(w.endpoint), w.project), payload, http.StatusOK, http.StatusConflict); err != nil {
		return fmt.Errorf("create dataset %s: %w", w.dataset, err)
	}
	return nil
}

func (w *Writer) ensureTableViaAPI(ctx context.Context, spec tableSpec) error {
	url := fmt.Sprintf("%s/bigquery/v2/projects/%s/datasets/%s/tables/%s", trimEndpoint(w.endpoint), w.project, w.dataset, spec.Name)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("build table metadata request: %w", err)
	}
	resp, err := w.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("get table metadata %s: %w", spec.Name, err)
	}
	_ = resp.Body.Close()
	switch resp.StatusCode {
	case http.StatusOK:
		return nil
	case http.StatusNotFound:
	default:
		return fmt.Errorf("table metadata %s responded %d", spec.Name, resp.StatusCode)
	}

	payload := map[string]any{
		"tableReference": map[string]string{
			"projectId": w.project,
			"datasetId": w.dataset,
			"tableId":   spec.Name,
		},
		"schema": map[string]any{
			"fields": spec.toAPIFields(),
		},
		"timePartitioning": map[string]string{
			"type":  "DAY",
			"field": spec.PartitionField,
		},
		"clustering": map[string]any{
			"fields": append([]string(nil), spec.ClusterFields...),
		},
	}
	if err := w.postJSON(ctx, fmt.Sprintf("%s/bigquery/v2/projects/%s/datasets/%s/tables", trimEndpoint(w.endpoint), w.project, w.dataset), payload, http.StatusOK, http.StatusConflict); err != nil {
		return fmt.Errorf("create table %s: %w", spec.Name, err)
	}
	return nil
}

func (w *Writer) postJSON(ctx context.Context, url string, payload any, okStatus int, ignoreStatuses ...int) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal json: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := w.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("perform request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == okStatus {
		return nil
	}
	for _, status := range ignoreStatuses {
		if resp.StatusCode == status {
			return nil
		}
	}
	respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	return fmt.Errorf("status %d: %s", resp.StatusCode, string(respBody))
}

func (spec tableSpec) toBigQuerySchema() bigquery.Schema {
	out := make(bigquery.Schema, 0, len(spec.Fields))
	for _, field := range spec.Fields {
		out = append(out, field.toBigQueryField())
	}
	return out
}

func (spec tableSpec) toAPIFields() []map[string]string {
	out := make([]map[string]string, 0, len(spec.Fields))
	for _, field := range spec.Fields {
		out = append(out, field.toAPIField())
	}
	return out
}

func (field fieldSpec) toBigQueryField() *bigquery.FieldSchema {
	schema := &bigquery.FieldSchema{
		Name:        field.Name,
		Type:        fieldType(field.Type),
		Description: field.Description,
	}
	switch field.Mode {
	case "REQUIRED":
		schema.Required = true
	case "REPEATED":
		schema.Repeated = true
	}
	return schema
}

func (field fieldSpec) toAPIField() map[string]string {
	return map[string]string{
		"name":        field.Name,
		"type":        field.Type,
		"mode":        field.Mode,
		"description": field.Description,
	}
}

func fieldType(v string) bigquery.FieldType {
	switch v {
	case "STRING":
		return bigquery.StringFieldType
	case "DATE":
		return bigquery.DateFieldType
	case "TIMESTAMP":
		return bigquery.TimestampFieldType
	case "INT64":
		return bigquery.IntegerFieldType
	case "NUMERIC":
		return bigquery.NumericFieldType
	case "JSON":
		return bigquery.JSONFieldType
	case "BOOL":
		return bigquery.BooleanFieldType
	default:
		return bigquery.StringFieldType
	}
}

func isAlreadyExists(err error) bool {
	var gerr *googleapi.Error
	return errors.As(err, &gerr) && gerr.Code == http.StatusConflict
}

func isNotFound(err error) bool {
	var gerr *googleapi.Error
	return errors.As(err, &gerr) && gerr.Code == http.StatusNotFound
}
