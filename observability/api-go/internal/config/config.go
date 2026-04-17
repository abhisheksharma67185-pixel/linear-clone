package config

import (
	"os"
	"strings"
)

type Config struct {
	Port                 string
	Env                  string
	DBURL                string
	GCSEndpoint          string
	GCSBucket            string
	BQProject            string
	BQDataset            string
	BQEndpoint           string
	JWTSecret            string
	StripeWebhookSecret  string
	AnthropicAPIKey      string
	AllowedOrigins       []string
}

func Load() Config {
	return Config{
		Port:                getenv("PORT", "8080"),
		Env:                 getenv("ENV", "dev"),
		DBURL:               os.Getenv("DB_URL"),
		GCSEndpoint:         os.Getenv("GCS_ENDPOINT"),
		GCSBucket:           getenv("GCS_BUCKET", "theta-obs-dev"),
		BQProject:           getenv("BQ_PROJECT", "local"),
		BQDataset:           getenv("BQ_DATASET", "theta_observability"),
		BQEndpoint:          os.Getenv("BQ_ENDPOINT"),
		JWTSecret:           getenv("JWT_SECRET", "dev-secret-change-me"),
		StripeWebhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),
		AnthropicAPIKey:     os.Getenv("ANTHROPIC_API_KEY"),
		AllowedOrigins:      splitCSV(getenv("ALLOWED_ORIGINS", "http://localhost:3000")),
	}
}

func (c Config) IsDev() bool { return c.Env == "dev" || c.Env == "development" || c.Env == "" }

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
