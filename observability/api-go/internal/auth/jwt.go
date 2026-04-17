package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// DashboardClaims is the shape of the JWT minted by the NextAuth dashboard.
type DashboardClaims struct {
	UserID string   `json:"sub"`
	Email  string   `json:"email"`
	Orgs   []string `json:"orgs"`
	jwt.RegisteredClaims
}

// ParseDashboardJWT verifies an HS256 JWT using the shared secret and
// returns parsed claims. It enforces expiry and a sensible leeway.
func ParseDashboardJWT(token, secret string) (*DashboardClaims, error) {
	if token == "" || secret == "" {
		return nil, errors.New("missing token or secret")
	}
	claims := &DashboardClaims{}
	parsed, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
		if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	}, jwt.WithLeeway(30*time.Second))
	if err != nil {
		return nil, err
	}
	if !parsed.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

// MintDashboardJWT is a helper for tests / local tooling. The dashboard
// itself mints tokens from NextAuth — this is not used in production.
func MintDashboardJWT(secret, userID, email string, orgs []string, ttl time.Duration) (string, error) {
	claims := DashboardClaims{
		UserID: userID,
		Email:  email,
		Orgs:   orgs,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   userID,
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}
