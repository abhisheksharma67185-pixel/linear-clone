import * as React from "react"

export type BrowserInfo = {
  browser:
    | "Chrome"
    | "Safari"
    | "Firefox"
    | "Edge"
    | "Brave"
    | "Opera"
    | "Browser"
  os: string
  label: string
}

export function detectBrowser(userAgent: string): BrowserInfo {
  const ua = userAgent

  let browser: BrowserInfo["browser"] = "Browser"
  if (/Edg\//i.test(ua)) browser = "Edge"
  else if (/OPR\//i.test(ua)) browser = "Opera"
  else if (/Brave/i.test(ua)) browser = "Brave"
  else if (/Chrome\//i.test(ua)) browser = "Chrome"
  else if (/Firefox\//i.test(ua)) browser = "Firefox"
  else if (/Safari\//i.test(ua)) browser = "Safari"

  let os = "Unknown"
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS"
  else if (/Android/i.test(ua)) os = "Android"
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS"
  else if (/Windows/i.test(ua)) os = "Windows"
  else if (/Linux/i.test(ua)) os = "Linux"

  return { browser, os, label: `${browser} on ${os}` }
}

type IconProps = { className?: string }

// Single-color browser logo glyphs sized for a 20x20 viewBox.
// Use currentColor so they inherit the surrounding text color — matches the
// existing muted-foreground look while being recognizable as the real logo.

function ChromeGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle
        cx="10"
        cy="10"
        r="3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10 1.5v5.2M17.5 6.25l-4.5 2.6M2.5 6.25l4.5 2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SafariGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10 3.5v1.5M10 15v1.5M3.5 10h1.5M15 10h1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M13.2 6.8 10 10l-3.2 3.2L10 10Z" fill="currentColor" />
    </svg>
  )
}

function FirefoxGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1.6c3.3 0 6 1.8 7.4 4.6-.9-.7-2-1.2-3.2-1.3.8.6 1.4 1.4 1.7 2.4.4 1.3.2 2.7-.5 3.9-.9 1.6-2.6 2.7-4.5 2.9-1.6.1-3.2-.6-4.2-1.9-.6-.7-.9-1.7-.7-2.6.2-.9.8-1.6 1.7-2 .9-.3 1.9-.1 2.6.5-.6-1-.4-2.3.4-3.1.8-.8 2.1-1 3.1-.4C12 3.1 11 2 9.8 1.7c.1 0 .1 0 .2-.1Z"
        fill="currentColor"
      />
    </svg>
  )
}

function EdgeGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1.7c3.4 0 6.3 1.8 7.6 4.6-1-.5-2.1-.8-3.2-.8-2.8 0-5.3 1.6-6.4 4.1-.3.7-.4 1.4-.1 2.1.3.8 1 1.4 1.8 1.7 1.7.6 3.6 0 4.8-1.4-.4 2.2-1.8 4.1-3.9 5-2 .9-4.3.7-6.2-.5C2.3 15.3 1 13 1 10.5c0-2.1 1-4.1 2.6-5.4.6 1.8 2.1 3.2 3.9 3.7-.3-.4-.5-.9-.5-1.5 0-.8.4-1.6 1-2.1.7-.5 1.5-.8 2.3-.8.6 0 1.2.1 1.7.4-.6-.3-1.3-.4-2-.4-1.1 0-2.2.4-3 1.2.8-2.1 2.8-3.4 5-3.4 0-.5 0-.5 0-.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function GenericMonitorGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <rect
        x="2"
        y="3.5"
        width="16"
        height="11"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M7 17h6M10 14.5v2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function BrowserIcon({
  browser,
  className,
}: {
  browser: BrowserInfo["browser"]
  className?: string
}) {
  switch (browser) {
    case "Chrome":
    case "Brave":
    case "Opera":
      return <ChromeGlyph className={className} />
    case "Safari":
      return <SafariGlyph className={className} />
    case "Firefox":
      return <FirefoxGlyph className={className} />
    case "Edge":
      return <EdgeGlyph className={className} />
    default:
      return <GenericMonitorGlyph className={className} />
  }
}
