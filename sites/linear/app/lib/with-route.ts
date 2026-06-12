/**
 * Route wrapper for session isolation.
 * Provides per-session state management for API routes.
 */

import { withSession } from "./session"

/**
 * Wraps a route handler with session isolation.
 * Supports both simple handlers and Next.js route handlers with context.
 */
export function route<T = unknown>(
  handler: (request: Request, context: T) => Promise<Response>
): (request: Request, context: T) => Promise<Response> {
  return (request: Request, context: T): Promise<Response> => {
    return withSession(() => handler(request, context))
  }
}
