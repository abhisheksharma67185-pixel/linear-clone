"use client"

import { useEffect } from "react"

/**
 * Sets `document.title` to "{title} · Linear" while the calling
 * component is mounted, restoring the previous title on unmount.
 *
 * Why this exists: client-rendered pages ("use client") can't use
 * Next's `metadata` export, so without a per-page hook the tab
 * title sticks on whatever the previous route set (often the
 * navigation source — e.g. landing on /issues/ABH-1 from /teams
 * left the tab reading "Teams"). The "browser tab strip is part
 * of the navigation surface" rule from the QA pass — fix it here.
 *
 * Pass `null` to opt out of setting a title (e.g. while data is
 * still loading and we don't have a real subject yet).
 */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (typeof document === "undefined") return
    if (!title) return
    const previous = document.title
    document.title = `${title} · Linear`
    return () => {
      document.title = previous
    }
  }, [title])
}
