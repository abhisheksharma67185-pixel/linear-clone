"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { OPEN_HELP_EVENT } from "@/components/help-popover"
import { OPEN_KEYBOARD_SHORTCUTS_EVENT } from "@/components/keyboard-shortcuts-panel"

// Two-char sequences (e.g. `g s` → /settings) only count when the
// second key arrives within this window. Linear uses a similar timeout
// (~1.5s) for its leader-key sequences.
const CHORD_WINDOW_MS = 1500

export const OPEN_CREATE_ISSUE_EVENT = "linear:open-create-issue"
export const OPEN_COMMAND_PALETTE_EVENT = "linear:open-command-palette"

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
 * - `g` then `i` (≤1.5s)  → navigate to /issues
 * - `g` then `p` (≤1.5s)  → navigate to /projects
 * - `g` then `t` (≤1.5s)  → navigate to /teams
 * - `g` then `m` (≤1.5s)  → navigate to /my-issues
 * - `c`                   → open Create Issue dialog
 * - `⌘k` / `Ctrl+k`       → open Command Palette
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

      const key = event.key
      const cmd = event.metaKey || event.ctrlKey

      // `⌘k` / `Ctrl+k` — open command palette (fires even in typing targets)
      if (cmd && key === "k" && !event.shiftKey && !event.altKey) {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE_EVENT))
        return
      }

      if (isTypingTarget(event.target)) return

      // `⌘/` / `Ctrl+/` — open the Keyboard Shortcuts panel. The panel
      // lists this binding under "View keyboard shortcuts" so the
      // hotkey self-documents. `?` (handled below) opens the help
      // popover, which is a separate surface.
      if (cmd && key === "/" && !event.shiftKey) {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent(OPEN_KEYBOARD_SHORTCUTS_EVENT))
        return
      }

      // `?` — open help. On most layouts this is Shift+/ but some keymaps
      // produce `?` directly; handle both forms.
      if (!cmd && (key === "?" || (key === "/" && event.shiftKey))) {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent(OPEN_HELP_EVENT))
        return
      }

      // `c` — open Create Issue dialog (only when no dialog is open)
      if (!cmd && !event.altKey && !event.shiftKey && key === "c") {
        if (document.querySelector('[role="dialog"][data-open]')) return
        event.preventDefault()
        window.dispatchEvent(new CustomEvent(OPEN_CREATE_ISSUE_EVENT))
        return
      }

      // Two-char sequence — `g` arms, second key within window navigates.
      if (!cmd && !event.altKey && !event.shiftKey) {
        if (key === "g") {
          lastGAtRef.current = Date.now()
          return
        }
        const inChord =
          lastGAtRef.current > 0 &&
          Date.now() - lastGAtRef.current <= CHORD_WINDOW_MS
        if (inChord) {
          if (key === "s") {
            lastGAtRef.current = 0
            event.preventDefault()
            router.push("/settings")
            return
          }
          if (key === "i") {
            lastGAtRef.current = 0
            event.preventDefault()
            router.push("/issues")
            return
          }
          if (key === "p") {
            lastGAtRef.current = 0
            event.preventDefault()
            router.push("/projects")
            return
          }
          if (key === "t") {
            lastGAtRef.current = 0
            event.preventDefault()
            router.push("/teams")
            return
          }
          if (key === "m") {
            lastGAtRef.current = 0
            event.preventDefault()
            router.push("/my-issues")
            return
          }
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
