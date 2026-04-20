package handlers

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

type billingStore interface {
	GetUsage(ctx context.Context, orgID string, since, until time.Time) (*models.UsageResponse, error)
	GetOrg(ctx context.Context, id string) (*models.Org, error)
	GetOrgByStripeCustomerID(ctx context.Context, customerID string) (*models.Org, error)
	SetOrgStripeCustomer(ctx context.Context, orgID, customerID string) error
	UpdateOrgSubscription(ctx context.Context, orgID, customerID, subscriptionID string, plan *string) error
	ClearOrgSubscription(ctx context.Context, orgID string, plan *string) error
	MarkUsageReported(ctx context.Context, orgID string) (int64, error)
}

type Billing struct {
	Store         billingStore
	WebhookSecret string
}

type stripeEvent struct {
	ID   string `json:"id"`
	Type string `json:"type"`
	Data struct {
		Object map[string]any `json:"object"`
	} `json:"data"`
}

// POST /v1/billing/stripe/webhook
// Stripe sends `Stripe-Signature: t=<ts>,v1=<hex hmac>` — we recompute and
// constant-time compare without pulling in the full Stripe SDK.
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
	var event stripeEvent
	if err := json.Unmarshal(body, &event); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", "invalid stripe event payload")
		return
	}
	result, err := h.routeStripeEvent(r.Context(), event)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "billing_webhook_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
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
	parsedTs, err := strconv.ParseInt(ts, 10, 64)
	if err != nil {
		return false
	}
	if delta := time.Since(time.Unix(parsedTs, 0)); delta > 5*time.Minute || delta < -5*time.Minute {
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

func (h *Billing) routeStripeEvent(ctx context.Context, event stripeEvent) (map[string]any, error) {
	result := map[string]any{
		"status":     "received",
		"event_id":   event.ID,
		"event_type": event.Type,
		"handled":    false,
	}
	if h.Store == nil {
		result["reason"] = "billing store unavailable"
		return result, nil
	}

	object := event.Data.Object
	org, err := h.resolveOrgForStripeObject(ctx, object)
	if err != nil {
		return nil, err
	}

	switch event.Type {
	case "checkout.session.completed":
		if org == nil {
			result["reason"] = "org not found"
			return result, nil
		}
		customerID := nestedString(object, "customer")
		subscriptionID := nestedString(object, "subscription")
		if err := h.Store.SetOrgStripeCustomer(ctx, org.ID, customerID); err != nil {
			return nil, err
		}
		if subscriptionID != "" {
			plan := resolveStripePlan(object)
			if err := h.Store.UpdateOrgSubscription(ctx, org.ID, customerID, subscriptionID, plan); err != nil {
				return nil, err
			}
			if plan != nil {
				org.Plan = *plan
			}
		}
		result["handled"] = true
		result["org_id"] = org.ID
		if customerID != "" {
			result["customer_id"] = customerID
		}
		if subscriptionID != "" {
			result["subscription_id"] = subscriptionID
		}
		if plan := resolveStripePlan(object); plan != nil {
			result["plan"] = *plan
		}
		return result, nil
	case "customer.subscription.created", "customer.subscription.updated":
		if org == nil {
			result["reason"] = "org not found"
			return result, nil
		}
		customerID := nestedString(object, "customer")
		subscriptionID := nestedString(object, "id")
		plan := resolveStripePlan(object)
		if err := h.Store.UpdateOrgSubscription(ctx, org.ID, customerID, subscriptionID, plan); err != nil {
			return nil, err
		}
		result["handled"] = true
		result["org_id"] = org.ID
		result["subscription_id"] = subscriptionID
		if customerID != "" {
			result["customer_id"] = customerID
		}
		if plan != nil {
			result["plan"] = *plan
		}
		return result, nil
	case "customer.subscription.deleted":
		if org == nil {
			result["reason"] = "org not found"
			return result, nil
		}
		free := "free"
		if err := h.Store.ClearOrgSubscription(ctx, org.ID, &free); err != nil {
			return nil, err
		}
		result["handled"] = true
		result["org_id"] = org.ID
		result["plan"] = free
		return result, nil
	case "invoice.paid":
		if org == nil {
			result["reason"] = "org not found"
			return result, nil
		}
		reported, err := h.Store.MarkUsageReported(ctx, org.ID)
		if err != nil {
			return nil, err
		}
		result["handled"] = true
		result["org_id"] = org.ID
		result["reported_usage_rows"] = reported
		if invoiceID := nestedString(object, "id"); invoiceID != "" {
			result["invoice_id"] = invoiceID
		}
		return result, nil
	case "invoice.payment_failed":
		if org == nil {
			result["reason"] = "org not found"
			return result, nil
		}
		result["handled"] = true
		result["org_id"] = org.ID
		result["reason"] = "payment_failed"
		if invoiceID := nestedString(object, "id"); invoiceID != "" {
			result["invoice_id"] = invoiceID
		}
		return result, nil
	default:
		result["reason"] = "event ignored"
		return result, nil
	}
}

func (h *Billing) resolveOrgForStripeObject(ctx context.Context, object map[string]any) (*models.Org, error) {
	if h.Store == nil {
		return nil, nil
	}
	if orgID := nestedString(object, "metadata", "org_id"); orgID != "" {
		org, err := h.Store.GetOrg(ctx, orgID)
		if err != nil || org != nil {
			return org, err
		}
	}
	customerID := nestedString(object, "customer")
	if customerID == "" {
		customerID = nestedString(object, "customer_id")
	}
	if customerID == "" {
		return nil, nil
	}
	return h.Store.GetOrgByStripeCustomerID(ctx, customerID)
}

func resolveStripePlan(object map[string]any) *string {
	candidates := []string{
		nestedString(object, "metadata", "plan"),
		nestedString(object, "display_items", "0", "plan", "nickname"),
		nestedString(object, "plan", "nickname"),
		nestedString(object, "plan", "id"),
		nestedString(object, "items", "data", "0", "price", "lookup_key"),
		nestedString(object, "items", "data", "0", "price", "nickname"),
		nestedString(object, "items", "data", "0", "price", "id"),
	}
	for _, candidate := range candidates {
		if plan := normalizePlan(candidate); plan != nil {
			return plan
		}
	}
	return nil
}

func normalizePlan(value string) *string {
	value = strings.TrimSpace(strings.ToLower(value))
	if value == "" {
		return nil
	}
	switch {
	case strings.Contains(value, "enterprise"):
		plan := "enterprise"
		return &plan
	case strings.Contains(value, "team"), strings.Contains(value, "business"):
		plan := "team"
		return &plan
	case strings.Contains(value, "pro"), strings.Contains(value, "growth"):
		plan := "pro"
		return &plan
	case slices.Contains([]string{"free", "basic", "starter"}, value):
		plan := "free"
		return &plan
	default:
		return nil
	}
}

func nestedString(value any, path ...string) string {
	current := value
	for _, part := range path {
		switch typed := current.(type) {
		case map[string]any:
			next, ok := typed[part]
			if !ok {
				return ""
			}
			current = next
		case []any:
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(typed) {
				return ""
			}
			current = typed[index]
		default:
			return ""
		}
	}
	switch typed := current.(type) {
	case nil:
		return ""
	case string:
		return strings.TrimSpace(typed)
	case fmt.Stringer:
		return strings.TrimSpace(typed.String())
	default:
		return strings.TrimSpace(fmt.Sprint(typed))
	}
}
