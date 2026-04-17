package bq

import "testing"

func TestMetadataJSONPath(t *testing.T) {
	tests := []struct {
		name string
		key  string
		want string
	}{
		{name: "simple", key: "workflow", want: "$.workflow"},
		{name: "nested", key: "agent.version", want: "$.agent.version"},
		{name: "hyphenated", key: "customer.tier-name", want: "$.customer.\"tier-name\""},
		{name: "invalid empty segment", key: "agent..version", want: ""},
		{name: "blank", key: "   ", want: ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := metadataJSONPath(tt.key)
			if got != tt.want {
				t.Fatalf("metadataJSONPath(%q) = %q, want %q", tt.key, got, tt.want)
			}
		})
	}
}
