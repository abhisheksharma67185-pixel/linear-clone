"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

// Maps the Linear-style picker values (settings → Preferences →
// Interface theme) onto the three themes next-themes manages out of
// the box. The picker has 7 options; we collapse them into light/dark
// pairs (and `system`) since the underlying CSS only ships .dark and
// :root variants. The custom variants (`pure-light`, `magic-blue`,
// `classic-dark`, `custom`) fall back to their nearest base — selecting
// them is non-destructive but doesn't yet recolor.
const LINEAR_THEME_TO_NEXT: Record<string, string> = {
  system: "system",
  light: "light",
  "pure-light": "light",
  dark: "dark",
  "magic-blue": "dark",
  "classic-dark": "dark",
  custom: "dark",
}

const LINEAR_THEME_STORAGE_KEY = "linear:theme"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
      {...props}
    >
      <LinearThemeSync />
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

// Reads the user's `linear:theme` choice from localStorage on mount and
// pushes it into next-themes so the picker selection actually applies
// — and applies on every reload, not just on the page where the picker
// lives. Stays subscribed to the storage event so other tabs/windows
// stay in sync too.
function LinearThemeSync() {
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const apply = (raw: string | null) => {
      if (raw == null) return
      let value = raw
      try {
        value = JSON.parse(raw) as string
      } catch {
        // not JSON — treat the raw string as the theme value.
      }
      const next = LINEAR_THEME_TO_NEXT[value]
      if (next) setTheme(next)
    }

    try {
      apply(window.localStorage.getItem(LINEAR_THEME_STORAGE_KEY))
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === LINEAR_THEME_STORAGE_KEY) apply(e.newValue)
    }
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("storage", onStorage)
    }
  }, [setTheme])

  return null
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }
