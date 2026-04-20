package handlers

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/embeddings"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

func TestSearch_NoStoreReturnsError(t *testing.T) {
	// When Postgres store is nil, search should return 500 (not crash).
	h := &Search{
		Embedder: &embeddings.EmbeddingWorker{APIKey: "", Store: nil, Log: slog.Default()},
		Log:      slog.Default(),
	}

	body, _ := json.Marshal(models.SearchRequest{Query: "test", ProjectID: "proj_1"})
	req := httptest.NewRequest(http.MethodPost, "/v1/search", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	h.Search(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Errorf("expected 500, got %d", rec.Code)
	}
}

func TestSearch_EmptyQuery(t *testing.T) {
	h := &Search{
		Embedder: &embeddings.EmbeddingWorker{APIKey: "sk-test", Log: slog.Default()},
		Log:      slog.Default(),
	}

	body, _ := json.Marshal(models.SearchRequest{Query: "", ProjectID: "proj_1"})
	req := httptest.NewRequest(http.MethodPost, "/v1/search", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	h.Search(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rec.Code)
	}
}

func TestSearch_MissingProjectID(t *testing.T) {
	h := &Search{
		Embedder: &embeddings.EmbeddingWorker{APIKey: "sk-test", Log: slog.Default()},
		Log:      slog.Default(),
	}

	body, _ := json.Marshal(models.SearchRequest{Query: "hello", ProjectID: ""})
	req := httptest.NewRequest(http.MethodPost, "/v1/search", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	h.Search(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rec.Code)
	}

	var resp map[string]any
	_ = json.Unmarshal(rec.Body.Bytes(), &resp)
	errObj, ok := resp["error"].(map[string]any)
	if !ok {
		t.Fatal("expected error object in response")
	}
	if errObj["message"] != "project_id is required" {
		t.Errorf("expected message 'project_id is required', got %v", errObj["message"])
	}
}

func TestSearch_InvalidJSON(t *testing.T) {
	h := &Search{
		Embedder: &embeddings.EmbeddingWorker{APIKey: "sk-test", Log: slog.Default()},
		Log:      slog.Default(),
	}

	req := httptest.NewRequest(http.MethodPost, "/v1/search", bytes.NewReader([]byte("not json")))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	h.Search(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rec.Code)
	}
}
