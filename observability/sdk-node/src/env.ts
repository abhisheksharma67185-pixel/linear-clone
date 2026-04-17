/**
 * Environment variable defaults for the Theta Observability SDK.
 *
 * Resolution order for any field: explicit constructor arg > env var > default.
 */

export const ENV_KEYS = {
  apiKey: "THETA_API_KEY",
  project: "THETA_PROJECT",
  baseUrl: "THETA_BASE_URL",
  debug: "THETA_DEBUG",
} as const;

export const DEFAULT_BASE_URL = "https://api.theta.observability";

export function envApiKey(): string | undefined {
  return process.env[ENV_KEYS.apiKey];
}

export function envProject(): string | undefined {
  return process.env[ENV_KEYS.project];
}

export function envBaseUrl(): string | undefined {
  return process.env[ENV_KEYS.baseUrl];
}

export function envDebug(): boolean {
  const v = process.env[ENV_KEYS.debug];
  if (!v) return false;
  return v === "1" || v.toLowerCase() === "true";
}
