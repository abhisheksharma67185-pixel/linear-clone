// ---------------------------------------------------------------------------
// Route helper — bundles per-session isolation + chaos injection so each
// API route only needs one wrapper. Use:
//
//   import { route } from "@/app/lib/with-route"
//   export const GET = route(async (request) => { ... })
//
// The composition order matters: `withSession` outermost so chaos middleware
// can read session-scoped chaos config; `withChaos` inside.
// ---------------------------------------------------------------------------

import { withSession } from "./session"
import { withChaos } from "./chaos"

type RouteHandler<TCtx = unknown> = (
  request: Request,
  context: TCtx
) => Response | Promise<Response>

export function route<TCtx = unknown>(
  handler: RouteHandler<TCtx>
): RouteHandler<TCtx> {
  return withSession(withChaos(handler))
}
