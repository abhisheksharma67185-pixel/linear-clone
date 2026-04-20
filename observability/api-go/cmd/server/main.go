package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/auth"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/bq"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/clusters"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/config"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/embeddings"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/gcs"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/handlers"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/incidents"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/ingest"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/logger"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/sse"
	"github.com/RahulSulegoakar/theta-rl-labs/observability/api-go/internal/store"
)

const version = "0.1.0"

func main() {
	cfg := config.Load()
	log := logger.New(cfg.IsDev())
	slog.SetDefault(log)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Dependencies.
	pg, err := store.New(ctx, cfg.DBURL)
	if err != nil {
		log.Warn("postgres unavailable — control-plane endpoints will fail", "err", err)
	}

	gcsCli, err := gcs.New(ctx, cfg.GCSBucket, cfg.GCSEndpoint)
	if err != nil {
		log.Error("gcs init failed", "err", err)
		os.Exit(1)
	}
	defer gcsCli.Close()

	bqWriter, err := bq.NewWriter(ctx, cfg.BQProject, cfg.BQDataset, cfg.BQEndpoint, log)
	if err != nil {
		log.Error("bq init failed", "err", err)
		os.Exit(1)
	}

	hub := sse.NewHub()

	embedder := &embeddings.EmbeddingWorker{Store: pg, APIKey: cfg.AnthropicAPIKey, Log: log}
	if !embedder.Enabled() {
		log.Warn("ANTHROPIC_API_KEY not set — semantic search + embeddings disabled")
	}

	pipeline := &ingest.Pipeline{GCS: gcsCli, BQ: bqWriter, Hub: hub, Embedder: embedder, Log: log}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(slogChiLogger(log))
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/ping"))
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "x-api-key"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Handlers.
	h := &handlers.Health{Store: pg, Ver: version}
	traceH := &handlers.Traces{Pipeline: pipeline, BQ: bqWriter, GCS: gcsCli, Hub: hub, Store: pg}
	stepH := &handlers.Steps{Pipeline: pipeline, BQ: bqWriter}
	mediaH := &handlers.Media{GCS: gcsCli, Store: pg}
	projectsH := &handlers.Projects{Store: pg}
	keysH := &handlers.Keys{Store: pg}
	membersH := &handlers.Members{Store: pg}
	authH := &handlers.Auth{Store: pg}
	billingH := &handlers.Billing{Store: pg, WebhookSecret: cfg.StripeWebhookSecret}
	metricsH := &handlers.Metrics{Store: pg}
	searchH := &handlers.Search{Store: pg, Embedder: embedder, BQ: bqWriter, Log: log}
	webhooksH := &handlers.Webhooks{Store: pg}
	annotationsH := &handlers.Annotations{Store: pg}
	threadsH := &handlers.Threads{Store: pg}
	monitorsH := &handlers.Monitors{Store: pg}
	exportsH := &handlers.Exports{Store: pg, BQ: bqWriter, GCS: gcsCli}

	clusterDiscoverer := &clusters.Discoverer{
		Store:        pg,
		AnthropicKey: cfg.AnthropicAPIKey,
		Log:          log,
	}
	clustersH := &handlers.Clusters{Store: pg, Discoverer: clusterDiscoverer, Log: log}

	incidentDetector := &incidents.Detector{
		Store:        pg,
		BQ:           bqWriter,
		AnthropicKey: cfg.AnthropicAPIKey,
		Log:          log,
		ProjectID:    cfg.BQProject,
		Dataset:      cfg.BQDataset,
	}
	incidentsH := &handlers.Incidents{Store: pg, Detector: incidentDetector, Log: log}

	// Public routes.
	r.Get("/healthz", h.Live)
	r.Get("/readyz", h.Ready)
	r.Get("/v1/openapi.json", handlers.OpenAPI)
	r.Get("/v1/traces/{id}/tail", traceH.Tail) // onboarding live tail, cookie/token gate in dashboard
	r.Post("/v1/signup", authH.Signup)
	r.Post("/v1/billing/stripe/webhook", billingH.StripeWebhook)
	r.Get("/v1/media/serve", mediaH.Serve)

	// API-key-scoped ingest routes (write).
	r.Group(func(r chi.Router) {
		if pg != nil {
			r.Use(auth.APIKeyMiddleware(pg))
		}
		r.Post("/v1/traces", traceH.Create)
		r.Post("/v1/events", traceH.CreateEvent)
		r.Post("/v1/imports/traces", traceH.Import)
		r.Post("/v1/traces/{id}/steps", stepH.Append)
		r.Post("/v1/media/signed-url", mediaH.SignedURL)
		r.Post("/v1/media/upload", mediaH.Upload)
	})

	// Read routes: accept either an API key (SDK) or a dashboard JWT (UI).
	r.Group(func(r chi.Router) {
		if pg != nil {
			r.Use(auth.EitherAuthMiddleware(pg, cfg.JWTSecret))
		}
		r.Get("/v1/traces", traceH.List)
		r.Get("/v1/traces/{id}", traceH.Get)
		r.Post("/v1/metrics", metricsH.Create)
		r.Post("/v1/metrics/{id}/events", metricsH.RecordEvent)
		r.Get("/v1/traces/{id}/metrics", metricsH.TraceMetrics)
		r.Post("/v1/search", searchH.Search)
		r.Post("/v1/traces/{id}/annotations", annotationsH.Create)
		r.Get("/v1/traces/{id}/annotations", annotationsH.ListForTrace)
	})

	// Dashboard JWT-scoped control-plane routes.
	r.Group(func(r chi.Router) {
		r.Use(auth.JWTMiddleware(cfg.JWTSecret))
		r.Get("/v1/orgs", authH.ListOrgs)
		r.Post("/v1/orgs", authH.CreateOrg)
		r.Get("/v1/orgs/{org_id}/members", membersH.List)
		r.Post("/v1/invites", membersH.Invite)
		r.Post("/v1/invites/accept", membersH.Accept)

		r.Get("/v1/projects", projectsH.List)
		r.Post("/v1/projects", projectsH.Create)
		r.Get("/v1/projects/{id}", projectsH.Get)
		r.Get("/v1/projects/{id}/exports/otel", exportsH.ExportOTel)
		r.Get("/v1/projects/{id}/threads", threadsH.List)
		r.Post("/v1/projects/{id}/threads", threadsH.Create)
		r.Get("/v1/threads/{thread_id}", threadsH.Get)
		r.Patch("/v1/threads/{thread_id}", threadsH.Patch)
		r.Delete("/v1/threads/{thread_id}", threadsH.Delete)

		r.Get("/v1/projects/{id}/monitors", monitorsH.List)
		r.Post("/v1/projects/{id}/monitors", monitorsH.Create)
		r.Get("/v1/monitors/{monitor_id}", monitorsH.Get)
		r.Patch("/v1/monitors/{monitor_id}", monitorsH.Patch)
		r.Delete("/v1/monitors/{monitor_id}", monitorsH.Delete)

		r.Get("/v1/metrics", metricsH.List)
		r.Get("/v1/metrics/{id}/events", metricsH.ListEvents)

		r.Get("/v1/projects/{id}/keys", keysH.List)
		r.Post("/v1/projects/{id}/keys", keysH.Create)
		r.Delete("/v1/projects/{id}/keys/{key_id}", keysH.Revoke)
		r.Patch("/v1/projects/{id}", projectsH.Patch)
		r.Get("/v1/projects/{id}/webhooks", webhooksH.List)
		r.Post("/v1/projects/{id}/webhooks", webhooksH.Create)
		r.Patch("/v1/projects/{id}/webhooks/{webhook_id}", webhooksH.Patch)
		r.Delete("/v1/projects/{id}/webhooks/{webhook_id}", webhooksH.Delete)

		r.Get("/v1/annotations", annotationsH.List)
		r.Delete("/v1/annotations/{id}", annotationsH.Delete)
		r.Get("/v1/annotations/labels", annotationsH.Labels)

		savedFiltersH := &handlers.SavedFilters{Store: pg}
		r.Get("/v1/projects/{id}/saved-filters", savedFiltersH.List)
		r.Post("/v1/projects/{id}/saved-filters", savedFiltersH.Create)
		r.Patch("/v1/saved-filters/{id}", savedFiltersH.Patch)
		r.Delete("/v1/saved-filters/{id}", savedFiltersH.Delete)

		r.Get("/v1/usage", billingH.Usage)

		r.Get("/v1/clusters", clustersH.List)
		r.Get("/v1/clusters/{id}", clustersH.Get)
		r.Post("/v1/clusters/discover", clustersH.Discover)

		r.Get("/v1/incidents", incidentsH.List)
		r.Get("/v1/incidents/{id}", incidentsH.Get)
		r.Patch("/v1/incidents/{id}", incidentsH.Patch)
		r.Post("/v1/incidents/detect", incidentsH.Detect)
		r.Post("/v1/traces/{id}/flag", traceH.Flag)

		adminH := &handlers.Admin{
			BQ:      bqWriter,
			GCS:     gcsCli,
			Project: cfg.BQProject,
			Dataset: cfg.BQDataset,
			Log:     log,
		}
		r.Patch("/v1/admin/traces/bulk", adminH.BulkPatch)
	})

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Info("listening", "port", cfg.Port, "env", cfg.Env)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("server error", "err", err)
			stop()
		}
	}()

	<-ctx.Done()
	log.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("server shutdown", "err", err)
	}
	if err := bqWriter.Close(shutdownCtx); err != nil {
		log.Error("bq close", "err", err)
	}
	if pg != nil {
		pg.Close()
	}
	log.Info("stopped")
}

// slogChiLogger is a tiny chi middleware that logs requests through slog.
func slogChiLogger(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
			next.ServeHTTP(ww, r)
			log.Info("http",
				"method", r.Method,
				"path", r.URL.Path,
				"status", ww.Status(),
				"bytes", ww.BytesWritten(),
				"ms", time.Since(start).Milliseconds(),
				"req_id", middleware.GetReqID(r.Context()),
			)
		})
	}
}
