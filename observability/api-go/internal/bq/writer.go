package bq

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/option"
)

// Row is a single flat row destined for a BigQuery table. We use the
// bigquery.ValueSaver interface so the cloud-sdk streaming insert path
// handles JSON marshalling.
type Row struct {
	InsertID string
	Data     map[string]bigquery.Value
}

// Save implements bigquery.ValueSaver.
func (r Row) Save() (map[string]bigquery.Value, string, error) {
	return r.Data, r.InsertID, nil
}

// Writer batches rows per-table and flushes on row-count or interval.
// It uses the classic streaming insert API (bigquery.Inserter) for
// portability with the emulator; swap to managedwriter in prod for
// throughput.
type Writer struct {
	client     *bigquery.Client
	project    string
	dataset    string
	endpoint   string
	httpClient *http.Client
	log        *slog.Logger

	mu         sync.Mutex
	buffers    map[string][]bigquery.ValueSaver
	maxRows    int
	maxAge     time.Duration
	flushTimer *time.Timer
	stop       chan struct{}
	done       chan struct{}
}

// NewWriter opens a BigQuery client. If endpoint is set we point at the
// bigquery emulator and disable auth.
func NewWriter(ctx context.Context, project, dataset, endpoint string, log *slog.Logger) (*Writer, error) {
	var opts []option.ClientOption
	if endpoint != "" {
		opts = append(opts, option.WithEndpoint(endpoint), option.WithoutAuthentication())
	}
	cli, err := bigquery.NewClient(ctx, project, opts...)
	if err != nil {
		return nil, fmt.Errorf("bigquery.NewClient: %w", err)
	}
	w := &Writer{
		client:     cli,
		project:    project,
		dataset:    dataset,
		endpoint:   endpoint,
		httpClient: &http.Client{Timeout: 10 * time.Second},
		log:        log,
		buffers:    make(map[string][]bigquery.ValueSaver),
		maxRows:    100,
		maxAge:     500 * time.Millisecond,
		stop:       make(chan struct{}),
		done:       make(chan struct{}),
	}
	go w.loop(ctx)
	return w, nil
}

// Client exposes the underlying bigquery.Client for ad-hoc admin queries
// (e.g. UPDATE/DML). Use sparingly.
func (w *Writer) Client() *bigquery.Client { return w.client }

// Dataset returns the configured dataset name for ad-hoc DML/query helpers.
func (w *Writer) Dataset() string { return w.dataset }

func (w *Writer) Close(ctx context.Context) error {
	close(w.stop)
	<-w.done
	// final flush
	w.flushAll(ctx)
	return w.client.Close()
}

// Append enqueues a row for the given table. The batch is flushed either when
// 100 rows accumulate or every 500ms.
func (w *Writer) Append(table string, row Row) {
	w.mu.Lock()
	w.buffers[table] = append(w.buffers[table], row)
	n := len(w.buffers[table])
	w.mu.Unlock()
	if n >= w.maxRows {
		go w.flushTable(context.Background(), table)
	}
}

func (w *Writer) loop(ctx context.Context) {
	defer close(w.done)
	t := time.NewTicker(w.maxAge)
	defer t.Stop()
	for {
		select {
		case <-w.stop:
			return
		case <-t.C:
			w.flushAll(ctx)
		}
	}
}

func (w *Writer) flushAll(ctx context.Context) {
	w.mu.Lock()
	tables := make([]string, 0, len(w.buffers))
	for t := range w.buffers {
		tables = append(tables, t)
	}
	w.mu.Unlock()
	for _, t := range tables {
		w.flushTable(ctx, t)
	}
}

func (w *Writer) flushTable(ctx context.Context, table string) {
	w.mu.Lock()
	rows := w.buffers[table]
	w.buffers[table] = nil
	w.mu.Unlock()
	if len(rows) == 0 {
		return
	}
	if err := w.putRows(ctx, table, rows); err != nil {
		w.log.Error("bq insert failed", "table", table, "rows", len(rows), "err", err)
		return
	}
	w.log.Debug("bq insert", "table", table, "rows", len(rows))
}

func (w *Writer) putRows(
	ctx context.Context,
	table string,
	rows []bigquery.ValueSaver,
) error {
	if w.endpoint != "" {
		return w.insertAll(ctx, table, rows)
	}
	ins := w.client.Dataset(w.dataset).Table(table).Inserter()
	return ins.Put(ctx, rows)
}

func (w *Writer) insertAll(
	ctx context.Context,
	table string,
	rows []bigquery.ValueSaver,
) error {
	type insertRow struct {
		InsertID string         `json:"insertId,omitempty"`
		JSON     map[string]any `json:"json"`
	}
	reqBody := struct {
		Kind string      `json:"kind"`
		Rows []insertRow `json:"rows"`
	}{
		Kind: "bigquery#tableDataInsertAllRequest",
		Rows: make([]insertRow, 0, len(rows)),
	}

	for _, saver := range rows {
		data, insertID, err := saver.Save()
		if err != nil {
			return err
		}
		reqBody.Rows = append(reqBody.Rows, insertRow{
			InsertID: insertID,
			JSON:     normalizeInsertRow(data),
		})
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("marshal insertAll request: %w", err)
	}

	url := fmt.Sprintf(
		"%s/bigquery/v2/projects/%s/datasets/%s/tables/%s/insertAll",
		trimEndpoint(w.endpoint),
		w.project,
		w.dataset,
		table,
	)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("build insertAll request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := w.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("insertAll request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return fmt.Errorf("read insertAll response: %w", err)
	}
	if resp.StatusCode >= 300 {
		return fmt.Errorf("insertAll responded %d: %s", resp.StatusCode, string(respBody))
	}

	var parsed struct {
		InsertErrors []any `json:"insertErrors"`
	}
	if len(respBody) > 0 && json.Unmarshal(respBody, &parsed) == nil && len(parsed.InsertErrors) > 0 {
		return fmt.Errorf("insertAll returned insertErrors: %s", string(respBody))
	}

	return nil
}

func normalizeInsertRow(data map[string]bigquery.Value) map[string]any {
	out := make(map[string]any, len(data))
	for key, value := range data {
		switch typed := value.(type) {
		case time.Time:
			out[key] = typed.UTC().Format(time.RFC3339Nano)
		default:
			out[key] = typed
		}
	}
	return out
}

func trimEndpoint(endpoint string) string {
	for len(endpoint) > 0 && endpoint[len(endpoint)-1] == '/' {
		endpoint = endpoint[:len(endpoint)-1]
	}
	return endpoint
}

// JSONField converts an arbitrary Go value to a JSON string for BQ JSON cols.
func JSONField(v any) string {
	if v == nil {
		return ""
	}
	b, err := json.Marshal(v)
	if err != nil {
		return ""
	}
	return string(b)
}
