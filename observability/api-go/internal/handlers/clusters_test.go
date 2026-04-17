package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/theagi/theta-observability/api-go/internal/clusters"
	"github.com/theagi/theta-observability/api-go/internal/store"
)

func TestClusters_Discover_MissingProjectID(t *testing.T) {
	h := &Clusters{
		Store:      &store.Store{}, // nil pool is fine — we won't hit DB
		Discoverer: &clusters.Discoverer{},
	}

	body, _ := json.Marshal(map[string]string{})
	req := httptest.NewRequest(http.MethodPost, "/v1/clusters/discover", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.Discover(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rr.Code)
	}

	var resp map[string]map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if resp["error"]["code"] != "bad_request" {
		t.Errorf("expected error code 'bad_request', got %q", resp["error"]["code"])
	}
}

func TestClusters_List_MissingProjectID(t *testing.T) {
	h := &Clusters{
		Store: &store.Store{},
	}

	req := httptest.NewRequest(http.MethodGet, "/v1/clusters", nil)
	rr := httptest.NewRecorder()

	h.List(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rr.Code)
	}
}
