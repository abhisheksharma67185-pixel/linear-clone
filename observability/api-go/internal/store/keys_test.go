package store

import "testing"

func TestAPIKeyPrefixUsesStableStem(t *testing.T) {
	plaintext := "tk_01KPJJ29GQM28GKRZ6Y6PHZ4YM_ajanmpnxt3pyacmnuhkv9k8ccg6nyxdg"
	got := apiKeyPrefix(plaintext)
	want := "tk_01KPJJ29GQM28GKRZ6Y6PHZ4YM"
	if got != want {
		t.Fatalf("apiKeyPrefix() = %q, want %q", got, want)
	}
}
