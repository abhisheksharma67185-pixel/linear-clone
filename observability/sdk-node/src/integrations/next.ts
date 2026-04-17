/**
 * Next.js route handler helpers.
 *
 * ```ts
 * // app/api/checkout/route.ts
 * import { withTrace } from "@theta/observability/next";
 *
 * export const POST = withTrace(async (req) => {
 *   // ...
 *   return Response.json({ ok: true });
 * }, { name: "api/checkout" });
 * ```
 */
export { withTrace, observe } from "../observe.js";
export { getActiveTrace, getActiveStep } from "../async-context.js";
export { trace, flush, TraceClient, getDefaultClient, setDefaultClient } from "../client.js";
