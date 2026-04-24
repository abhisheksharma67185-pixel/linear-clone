import { describe, expect, it } from "vitest"

import {
  displayLabelForValue,
  EXTERNAL_DATA_PROVIDERS,
  externalDataProviderLabel,
  isSubSectionInteractive,
  isValidDomainOrEmail,
} from "../lib/customer-requests"

describe("isSubSectionInteractive (master toggle gate)", () => {
  it("returns false when disabled", () => {
    expect(isSubSectionInteractive(false)).toBe(false)
  })
  it("returns true when enabled", () => {
    expect(isSubSectionInteractive(true)).toBe(true)
  })
})

describe("isValidDomainOrEmail", () => {
  it("accepts plain domains", () => {
    expect(isValidDomainOrEmail("example.com")).toBe(true)
    expect(isValidDomainOrEmail("sub.example.com")).toBe(true)
    expect(isValidDomainOrEmail("my-company.co.uk")).toBe(true)
  })
  it("accepts email addresses", () => {
    expect(isValidDomainOrEmail("jane@example.com")).toBe(true)
    expect(isValidDomainOrEmail("Jane.Doe+filter@Example.CO")).toBe(true)
  })
  it("rejects blank / whitespace", () => {
    expect(isValidDomainOrEmail("")).toBe(false)
    expect(isValidDomainOrEmail("   ")).toBe(false)
  })
  it("rejects malformed inputs", () => {
    expect(isValidDomainOrEmail("not a domain")).toBe(false)
    expect(isValidDomainOrEmail("@example.com")).toBe(false)
    expect(isValidDomainOrEmail("no-tld")).toBe(false)
    expect(isValidDomainOrEmail("http://example.com")).toBe(false)
  })
})

describe("externalDataProviderLabel + displayLabelForValue casing", () => {
  it("returns title-case label for each provider value", () => {
    expect(externalDataProviderLabel("none")).toBe("None")
    expect(externalDataProviderLabel("attio")).toBe("Attio")
    expect(externalDataProviderLabel("hubspot")).toBe("HubSpot")
    expect(externalDataProviderLabel("salesforce")).toBe("Salesforce")
  })

  it("displayLabelForValue keeps internal values lowercase while formatting for display", () => {
    const revenueOptions = [
      { value: "annual", label: "Annual" },
      { value: "monthly", label: "Monthly" },
    ] as const
    // Internal state is lowercase…
    expect(displayLabelForValue("annual", [...revenueOptions])).toBe("Annual")
    expect(displayLabelForValue("monthly", [...revenueOptions])).toBe("Monthly")
    // …and the helper round-trips through the option table.
    const currencyOptions = [
      { value: "usd", label: "USD ($)" },
      { value: "eur", label: "EUR (€)" },
      { value: "gbp", label: "GBP (£)" },
    ] as const
    expect(displayLabelForValue("usd", [...currencyOptions])).toBe("USD ($)")
  })

  it("exposes the provider list in the expected order", () => {
    expect(EXTERNAL_DATA_PROVIDERS.map((p) => p.value)).toEqual([
      "none",
      "attio",
      "hubspot",
      "salesforce",
    ])
  })
})
