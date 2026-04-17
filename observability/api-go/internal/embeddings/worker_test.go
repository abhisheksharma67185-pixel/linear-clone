package embeddings

import (
	"context"
	"encoding/json"
	"log/slog"
	"strings"
	"testing"
)

func TestExtractText_MessagesAndToolCalls(t *testing.T) {
	trace := map[string]any{
		"name": "test-trace",
		"steps": []any{
			map[string]any{
				"messages": []any{
					map[string]any{
						"role": "user",
						"content": []any{
							map[string]any{"type": "text", "text": "Hello world"},
						},
					},
					map[string]any{
						"role": "assistant",
						"content": []any{
							map[string]any{"type": "text", "text": "Hi there"},
						},
					},
				},
				"tool_calls": []any{
					map[string]any{"id": "tc1", "name": "web_search"},
					map[string]any{"id": "tc2", "name": "read_file"},
				},
			},
		},
		"metadata": map[string]any{
			"env": "production",
		},
	}
	buf, err := json.Marshal(trace)
	if err != nil {
		t.Fatal(err)
	}

	text := ExtractText(buf)

	for _, want := range []string{"test-trace", "Hello world", "Hi there", "web_search", "read_file", "env=production"} {
		if !strings.Contains(text, want) {
			t.Errorf("expected text to contain %q, got:\n%s", want, text)
		}
	}
}

func TestExtractText_EmptyTrace(t *testing.T) {
	text := ExtractText([]byte(`{}`))
	if text != "" {
		t.Errorf("expected empty text for empty trace, got: %q", text)
	}
}

func TestExtractText_InvalidJSON(t *testing.T) {
	text := ExtractText([]byte(`not json`))
	if text != "" {
		t.Errorf("expected empty text for invalid JSON, got: %q", text)
	}
}

func TestExtractText_Truncation(t *testing.T) {
	// Build a trace with a very long message.
	longText := strings.Repeat("a", 10000)
	trace := map[string]any{
		"steps": []any{
			map[string]any{
				"messages": []any{
					map[string]any{
						"role": "user",
						"content": []any{
							map[string]any{"type": "text", "text": longText},
						},
					},
				},
			},
		},
	}
	buf, _ := json.Marshal(trace)
	text := ExtractText(buf)
	if len(text) > maxTextLen {
		t.Errorf("expected text to be truncated to %d, got %d", maxTextLen, len(text))
	}
}

func TestEmbedTrace_SkipsWhenNoAPIKey(t *testing.T) {
	w := &EmbeddingWorker{
		Store:  nil,
		APIKey: "",
		Log:    slog.Default(),
	}

	// Should not panic and should return immediately.
	w.EmbedTrace(context.Background(), "tr_123", "proj_abc", []byte(`{"name":"test"}`))
}

func TestSearchTraces_ErrorWhenNoStore(t *testing.T) {
	w := &EmbeddingWorker{
		Store:  nil,
		APIKey: "",
		Log:    slog.Default(),
	}

	_, err := w.SearchTraces(context.Background(), "test query", "proj_123", 10)
	if err == nil {
		t.Error("expected error when store is nil")
	}
}

func TestEnabled(t *testing.T) {
	w := &EmbeddingWorker{APIKey: ""}
	if w.Enabled() {
		t.Error("expected Enabled() to return false with empty key")
	}
	w.APIKey = "sk-test"
	if !w.Enabled() {
		t.Error("expected Enabled() to return true with key set")
	}
}
