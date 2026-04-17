package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
)

// ExtractAPIKey pulls a plaintext API key out of either the Authorization
// bearer header or the `x-api-key` header. Returns "" if absent.
func ExtractAPIKey(r *http.Request) string {
	if v := r.Header.Get("x-api-key"); v != "" {
		return strings.TrimSpace(v)
	}
	if v := r.Header.Get("Authorization"); v != "" {
		if strings.HasPrefix(strings.ToLower(v), "bearer ") {
			return strings.TrimSpace(v[7:])
		}
	}
	return ""
}

// FingerprintAPIKey returns a fast lookup fingerprint (sha256, not argon2)
// for index-friendly lookups. The full argon2id hash still gates actual
// authentication in VerifyKey.
func FingerprintAPIKey(plain string) string {
	sum := sha256.Sum256([]byte(plain))
	return hex.EncodeToString(sum[:])
}

// ValidateKeyPlaintext ensures a key has a recognized prefix and minimum length.
// Accepted prefixes: tk_, tobs_live_, tobs_test_, or any non-empty key >= 16 chars.
func ValidateKeyPlaintext(key string) error {
	if len(key) < 16 {
		return errors.New("api key too short")
	}
	return nil
}
