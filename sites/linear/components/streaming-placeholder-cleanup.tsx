"use client"

import { useEffect } from "react"

/**
 * Removes the lingering `hidden` attribute from Next.js 16's streaming-
 * placeholder `<div hidden>` once it's been resolved by `$RC`. Tests
 * (Playwright) query `body > *` and expect a non-null `boundingBox()`,
 * which the still-`hidden` placeholder breaks.
 *
 * IMPORTANT: this MUST run after React hydration. The previous
 * implementation used an inline `<script>` listening on
 * `DOMContentLoaded` — that fires *before* hydration, so React would
 * see `<div>` (no `hidden`) in the DOM but try to hydrate
 * `<div hidden={true}>`, producing the `hidden={true}` vs
 * `hidden={null}` mismatch warning. A `useEffect` here runs strictly
 * after the initial commit, so DOM and React tree stay in sync
 * through hydration and only diverge once it's safe.
 */
export function StreamingPlaceholderCleanup() {
  useEffect(() => {
    document
      .querySelectorAll("body > div[hidden]")
      .forEach((el) => el.removeAttribute("hidden"))
  }, [])
  return null
}
