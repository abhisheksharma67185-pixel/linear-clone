// ---------------------------------------------------------------------------
// Generic environment configuration — universal params for all sites.
// Site-specific config is handled by each site's own config module.
// All runtime functions proxy to the process-wide `defaultEngine` instance.
// ---------------------------------------------------------------------------

import { defaultEngine } from "./sim-engine"

export interface UniversalConfig {
  latency: number
  hideAriaLabels: boolean
  errorRate: number
  dateOverride: string | null
  locale: string
}

export function getUniversalConfig(): UniversalConfig {
  return defaultEngine.getUniversalConfig()
}

export function applyUniversalConfig(
  overrides: Partial<UniversalConfig>
): UniversalConfig {
  return defaultEngine.applyUniversalConfig(overrides)
}

export function resetUniversalConfig(): void {
  defaultEngine.resetUniversalConfig()
}
