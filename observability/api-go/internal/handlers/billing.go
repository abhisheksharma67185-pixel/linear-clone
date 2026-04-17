package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/theagi/theta-observability/api-go/internal/auth"
	"github.com/theagi/theta-observability/api-go/internal/store"
)

type Billing struct {
	Store         *store.Store
	WebhookSecret string
}

// POST /v1/billing/stripe/webhook
// Minimal signature verification to avoid a hard Stripe SDK dependency.
// Stripe sends `Stripe-Signature: t=<ts>,v1=<hex hmac>` — we recompute and
// constant-time compare. Real production code should use stripe-go webhook.ConstructEvent.
func (h *Billing) StripeWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if h.WebhookSecret != "" {
		if !verifyStripeSig(r.Header.Get("Stripe-Signature"), body, h.WebhookSecret) {
			writeErr(w, http.StatusUnauthorized, "bad_signature", "invalid stripe signature")
			return
		}
	}
	// TODO: route event types (invoice.paid, customer.subscription.updated, ...)
	writeJSON(w, http.StatusOK, map[string]string{"status": "received"})
}

func verifyStripeSig(header string, body []byte, secret string) bool {
	var ts, want string
	for _, part := range strings.Split(header, ",") {
		kv := strings.SplitN(part, "=", 2)
		if len(kv) != 2 {
			continue
		}
		switch kv[0] {
		case "t":
			ts = kv[1]
		case "v1":
			want = kv[1]
		}
	}
	if ts == "" || want == "" {
		return false
	}
	mac := hmac.New(sha256.New, []byte(secret))
	fmt.Fprintf(mac, "%s.%s", ts, string(body))
	got := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(got), []byte(want))
}

// GET /v1/usage?org_id=...
func (h *Billing) Usage(w http.ResponseWriter, r *http.Request) {
	uc, ok := auth.UserFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "no user")
		return
	}
	orgID := r.URL.Query().Get("org_id")
	if orgID == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "org_id required")
		return
	}
	if !contains(uc.Orgs, orgID) {
		writeErr(w, http.StatusForbidden, "forbidden", "not a member")
		return
	}
	now := time.Now().UTC()
	start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	u, err := h.Store.GetUsage(r.Context(), orgID, start, now)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db_error", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, u)
}
