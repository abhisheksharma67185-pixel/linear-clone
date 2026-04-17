package bq

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
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
	client  *bigquery.Client
	dataset string
	log     *slog.Logger

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
		client:  cli,
		dataset: dataset,
		log:     log,
		buffers: make(map[string][]bigquery.ValueSaver),
		maxRows: 100,
		maxAge:  500 * time.Millisecond,
		stop:    make(chan struct{}),
		done:    make(chan struct{}),
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
	ins := w.client.Dataset(w.dataset).Table(table).Inserter()
	if err := ins.Put(ctx, rows); err != nil {
		w.log.Error("bq insert failed", "table", table, "rows", len(rows), "err", err)
		return
	}
	w.log.Debug("bq insert", "table", table, "rows", len(rows))
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
