package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

type ctxKey string

const (
	ctxAPIKey ctxKey = "apikey"
	ctxUser   ctxKey = "user"
)

// APIKeyContext is the value attached to the request context once an API key
// has been authenticated.
type APIKeyContext struct {
	KeyID     string
	ProjectID string
	OrgID     string
	Scopes    []string
}

// UserContext is attached after successful dashboard JWT verification.
type UserContext struct {
	UserID string
	Email  string
	Orgs   []string
}

// KeyVerifier resolves a plaintext API key into a scoped project/org context.
// Implementations should use argon2id verification + a hash-index lookup.
type KeyVerifier interface {
	VerifyKey(ctx context.Context, plaintext string) (*APIKeyContext, error)
}

// APIKeyMiddleware authenticates trace-ingest traffic.
func APIKeyMiddleware(v KeyVerifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := ExtractAPIKey(r)
			if key == "" {
				writeErr(w, http.StatusUnauthorized, "unauthorized", "missing API key")
				return
			}
			if err := ValidateKeyPlaintext(key); err != nil {
				writeErr(w, http.StatusUnauthorized, "unauthorized", err.Error())
				return
			}
			ac, err := v.VerifyKey(r.Context(), key)
			if err != nil || ac == nil {
				writeErr(w, http.StatusUnauthorized, "unauthorized", "invalid API key")
				return
			}
			ctx := context.WithValue(r.Context(), ctxAPIKey, ac)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// EitherAuthMiddleware accepts either an API key or a dashboard JWT. Used for
// read endpoints that both SDKs (ops) and the dashboard (UI) hit.
func EitherAuthMiddleware(v KeyVerifier, secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			raw := bearerToken(r)
			if raw == "" {
				raw = strings.TrimSpace(r.Header.Get("x-api-key"))
			}
			if raw == "" {
				writeErr(w, http.StatusUnauthorized, "unauthorized", "missing credentials")
				return
			}
			// Try as API key first (any non-JWT-looking token).
		if !strings.Contains(raw, ".") || strings.HasPrefix(raw, "tk_") || strings.HasPrefix(raw, "tobs_") {
				ac, err := v.VerifyKey(r.Context(), raw)
				if err == nil && ac != nil {
					next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ctxAPIKey, ac)))
					return
				}
				writeErr(w, http.StatusUnauthorized, "unauthorized", "invalid API key")
				return
			}
			claims, err := ParseDashboardJWT(raw, secret)
			if err != nil {
				writeErr(w, http.StatusUnauthorized, "unauthorized", err.Error())
				return
			}
			uc := &UserContext{UserID: claims.UserID, Email: claims.Email, Orgs: claims.Orgs}
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), ctxUser, uc)))
		})
	}
}

// JWTMiddleware authenticates dashboard traffic using the shared NextAuth
// HS256 secret.
func JWTMiddleware(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			raw := bearerToken(r)
			if raw == "" {
				writeErr(w, http.StatusUnauthorized, "unauthorized", "missing bearer token")
				return
			}
			claims, err := ParseDashboardJWT(raw, secret)
			if err != nil {
				writeErr(w, http.StatusUnauthorized, "unauthorized", err.Error())
				return
			}
			uc := &UserContext{UserID: claims.UserID, Email: claims.Email, Orgs: claims.Orgs}
			ctx := context.WithValue(r.Context(), ctxUser, uc)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func bearerToken(r *http.Request) string {
	v := r.Header.Get("Authorization")
	if strings.HasPrefix(strings.ToLower(v), "bearer ") {
		return strings.TrimSpace(v[7:])
	}
	return ""
}

// APIKeyFromContext extracts the authenticated API key context, if any.
func APIKeyFromContext(ctx context.Context) (*APIKeyContext, bool) {
	v, ok := ctx.Value(ctxAPIKey).(*APIKeyContext)
	return v, ok
}

// UserFromContext extracts the dashboard user context, if any.
func UserFromContext(ctx context.Context) (*UserContext, bool) {
	v, ok := ctx.Value(ctxUser).(*UserContext)
	return v, ok
}

func writeErr(w http.ResponseWriter, status int, code, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"error": map[string]string{"code": code, "message": msg},
	})
}
