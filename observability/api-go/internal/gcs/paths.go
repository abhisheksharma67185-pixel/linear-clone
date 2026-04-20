package gcs

import "fmt"

// ProjectPrefix returns the logical storage prefix for an org/project pair.
func ProjectPrefix(orgID, projectID string) string {
	return fmt.Sprintf("orgs/%s/projects/%s", orgID, projectID)
}

// TraceObjectKey returns the GCS object key for a raw trace payload.
func TraceObjectKey(orgID, projectID, traceID string) string {
	return fmt.Sprintf("%s/traces/%s.json", ProjectPrefix(orgID, projectID), traceID)
}

// AttachmentObjectKey returns the GCS object key for a trace attachment.
func AttachmentObjectKey(orgID, projectID, traceID, filename string) string {
	return fmt.Sprintf("%s/traces/%s/attachments/%s", ProjectPrefix(orgID, projectID), traceID, filename)
}
