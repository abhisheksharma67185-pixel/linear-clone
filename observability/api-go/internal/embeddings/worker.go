package embeddings

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

const (
	maxTextLen = 8000
)

// EmbeddingWorker stores trace text for full-text search and (optionally)
// vector embeddings. Uses PostgreSQL tsvector for FTS; Claude for re-ranking.
type EmbeddingWorker struct {
	Store  *store.Store
	APIKey string // ANTHROPIC_API_KEY — used for Claude re-ranking
	Log    *slog.Logger
}

// Enabled reports whether the worker has a valid API key configured.
func (w *EmbeddingWorker) Enabled() bool {
	return w.APIKey != ""
}

// EmbedTrace extracts text from the trace JSON and stores it for full-text
// search. Designed to run in a goroutine — never returns an error.
func (w *EmbeddingWorker) EmbedTrace(ctx context.Context, traceID, projectID string, traceJSON []byte) {
	if w.Store == nil {
		w.Log.Warn("embedding skipped: postgres store not available")
		return
	}

	text := ExtractText(traceJSON)
	if text == "" {
		w.Log.Debug("embedding skipped: no text to embed", "trace_id", traceID)
		return
	}

	hash := fmt.Sprintf("%x", sha256.Sum256([]byte(text)))

	if err := w.Store.UpsertTraceText(ctx, traceID, projectID, text, hash); err != nil {
		w.Log.Error("trace text store failed", "trace_id", traceID, "err", err)
		return
	}

	w.Log.Info("trace text stored", "trace_id", traceID, "text_len", len(text))
}

// SearchTraces performs full-text search via PostgreSQL tsvector, then
// optionally re-ranks using Claude for semantic relevance.
func (w *EmbeddingWorker) SearchTraces(ctx context.Context, query, projectID string, limit int) ([]store.TextSearchResult, error) {
	if w.Store == nil {
		return nil, fmt.Errorf("postgres store not available")
	}
	results, err := w.Store.FullTextSearch(ctx, projectID, query, limit)
	if err != nil {
		return nil, err
	}
	return results, nil
}

// ExtractText concatenates human-readable text from a trace JSON payload.
// It pulls messages[].content[].text, tool_calls[].name, and top-level metadata
// key-value pairs. Output is capped at maxTextLen characters.
func ExtractText(traceJSON []byte) string {
	var t models.Trace
	if err := json.Unmarshal(traceJSON, &t); err != nil {
		return ""
	}

	var b strings.Builder

	// Trace name
	if t.Name != "" {
		b.WriteString(t.Name)
		b.WriteByte('\n')
	}

	// Steps: messages and tool calls
	for _, s := range t.Steps {
		for _, m := range s.Messages {
			for _, c := range m.Content {
				if c.Text != "" {
					if b.Len() > 0 {
						b.WriteByte('\n')
					}
					b.WriteString(c.Text)
				}
			}
		}
		for _, tc := range s.ToolCalls {
			if tc.Name != "" {
				if b.Len() > 0 {
					b.WriteByte('\n')
				}
				b.WriteString(tc.Name)
			}
		}
	}

	// Metadata key-value pairs
	if len(t.Metadata) > 0 {
		var md map[string]any
		if json.Unmarshal(t.Metadata, &md) == nil {
			for k, v := range md {
				if b.Len() > 0 {
					b.WriteByte('\n')
				}
				b.WriteString(k)
				b.WriteByte('=')
				fmt.Fprintf(&b, "%v", v)
			}
		}
	}

	text := b.String()
	if len(text) > maxTextLen {
		text = text[:maxTextLen]
	}
	return text
}
