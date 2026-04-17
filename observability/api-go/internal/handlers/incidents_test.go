package handlers

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestIncidentsPatch_InvalidStatus(t *testing.T) {
	h := &Incidents{}

	body := `{"status":"invalid_status"}`
	req := httptest.NewRequest(http.MethodPatch, "/v1/incidents/inc_123", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	// Wire chi URL param.
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "inc_123")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

	w := httptest.NewRecorder()
	h.Patch(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "status must be one of") {
		t.Errorf("expected validation message, got %s", w.Body.String())
	}
}

func TestIncidentsPatch_EmptyBody(t *testing.T) {
	h := &Incidents{}

	body := `{}`
	req := httptest.NewRequest(http.MethodPatch, "/v1/incidents/inc_123", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "inc_123")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

	w := httptest.NewRecorder()
	h.Patch(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty status, got %d", w.Code)
	}
}

func TestIncidentsGet_MissingID(t *testing.T) {
	h := &Incidents{}

	req := httptest.NewRequest(http.MethodGet, "/v1/incidents/", nil)

	// Empty chi URL param simulates missing id.
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

	w := httptest.NewRecorder()
	h.Get(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "incident id required") {
		t.Errorf("expected 'incident id required' message, got %s", w.Body.String())
	}
}

func TestIncidentsList_MissingProjectID(t *testing.T) {
	h := &Incidents{}

	req := httptest.NewRequest(http.MethodGet, "/v1/incidents", nil)
	w := httptest.NewRecorder()
	h.List(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
	if !strings.Contains(w.Body.String(), "project_id required") {
		t.Errorf("expected 'project_id required' message, got %s", w.Body.String())
	}
}

func TestIncidentsDetect_MissingProjectID(t *testing.T) {
	h := &Incidents{}

	body := `{}`
	req := httptest.NewRequest(http.MethodPost, "/v1/incidents/detect", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	h.Detect(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}
