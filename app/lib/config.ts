// ---------------------------------------------------------------------------
// Environment configuration — universal + site-specific
// ---------------------------------------------------------------------------

export interface UniversalConfig {
  latency: number;
  hideAriaLabels: boolean;
  errorRate: number;
  dateOverride: string | null;
  locale: string;
}

export interface ShopifyConfig {
  outOfStockProducts: string[];
  paymentFailureRate: number;
  discountExpired: boolean;
  highTrafficMode: boolean;
}

export interface SimConfig {
  universal: UniversalConfig;
  site: ShopifyConfig;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_UNIVERSAL: UniversalConfig = {
  latency: 0,
  hideAriaLabels: false,
  errorRate: 0,
  dateOverride: null,
  locale: "en-US",
};

const DEFAULT_SHOPIFY: ShopifyConfig = {
  outOfStockProducts: [],
  paymentFailureRate: 0,
  discountExpired: false,
  highTrafficMode: false,
};

// ---------------------------------------------------------------------------
// Active config singleton
// ---------------------------------------------------------------------------

let _config: SimConfig = {
  universal: { ...DEFAULT_UNIVERSAL },
  site: { ...DEFAULT_SHOPIFY },
};

export function getConfig(): SimConfig {
  return _config;
}

export function applyConfig(overrides: Partial<{
  universal: Partial<UniversalConfig>;
  site: Partial<ShopifyConfig>;
}>): SimConfig {
  if (overrides.universal) {
    _config.universal = { ..._config.universal, ...overrides.universal };
  }
  if (overrides.site) {
    _config.site = { ..._config.site, ...overrides.site };
  }
  return _config;
}

export function resetConfig(): void {
  _config = {
    universal: { ...DEFAULT_UNIVERSAL },
    site: { ...DEFAULT_SHOPIFY },
  };
}
