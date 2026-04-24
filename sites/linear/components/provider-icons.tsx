import * as React from "react"

type IconProps = { className?: string }

// Slack pinwheel — official 4-color mark. Rendered on top of a muted plum
// background (provided by the caller, not this SVG).
export function SlackLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      {/* Top-right quadrant (green) */}
      <path
        fill="#2EB67D"
        d="M13.48 8.533a1.34 1.34 0 1 1 1.34-1.34v1.34h-1.34Zm0 .67a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H10.13a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h3.35Z"
      />
      {/* Bottom-right quadrant (blue) */}
      <path
        fill="#36C5F0"
        d="M11.467 13.48a1.34 1.34 0 1 1 1.34 1.34h-1.34v-1.34Zm-.67 0a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34V10.13a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v3.35Z"
      />
      {/* Bottom-left quadrant (yellow) */}
      <path
        fill="#ECB22E"
        d="M6.52 11.467a1.34 1.34 0 1 1-1.34 1.34v-1.34h1.34Zm0-.67a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h3.35a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H6.52Z"
      />
      {/* Top-left quadrant (magenta) */}
      <path
        fill="#E01E5A"
        d="M8.533 6.52a1.34 1.34 0 1 1-1.34-1.34h1.34v1.34Zm.67 0a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v3.35a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34V6.52Z"
      />
    </svg>
  )
}

// Google Calendar — official multicolor mark with centered "31" date numeral.
export function GoogleCalendarLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#fff" />
      <rect x="4" y="4" width="24" height="5" rx="2" fill="#4285F4" />
      <rect x="4" y="4" width="5" height="5" fill="#1A73E8" />
      <rect x="23" y="4" width="5" height="5" fill="#1967D2" />
      <rect x="4" y="23" width="24" height="5" rx="2" fill="#EA4335" />
      <rect x="23" y="23" width="5" height="5" fill="#C5221F" />
      <rect x="4" y="23" width="5" height="5" fill="#D93025" />
      <rect x="4" y="9" width="24" height="14" fill="#fff" />
      <path
        d="M19.6 20.4c.7 0 1.3-.2 1.7-.6.4-.4.6-.9.6-1.4 0-.4-.1-.8-.4-1.1-.3-.3-.6-.5-1-.6v0c.4-.1.7-.3 1-.6.2-.3.4-.6.4-1 0-.6-.2-1-.6-1.3-.4-.3-.9-.5-1.6-.5-.5 0-1 .1-1.4.4-.4.2-.7.6-.8 1l.9.4c.1-.3.3-.5.5-.6.2-.1.5-.2.8-.2.3 0 .6.1.8.2.2.2.3.4.3.6 0 .3-.1.5-.3.6-.2.2-.5.2-.8.2h-.6v.9h.7c.4 0 .7.1.9.2.2.2.3.4.3.7 0 .3-.1.5-.3.7-.2.2-.5.3-.9.3-.3 0-.6-.1-.8-.2-.3-.2-.5-.4-.6-.7l-.9.4c.2.5.5.8.9 1.1.4.2.8.3 1.4.3Zm5.2-.1v-6.2h-.8l-1.6.5v.9l1.3-.4v5.2h1.1Z"
        fill="#1A73E8"
      />
    </svg>
  )
}

// Notion — stylized N logomark in a black/white palette. Uses currentColor
// for the glyph so it inherits the (black in light / white in dark) foreground.
export function NotionLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M5.3 3.6h7.6l2.8 2.7v10.1c0 .4-.3.8-.8.8H5.3c-.4 0-.8-.4-.8-.8V4.4c0-.4.4-.8.8-.8Zm1.4 3.9v7.1l1.3.1V9.3l4.2 5.4h1.3V7.6l-1.3-.1V13L8 7.5H6.7Z"
      />
    </svg>
  )
}

// GitHub — official Octocat silhouette (single-color on dark background).
export function GitHubLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M10 2C5.58 2 2 5.58 2 10c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 18 10c0-4.42-3.58-8-8-8Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function ExternalLinkGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden="true">
      <path
        d="M4 2.5H2.5v9h9V10M8 2.5h3.5V6M11.5 2.5 5.5 8.5"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
