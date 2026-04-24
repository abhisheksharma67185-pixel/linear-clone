// Pure helpers for the Customer requests settings page.
// Kept in a separate module so the gating + validation logic can be unit
// tested without rendering the component tree.

export type CustomerRequestEntry = {
  id: string
  name: string
  color: string
  isDefault?: boolean
}

export type DomainEntry = { id: string; value: string }

export type ExternalDataProvider =
  | "none"
  | "attio"
  | "hubspot"
  | "salesforce"

export const EXTERNAL_DATA_PROVIDERS: {
  value: ExternalDataProvider
  label: string
}[] = [
  { value: "none", label: "None" },
  { value: "attio", label: "Attio" },
  { value: "hubspot", label: "HubSpot" },
  { value: "salesforce", label: "Salesforce" },
]

export function externalDataProviderLabel(p: ExternalDataProvider): string {
  return (
    EXTERNAL_DATA_PROVIDERS.find((x) => x.value === p)?.label ?? "None"
  )
}

/**
 * The Enable Customer requests toggle acts as a master gate. When off, every
 * subsequent section in the page should be visually dimmed and non-interactive.
 */
export function isSubSectionInteractive(enabled: boolean): boolean {
  return enabled === true
}

// Accepts either a bare domain (e.g. "example.com") or a full email address
// ("foo@example.com"). This is the same validation the UI applies when the
// user saves a new Excluded / Generic domains row.
const DOMAIN_RE =
  /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,}|\.[A-Za-z0-9-]{2,63}\.[A-Za-z]{2,})+$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidDomainOrEmail(value: string): boolean {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return false
  if (trimmed.includes("@")) return EMAIL_RE.test(trimmed)
  return DOMAIN_RE.test(trimmed)
}

/**
 * Normalise a dropdown trigger label — ensures casing matches the option
 * label exactly. Internal state stays lowercase; the label is title-cased on
 * display. Used by the Revenue formatting / currency / team selector.
 */
export function displayLabelForValue<T extends string>(
  value: T,
  options: { value: T; label: string }[]
): string {
  return options.find((o) => o.value === value)?.label ?? value
}
