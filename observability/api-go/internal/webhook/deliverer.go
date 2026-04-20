package webhook

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

type deliveryStore interface {
	ListWebhookDestinations(ctx context.Context, projectID, event string) ([]store.WebhookDestination, error)
	RecordWebhookDelivery(ctx context.Context, webhookID string, status int) error
}

type Deliverer struct {
	Store  deliveryStore
	Client *http.Client
	Log    *slog.Logger
}

type EventEnvelope struct {
	Event   string    `json:"event"`
	SentAt  time.Time `json:"sent_at"`
	Payload any       `json:"payload"`
}

func (d *Deliverer) DeliverTraceEvent(ctx context.Context, orgID string, trace *models.Trace) {
	if trace == nil {
		return
	}
	event := "trace.created"
	if trace.Status == "error" {
		event = "trace.errored"
	}
	d.DeliverProjectEvent(ctx, trace.ProjectID, event, map[string]any{
		"org_id": orgID,
		"trace":  trace,
	})
}

func (d *Deliverer) DeliverIncidentEvent(ctx context.Context, incident *models.Incident) {
	if incident == nil {
		return
	}
	d.DeliverProjectEvent(ctx, incident.ProjectID, "incident.detected", map[string]any{
		"incident": incident,
	})
}

func (d *Deliverer) DeliverProjectEvent(ctx context.Context, projectID, event string, payload any) {
	if d == nil || d.Store == nil || projectID == "" || event == "" {
		return
	}
	destinations, err := d.Store.ListWebhookDestinations(ctx, projectID, event)
	if err != nil {
		d.log().Warn("list webhook destinations failed", "project_id", projectID, "event", event, "err", err)
		return
	}
	if len(destinations) == 0 {
		return
	}

	envelope := EventEnvelope{
		Event:   event,
		SentAt:  time.Now().UTC(),
		Payload: payload,
	}
	body, err := json.Marshal(envelope)
	if err != nil {
		d.log().Warn("marshal webhook payload failed", "project_id", projectID, "event", event, "err", err)
		return
	}

	client := d.Client
	if client == nil {
		client = &http.Client{Timeout: 5 * time.Second}
	}

	for _, destination := range destinations {
		status := d.deliverOne(ctx, client, destination, event, body)
		if err := d.Store.RecordWebhookDelivery(context.Background(), destination.ID, status); err != nil {
			d.log().Warn("record webhook delivery failed", "webhook_id", destination.ID, "status", status, "err", err)
		}
	}
}

func (d *Deliverer) deliverOne(
	ctx context.Context,
	client *http.Client,
	destination store.WebhookDestination,
	event string,
	body []byte,
) int {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, destination.URL, bytes.NewReader(body))
	if err != nil {
		d.log().Warn("build webhook request failed", "webhook_id", destination.ID, "err", err)
		return 0
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "theta-observability/webhooks")
	req.Header.Set("X-Theta-Event", event)
	req.Header.Set("X-Theta-Timestamp", timestamp)
	req.Header.Set("X-Theta-Signature", webhookSignature(timestamp, body, destination.Secret))

	resp, err := client.Do(req)
	if err != nil {
		d.log().Warn("webhook delivery failed", "webhook_id", destination.ID, "url", destination.URL, "err", err)
		return 0
	}
	defer resp.Body.Close()
	return resp.StatusCode
}

func webhookSignature(timestamp string, body []byte, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	fmt.Fprintf(mac, "%s.%s", timestamp, body)
	return "sha256=" + hex.EncodeToString(mac.Sum(nil))
}

func (d *Deliverer) log() *slog.Logger {
	if d != nil && d.Log != nil {
		return d.Log
	}
	return slog.Default()
}
