package handlers

import (
	"net/http"

	"github.com/theagi/theta-observability/api-go/openapi"
)

// GET /v1/openapi.json — serves the embedded OpenAPI 3.1 spec as JSON.
func OpenAPI(w http.ResponseWriter, r *http.Request) {
	b, err := openapi.JSON()
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "spec_error", err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(b)
}
