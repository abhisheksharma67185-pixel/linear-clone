"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { OPEN_HELP_EVENT } from "@/components/help-popover"

// Two-char sequences (e.g. `g s` → /settings) only count when the
// second key arrives within this window. Linear uses a similar timeout
// (~1.5s) for its leader-key sequences.
const CHORD_WINDOW_MS = 1500

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

/**
 * Global keyboard shortcut dispatcher.
 *
 * Bindings:
 * - `?` (Shift+/)         → open the Help popover
 * - `⌘/` / `Ctrl+/`       → open the Help popover (no separate shortcut
 *                           overlay yet; the Help popover lists the
 *                           same bindings as `Keyboard shortcuts`)
 * - `g` then `s` (≤1.5s)  → navigate to /settings
 *
 * All bindings ignore keypresses while focus is in an editable element
 * so typing `s` in a comment doesn't navigate away mid-sentence.
 */
export function KeyboardShortcuts() {
  const router = useRouter()
  // Sequence state for `g s`: timestamp of the last bare-`g` press,
  // refreshed only on a real `g` (no modifiers, no typing target).
  const lastGAtRef = useRef<number>(0)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return
      if (isTypingTarget(event.target)) return

      const key = event.key
      const cmd = event.metaKey || event.ctrlKey

      // `⌘/` / `Ctrl+/` — open help. Don't fire if Shift is also held
      // (that's a different conventional binding).
      if (cmd && key === "/" && !event.shiftKey) {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent(OPEN_HELP_EVENT))
        return
      }

      // `?` — open help. On most layouts this is Shift+/ but some keymaps
      // produce `?` directly; handle both forms.
      if (!cmd && (key === "?" || (key === "/" && event.shiftKey))) {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent(OPEN_HELP_EVENT))
        return
      }

      // Two-char sequence — `g` arms, `s` within window navigates.
      if (!cmd && !event.altKey && !event.shiftKey) {
        if (key === "g") {
          lastGAtRef.current = Date.now()
          return
        }
        if (
          key === "s" &&
          lastGAtRef.current > 0 &&
          Date.now() - lastGAtRef.current <= CHORD_WINDOW_MS
        ) {
          lastGAtRef.current = 0
          event.preventDefault()
          router.push("/settings")
          return
        }
      }

      // Any other unmodified keypress breaks the chord — otherwise
      // `g, …, s` (with arbitrary keys in between, within 1.5s) would
      // still navigate, which feels wrong.
      if (!cmd && !event.altKey) {
        lastGAtRef.current = 0
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [router])

  return null
}
