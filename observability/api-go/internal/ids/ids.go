package ids

import (
	"crypto/rand"
	"fmt"
	"time"

	"github.com/oklog/ulid/v2"
)

// Prefixes for typed IDs across the platform.
const (
	PrefixTrace       = "tr_"
	PrefixStep        = "st_"
	PrefixOrg         = "org_"
	PrefixProject     = "proj_"
	PrefixToken       = "tk_"
	PrefixUser        = "usr_"
	PrefixInvite      = "inv_"
	PrefixMember      = "mem_"
	PrefixMetric      = "met_"
	PrefixMetricEvent = "mev_"
	PrefixIncident    = "inc_"
	PrefixCluster     = "clu_"
	PrefixWebhook     = "wh_"
	PrefixAnnotation   = "ann_"
	PrefixSavedFilter  = "sf_"
	PrefixThread       = "th_"
	PrefixMonitor      = "mon_"
)

func newULID() string {
	return ulid.MustNew(ulid.Timestamp(time.Now()), rand.Reader).String()
}

func withPrefix(p string) string { return p + newULID() }

func Trace() string       { return withPrefix(PrefixTrace) }
func Step() string        { return withPrefix(PrefixStep) }
func Org() string         { return withPrefix(PrefixOrg) }
func Project() string     { return withPrefix(PrefixProject) }
func Token() string       { return withPrefix(PrefixToken) }
func User() string        { return withPrefix(PrefixUser) }
func Invite() string      { return withPrefix(PrefixInvite) }
func Member() string      { return withPrefix(PrefixMember) }
func Metric() string      { return withPrefix(PrefixMetric) }
func MetricEvent() string { return withPrefix(PrefixMetricEvent) }
func Incident() string    { return withPrefix(PrefixIncident) }
func Cluster() string     { return withPrefix(PrefixCluster) }
func Webhook() string     { return withPrefix(PrefixWebhook) }
func Annotation() string   { return withPrefix(PrefixAnnotation) }
func SavedFilter() string  { return withPrefix(PrefixSavedFilter) }
func Thread() string       { return withPrefix(PrefixThread) }
func Monitor() string      { return withPrefix(PrefixMonitor) }

// RawSecret returns a high-entropy random string suitable to use as the
// secret portion of an API key. The caller is responsible for prefixing with
// `tk_` and hashing for storage.
func RawSecret(n int) (string, error) {
	if n <= 0 {
		n = 32
	}
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	// hex-ish but compact: base32-style
	const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"
	out := make([]byte, n)
	for i, c := range b {
		out[i] = alphabet[int(c)%len(alphabet)]
	}
	return string(out), nil
}

// NewAPIKey returns ("tk_<ulid>_<secret>", error) — the full plaintext token
// returned to the user exactly once.
func NewAPIKey() (string, error) {
	secret, err := RawSecret(32)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s%s_%s", PrefixToken, newULID(), secret), nil
}
