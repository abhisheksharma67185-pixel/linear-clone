package gcs

import "testing"

func TestStoragePathsAreOrgScoped(t *testing.T) {
	t.Parallel()

	if got := ProjectPrefix("org_123", "proj_456"); got != "orgs/org_123/projects/proj_456" {
		t.Fatalf("unexpected project prefix %q", got)
	}
	if got := TraceObjectKey("org_123", "proj_456", "tr_789"); got != "orgs/org_123/projects/proj_456/traces/tr_789.json" {
		t.Fatalf("unexpected trace key %q", got)
	}
	if got := AttachmentObjectKey("org_123", "proj_456", "tr_789", "image.png"); got != "orgs/org_123/projects/proj_456/traces/tr_789/attachments/image.png" {
		t.Fatalf("unexpected attachment key %q", got)
	}
}
