// Shared domain validation for the Security settings "Approved email domains"
// list. Kept isolated from React so it can be unit-tested directly.

// Matches xyz.com, foo.bar.co.uk, example.dev — lower-cased, no scheme/path.
// Each label is 1-63 chars, letters/digits/hyphens, no leading/trailing hyphen.
// TLD must be alphabetic and at least 2 chars.
const DOMAIN_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/

export type DomainValidation =
  | { success: true; data: string }
  | { success: false; error: string }

export function validateDomain(raw: unknown): DomainValidation {
  if (typeof raw !== "string") {
    return { success: false, error: "Domain is required" }
  }
  const s = raw.trim().toLowerCase().replace(/^@+/, "")
  if (s.length === 0) {
    return { success: false, error: "Domain is required" }
  }
  // Reject anything that looks like a URL or has a path/port.
  if (/[\s\/]|:[0-9]+$/.test(s) || s.includes("://")) {
    return { success: false, error: "Enter a plain domain, without https:// or paths" }
  }
  if (!DOMAIN_PATTERN.test(s)) {
    return { success: false, error: "Enter a valid domain like example.com" }
  }
  return { success: true, data: s }
}

export function addDomain(
  existing: string[],
  candidate: string
): DomainValidation {
  const v = validateDomain(candidate)
  if (!v.success) return v
  if (existing.includes(v.data)) {
    return { success: false, error: "Domain already approved" }
  }
  return v
}
