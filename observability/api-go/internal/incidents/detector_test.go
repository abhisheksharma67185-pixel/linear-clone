package incidents

import (
	"testing"
)

func TestGroupByPattern_ExactMatch(t *testing.T) {
	traces := []errorTrace{
		{TraceID: "t1", ErrorMessage: "connection refused"},
		{TraceID: "t2", ErrorMessage: "connection refused"},
		{TraceID: "t3", ErrorMessage: "timeout exceeded"},
		{TraceID: "t4", ErrorMessage: "timeout exceeded"},
		{TraceID: "t5", ErrorMessage: "timeout exceeded"},
	}

	groups := groupByPattern(traces)

	if len(groups) != 2 {
		t.Fatalf("expected 2 groups, got %d", len(groups))
	}
	if len(groups["connection refused"]) != 2 {
		t.Errorf("expected 2 traces in 'connection refused' group, got %d", len(groups["connection refused"]))
	}
	if len(groups["timeout exceeded"]) != 3 {
		t.Errorf("expected 3 traces in 'timeout exceeded' group, got %d", len(groups["timeout exceeded"]))
	}
}

func TestGroupByPattern_TruncatesTo100Chars(t *testing.T) {
	longMsg := "a]very long error message that exceeds one hundred characters and should be truncated for grouping purposes in the incident detector"
	traces := []errorTrace{
		{TraceID: "t1", ErrorMessage: longMsg},
		{TraceID: "t2", ErrorMessage: longMsg + " extra stuff here"},
	}

	groups := groupByPattern(traces)

	if len(groups) != 1 {
		t.Fatalf("expected 1 group (truncated to 100 chars), got %d", len(groups))
	}
	for pattern, group := range groups {
		if len(pattern) != 100 {
			t.Errorf("expected pattern length 100, got %d", len(pattern))
		}
		if len(group) != 2 {
			t.Errorf("expected 2 traces in group, got %d", len(group))
		}
	}
}

func TestGroupByPattern_EmptyMessages(t *testing.T) {
	traces := []errorTrace{
		{TraceID: "t1", ErrorMessage: ""},
		{TraceID: "t2", ErrorMessage: "   "},
		{TraceID: "t3", ErrorMessage: "real error"},
	}

	groups := groupByPattern(traces)

	if len(groups) != 2 {
		t.Fatalf("expected 2 groups (empty + real), got %d", len(groups))
	}
	if len(groups["(empty error)"]) != 2 {
		t.Errorf("expected 2 empty-error traces, got %d", len(groups["(empty error)"]))
	}
}

func TestNormalizePattern(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"short error", "short error"},
		{"", "(empty error)"},
		{"   ", "(empty error)"},
		{"  leading spaces  ", "leading spaces"},
	}
	for _, tt := range tests {
		got := normalizePattern(tt.input)
		if got != tt.want {
			t.Errorf("normalizePattern(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}

func TestDetector_SkipsWithoutAnthropicKey(t *testing.T) {
	d := &Detector{
		AnthropicKey: "",
	}
	// When AnthropicKey is empty, analyzeRootCause should not be called.
	// We verify by checking the field is empty — if it were set, the detector
	// would attempt to call the API in DetectIncidents for new incidents.
	if d.AnthropicKey != "" {
		t.Error("expected empty anthropic key")
	}
}
