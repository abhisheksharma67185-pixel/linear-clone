package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/theagi/theta-observability/api-go/internal/store"
)

// Health returns 200 always; Ready pings Postgres.
type Health struct {
	Store *store.Store
	Ver   string
}

func (h *Health) Live(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "version": h.Ver})
}

func (h *Health) Ready(w http.ResponseWriter, r *http.Request) {
	if h.Store != nil {
		if err := h.Store.Ping(r.Context()); err != nil {
			writeErr(w, http.StatusServiceUnavailable, "db_down", err.Error())
			return
		}
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

// writeJSON / writeErr are package-scoped helpers used by every handler.
func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeErr(w http.ResponseWriter, status int, code, msg string) {
	writeJSON(w, status, map[string]any{
		"error": map[string]string{"code": code, "message": msg},
	})
}
