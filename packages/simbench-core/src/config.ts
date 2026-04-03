// ---------------------------------------------------------------------------
// Generic environment configuration — universal params for all sites
// Site-specific config is handled by each site's own config module
// ---------------------------------------------------------------------------

export interface UniversalConfig {
  latency: number;
  hideAriaLabels: boolean;
  errorRate: number;
  dateOverride: string | null;
  locale: string;
}

const DEFAULT_UNIVERSAL: UniversalConfig = {
  latency: 0,
  hideAriaLabels: false,
  errorRate: 0,
  dateOverride: null,
  locale: "en-US",
};

let _universalConfig: UniversalConfig = { ...DEFAULT_UNIVERSAL };

export function getUniversalConfig(): UniversalConfig {
  return _universalConfig;
}

export function applyUniversalConfig(overrides: Partial<UniversalConfig>): UniversalConfig {
  _universalConfig = { ..._universalConfig, ...overrides };
  return _universalConfig;
}

export function resetUniversalConfig(): void {
  _universalConfig = { ...DEFAULT_UNIVERSAL };
}
