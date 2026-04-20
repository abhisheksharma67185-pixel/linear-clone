package webhook

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

type fakeDeliveryStore struct {
	destinations []store.WebhookDestination
	statusByID   map[string]int
}

func (s *fakeDeliveryStore) ListWebhookDestinations(context.Context, string, string) ([]store.WebhookDestination, error) {
	return s.destinations, nil
}

func (s *fakeDeliveryStore) RecordWebhookDelivery(_ context.Context, webhookID string, status int) error {
	if s.statusByID == nil {
		s.statusByID = make(map[string]int)
	}
	s.statusByID[webhookID] = status
	return nil
}

func TestDeliverTraceEvent(t *testing.T) {
	var envelope EventEnvelope
	var eventHeader string
	var signatureHeader string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		eventHeader = r.Header.Get("X-Theta-Event")
		signatureHeader = r.Header.Get("X-Theta-Signature")
		if err := json.NewDecoder(r.Body).Decode(&envelope); err != nil {
			t.Fatalf("decode envelope: %v", err)
		}
		w.WriteHeader(http.StatusAccepted)
	}))
	defer server.Close()

	store := &fakeDeliveryStore{
		destinations: []store.WebhookDestination{{
			ID:     "wh_1",
			URL:    server.URL,
			Secret: "whsec_test",
		}},
	}
	deliverer := &Deliverer{Store: store, Client: server.Client()}
	trace := &models.Trace{
		TraceID:       "tr_123",
		ProjectID:     "proj_123",
		Status:        "success",
		Name:          "checkout",
		SchemaVersion: "1.0",
	}

	deliverer.DeliverTraceEvent(context.Background(), "org_123", trace)

	if eventHeader != "trace.created" {
		t.Fatalf("event header = %q, want trace.created", eventHeader)
	}
	if signatureHeader == "" {
		t.Fatal("expected signature header to be present")
	}
	if envelope.Event != "trace.created" {
		t.Fatalf("envelope event = %q, want trace.created", envelope.Event)
	}
	if got := store.statusByID["wh_1"]; got != http.StatusAccepted {
		t.Fatalf("recorded status = %d, want 202", got)
	}
}

func TestDeliverProjectEventRecordsFailureStatus(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	store := &fakeDeliveryStore{
		destinations: []store.WebhookDestination{{
			ID:     "wh_1",
			URL:    server.URL,
			Secret: "whsec_test",
		}},
	}
	deliverer := &Deliverer{Store: store, Client: server.Client()}

	deliverer.DeliverProjectEvent(context.Background(), "proj_123", "trace.errored", map[string]any{"trace_id": "tr_123"})

	if got := store.statusByID["wh_1"]; got != http.StatusInternalServerError {
		t.Fatalf("recorded status = %d, want 500", got)
	}
}
