package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/gcs"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ids"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/models"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

type Media struct {
	GCS   *gcs.Client
	Store *store.Store
}

// POST /v1/media/signed-url — returns a V4 signed URL the SDK can PUT to.
func (h *Media) SignedURL(w http.ResponseWriter, r *http.Request) {
	ac, ok := auth.APIKeyFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "missing api key")
		return
	}
	var req models.SignedURLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeErr(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if req.ContentType == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "content_type required")
		return
	}
	traceID := req.TraceID
	if traceID == "" {
		traceID = ids.Trace()
	}
	filename := sanitizeFilename(req.Filename)
	if filename == "" {
		filename = fmt.Sprintf("att_%s", ids.Step())
	}
	key := gcs.AttachmentObjectKey(ac.OrgID, ac.ProjectID, traceID, filename)
	url, exp, err := h.GCS.SignedPutURL(r.Context(), key, req.ContentType, 15*time.Minute)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "sign_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, models.SignedURLResponse{
		URL:       url,
		GSURI:     h.GCS.GSURI(key),
		ExpiresAt: exp,
	})
}

// POST /v1/media/upload — streams the request body straight to GCS. This is
// the fallback/default path the SDKs use when signed URLs aren't supported
// (e.g. fake-gcs in dev). Accepts `Content-Type` + query `trace_id=&name=`.
// Max body 64 MiB.
func (h *Media) Upload(w http.ResponseWriter, r *http.Request) {
	ac, ok := auth.APIKeyFromContext(r.Context())
	if !ok {
		writeErr(w, http.StatusUnauthorized, "unauthorized", "missing api key")
		return
	}
	ct := r.Header.Get("Content-Type")
	if ct == "" {
		ct = "application/octet-stream"
	}
	traceID := r.URL.Query().Get("trace_id")
	if traceID == "" {
		traceID = ids.Trace()
	}
	filename := sanitizeFilename(r.URL.Query().Get("name"))
	if filename == "" {
		filename = fmt.Sprintf("att_%s", ids.Step())
	}
	key := gcs.AttachmentObjectKey(ac.OrgID, ac.ProjectID, traceID, filename)
	body := http.MaxBytesReader(w, r.Body, 64<<20)
	defer body.Close()
	counter := &countingReader{r: body}
	if err := h.GCS.Put(r.Context(), key, counter, ct); err != nil {
		writeErr(w, http.StatusInternalServerError, "upload_failed", err.Error())
		return
	}
	if h.Store != nil && counter.n > 0 {
		_ = h.Store.RecordUsage(r.Context(), ac.OrgID, ac.ProjectID, "media.bytes_stored", counter.n)
	}
	_ = io.EOF // keep io import live
	writeJSON(w, http.StatusOK, models.SignedURLResponse{
		URL:       "",
		GSURI:     h.GCS.GSURI(key),
		ExpiresAt: time.Now().Add(time.Hour),
	})
}

// GET /v1/media/serve?uri=gs://bucket/key — streams a GCS object to the browser.
// Used by the dashboard to render image/audio/video attachments stored as gs:// URIs.
func (h *Media) Serve(w http.ResponseWriter, r *http.Request) {
	gsURI := r.URL.Query().Get("uri")
	if gsURI == "" {
		writeErr(w, http.StatusBadRequest, "bad_request", "uri query param required")
		return
	}
	if !strings.HasPrefix(gsURI, "gs://") {
		writeErr(w, http.StatusBadRequest, "bad_request", "uri must start with gs://")
		return
	}
	rest := strings.TrimPrefix(gsURI, "gs://")
	parts := strings.SplitN(rest, "/", 2)
	if len(parts) != 2 {
		writeErr(w, http.StatusBadRequest, "bad_request", "malformed gs uri")
		return
	}
	key := parts[1]

	rd, err := h.GCS.Get(r.Context(), key)
	if err != nil {
		writeErr(w, http.StatusNotFound, "not_found", "object not found")
		return
	}
	defer rd.Close()

	// Guess content type from extension
	ct := "application/octet-stream"
	if strings.HasSuffix(key, ".png") {
		ct = "image/png"
	} else if strings.HasSuffix(key, ".jpg") || strings.HasSuffix(key, ".jpeg") {
		ct = "image/jpeg"
	} else if strings.HasSuffix(key, ".wav") {
		ct = "audio/wav"
	} else if strings.HasSuffix(key, ".mp4") {
		ct = "video/mp4"
	} else if strings.HasSuffix(key, ".json") {
		ct = "application/json"
	} else if strings.HasSuffix(key, ".webp") {
		ct = "image/webp"
	}

	w.Header().Set("Content-Type", ct)
	w.Header().Set("Cache-Control", "public, max-age=3600")
	io.Copy(w, rd)
}

func sanitizeFilename(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, "..", "")
	s = strings.ReplaceAll(s, "/", "_")
	s = strings.ReplaceAll(s, "\\", "_")
	return s
}

type countingReader struct {
	r io.Reader
	n int64
}

func (r *countingReader) Read(p []byte) (int, error) {
	n, err := r.r.Read(p)
	r.n += int64(n)
	return n, err
}
