package handlers

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
)

type fakeBillingStore struct {
	orgsByID         map[string]*models.Org
	orgsByCustomerID map[string]*models.Org
	reportedOrgIDs   []string
	lastCustomerSet  string
	lastSubOrgID     string
	lastSubCustomer  string
	lastSubID        string
	lastPlan         *string
}

func (s *fakeBillingStore) GetUsage(context.Context, string, time.Time, time.Time) (*models.UsageResponse, error) {
	return &models.UsageResponse{}, nil
}

func (s *fakeBillingStore) GetOrg(_ context.Context, id string) (*models.Org, error) {
	return s.orgsByID[id], nil
}

func (s *fakeBillingStore) GetOrgByStripeCustomerID(_ context.Context, customerID string) (*models.Org, error) {
	return s.orgsByCustomerID[customerID], nil
}

func (s *fakeBillingStore) SetOrgStripeCustomer(_ context.Context, orgID, customerID string) error {
	s.lastCustomerSet = customerID
	if org := s.orgsByID[orgID]; org != nil {
		s.orgsByCustomerID[customerID] = org
	}
	return nil
}

func (s *fakeBillingStore) UpdateOrgSubscription(_ context.Context, orgID, customerID, subscriptionID string, plan *string) error {
	s.lastSubOrgID = orgID
	s.lastSubCustomer = customerID
	s.lastSubID = subscriptionID
	s.lastPlan = plan
	if customerID != "" && s.orgsByID[orgID] != nil {
		s.orgsByCustomerID[customerID] = s.orgsByID[orgID]
	}
	if plan != nil && s.orgsByID[orgID] != nil {
		s.orgsByID[orgID].Plan = *plan
	}
	return nil
}

func (s *fakeBillingStore) ClearOrgSubscription(_ context.Context, orgID string, plan *string) error {
	s.lastSubOrgID = orgID
	s.lastSubID = ""
	s.lastPlan = plan
	if plan != nil && s.orgsByID[orgID] != nil {
		s.orgsByID[orgID].Plan = *plan
	}
	return nil
}

func (s *fakeBillingStore) MarkUsageReported(_ context.Context, orgID string) (int64, error) {
	s.reportedOrgIDs = append(s.reportedOrgIDs, orgID)
	return 7, nil
}

func TestVerifyStripeSig(t *testing.T) {
	body := []byte(`{"id":"evt_1"}`)
	secret := "whsec_test"
	ts := time.Now().Unix()

	got := stripeSignatureHeader(ts, body, secret)
	if !verifyStripeSig(got, body, secret) {
		t.Fatal("expected signature verification to pass")
	}

	if verifyStripeSig(got, body, "wrong-secret") {
		t.Fatal("expected signature verification to fail with wrong secret")
	}
}

func TestBillingWebhookRoutesSubscriptionUpdated(t *testing.T) {
	store := &fakeBillingStore{
		orgsByID: map[string]*models.Org{
			"org_test": {ID: "org_test", Plan: "free"},
		},
		orgsByCustomerID: map[string]*models.Org{},
	}
	handler := &Billing{Store: store, WebhookSecret: "whsec_test"}

	body := []byte(`{
		"id":"evt_sub_1",
		"type":"customer.subscription.updated",
		"data":{"object":{
			"id":"sub_123",
			"customer":"cus_123",
			"metadata":{"org_id":"org_test"},
			"items":{"data":[{"price":{"lookup_key":"team_monthly"}}]}
		}}
	}`)
	req := httptest.NewRequest(http.MethodPost, "/v1/billing/stripe/webhook", bytes.NewReader(body))
	req.Header.Set("Stripe-Signature", stripeSignatureHeader(time.Now().Unix(), body, "whsec_test"))
	rec := httptest.NewRecorder()

	handler.StripeWebhook(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200: %s", rec.Code, rec.Body.String())
	}
	if store.lastSubOrgID != "org_test" || store.lastSubID != "sub_123" || store.lastSubCustomer != "cus_123" {
		t.Fatalf("subscription update not recorded correctly: org=%q customer=%q sub=%q", store.lastSubOrgID, store.lastSubCustomer, store.lastSubID)
	}
	if store.lastPlan == nil || *store.lastPlan != "team" {
		t.Fatalf("plan = %#v, want team", store.lastPlan)
	}
}

func TestBillingWebhookMarksUsageReportedOnInvoicePaid(t *testing.T) {
	org := &models.Org{ID: "org_test", Plan: "pro"}
	store := &fakeBillingStore{
		orgsByID: map[string]*models.Org{"org_test": org},
		orgsByCustomerID: map[string]*models.Org{
			"cus_123": org,
		},
	}
	handler := &Billing{Store: store, WebhookSecret: "whsec_test"}

	body := []byte(`{
		"id":"evt_invoice_1",
		"type":"invoice.paid",
		"data":{"object":{
			"id":"in_123",
			"customer":"cus_123"
		}}
	}`)
	req := httptest.NewRequest(http.MethodPost, "/v1/billing/stripe/webhook", bytes.NewReader(body))
	req.Header.Set("Stripe-Signature", stripeSignatureHeader(time.Now().Unix(), body, "whsec_test"))
	rec := httptest.NewRecorder()

	handler.StripeWebhook(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200: %s", rec.Code, rec.Body.String())
	}
	if len(store.reportedOrgIDs) != 1 || store.reportedOrgIDs[0] != "org_test" {
		t.Fatalf("reported org ids = %#v, want [org_test]", store.reportedOrgIDs)
	}
}

func stripeSignatureHeader(ts int64, body []byte, secret string) string {
	tsText := strconv.FormatInt(ts, 10)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(tsText))
	mac.Write([]byte("."))
	mac.Write(body)
	return "t=" + tsText + ",v1=" + hex.EncodeToString(mac.Sum(nil))
}
