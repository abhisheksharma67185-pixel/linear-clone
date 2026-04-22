// ---------------------------------------------------------------------------
// Programmatic API for embedding `@thetabench/cli` in other tooling.
// ---------------------------------------------------------------------------

export { buildProgram } from "./cli.js";

// HTTP client + typed wrappers
export {
  request,
  getJson,
  postJson,
  HttpError,
  DEFAULT_URL,
  type RequestOptions,
} from "./client/http.js";

export * from "./client/api.js";

// Render helpers (useful for callers that want to reuse our table styling)
export { renderTable, renderKeyValue } from "./render/table.js";
export { c, ok, warn, err, info, muted, label, setColorEnabled, colorEnabled } from "./render/colors.js";

// Utility helpers
export { resolveBaseUrl, reportErrorAndExit, command, printJson, truncate, parseIntFlag, header } from "./util.js";
