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

// GitLab — official "tanuki" mark in its three-tone orange palette.
export function GitLabLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 380 380" className={className} aria-hidden="true">
      <path
        fill="#E24329"
        d="M282.83 170.73l-.27-.69-26.14-68.22a6.81 6.81 0 0 0-2.69-3.24 7 7 0 0 0-8 .43 7 7 0 0 0-2.32 3.52l-17.65 54H154.29l-17.65-54a6.86 6.86 0 0 0-2.32-3.53 7 7 0 0 0-8-.43 6.87 6.87 0 0 0-2.69 3.24L97.44 170l-.26.69a48.54 48.54 0 0 0 16.1 56.1l.09.07.24.17 39.82 29.82 19.7 14.91 12 9.06a8.07 8.07 0 0 0 9.76 0l12-9.06 19.7-14.91 40.06-30 .1-.08a48.56 48.56 0 0 0 16.08-56.04z"
      />
      <path
        fill="#FC6D26"
        d="M282.83 170.73l-.27-.69a88.3 88.3 0 0 0-35.15 15.8L190 229.25c19.55 14.79 36.57 27.64 36.57 27.64l40.06-30 .1-.08a48.56 48.56 0 0 0 16.1-56.08z"
      />
      <path
        fill="#FCA326"
        d="M153.43 256.89l19.7 14.91 12 9.06a8.07 8.07 0 0 0 9.76 0l12-9.06 19.7-14.91S209.55 244 190 229.25c-19.55 14.75-36.57 27.64-36.57 27.64z"
      />
      <path
        fill="#FC6D26"
        d="M132.58 185.84A88.19 88.19 0 0 0 97.44 170l-.26.69a48.54 48.54 0 0 0 16.1 56.1l.09.07.24.17 39.82 29.82s17-12.85 36.57-27.64z"
      />
    </svg>
  )
}

// Figma — official 5-tile mark in its multicolor palette. Looks correct on a
// white tile (the caller is expected to provide that background).
export function FigmaLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 38 57" className={className} aria-hidden="true">
      {/* Top-left orange */}
      <path
        fill="#F24E1E"
        d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"
      />
      {/* Top-right red */}
      <path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
      {/* Middle-left purple */}
      <path
        fill="#A259FF"
        d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"
      />
      {/* Center blue circle */}
      <circle fill="#1ABCFE" cx="28.5" cy="28.5" r="9.5" />
      {/* Bottom-left green */}
      <path
        fill="#0ACF83"
        d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"
      />
    </svg>
  )
}

// Intercom — stylised chat-bubble glyph (rounded square + four wave bars).
// Renders monochrome so the caller can colour it via parent text class.
export function IntercomLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="currentColor" />
      <path
        fill="#fff"
        d="M19.75 18.5c0 .345-.28.625-.625.625s-.625-.28-.625-.625v-7.25c0-.345.28-.625.625-.625s.625.28.625.625v7.25Zm-3 1.125c0 .345-.28.625-.625.625s-.625-.28-.625-.625v-8.5c0-.345.28-.625.625-.625s.625.28.625.625v8.5Zm-3 .25c0 .345-.28.625-.625.625s-.625-.28-.625-.625v-9c0-.345.28-.625.625-.625s.625.28.625.625v9Zm-3-.25c0 .345-.28.625-.625.625s-.625-.28-.625-.625v-8.5c0-.345.28-.625.625-.625s.625.28.625.625v8.5Zm-3-1.125c0 .345-.28.625-.625.625s-.625-.28-.625-.625v-7.25c0-.345.28-.625.625-.625s.625.28.625.625v7.25Zm12.875-13.5H5.375A2.625 2.625 0 0 0 2.75 7.625v15.063a.5.5 0 0 0 .854.354l3.073-3.073a.5.5 0 0 1 .354-.146h13.594A2.625 2.625 0 0 0 23.25 17.2V7.625A2.625 2.625 0 0 0 20.625 5h0Z"
      />
    </svg>
  )
}

// Google Sheets — official green document mark with the folded corner and
// the inner spreadsheet grid. Sized for a 24px viewBox so it composes cleanly
// with other provider icons.
export function GoogleSheetsLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {/* Document body (Sheets green) */}
      <path
        fill="#0F9D58"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
      />
      {/* Folded corner highlight */}
      <path fill="#87CEAC" d="M14 2v6h6l-6-6Z" />
      {/* Inner grid */}
      <path
        fill="#fff"
        d="M8 11h8v1.4H8V11Zm0 2.4h8v1.4H8v-1.4Zm0 2.4h8v1.4H8v-1.4Z"
      />
      <path fill="#fff" d="M11.3 11h1.4v6.6h-1.4V11Z" />
    </svg>
  )
}

// OpenAI — official "blossom" knot mark. Renders monochrome via currentColor
// so callers can place it on any tinted tile.
export function OpenAILogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
      />
    </svg>
  )
}

// Cursor — stylised 3D triangular prism that reads as both an "A" and an
// arrow-tip. Renders monochrome via currentColor so the parent tile picks
// the colour. Three paths give a shaded look on a dark background.
export function CursorLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {/* Front face */}
      <path
        fill="currentColor"
        opacity="0.9"
        d="M12 2 2 7.5v9L12 22V11.5L22 6 12 2Z"
      />
      {/* Right face — slightly darker for depth */}
      <path
        fill="currentColor"
        opacity="0.6"
        d="M12 22 22 16.5v-9L12 11.5V22Z"
      />
      {/* Top face — lightest highlight */}
      <path fill="currentColor" opacity="0.4" d="M12 2 2 7.5l10 4 10-4L12 2Z" />
    </svg>
  )
}

// GitHub Copilot — stylised astronaut/Copilot mascot. Simplified to a round
// body with two visor eyes and a pair of side wings, monochrome via
// currentColor so callers can colour it for their tile background.
export function CopilotLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {/* Side wings / arms */}
      <path
        fill="currentColor"
        d="M4.5 16.5c0-2.2 1.6-4 3.6-4.4v8.8c-2-.4-3.6-2.2-3.6-4.4Zm23 0c0-2.2-1.6-4-3.6-4.4v8.8c2-.4 3.6-2.2 3.6-4.4Z"
      />
      {/* Body */}
      <path
        fill="currentColor"
        d="M9 11c0-3 2-5 5-5h4c3 0 5 2 5 5v9c0 3-2 5-5 5h-4c-3 0-5-2-5-5v-9Z"
      />
      {/* Eyes */}
      <circle cx="13.5" cy="16" r="1.4" fill="#fff" />
      <circle cx="18.5" cy="16" r="1.4" fill="#fff" />
    </svg>
  )
}

// Factory mark — stylized 8-petal flower / asterisk used for the Factory.ai
// agent. Drawn as eight rotated rounded "petals" radiating from the center.
export function FactoryLogo({ className }: IconProps) {
  const petals = Array.from({ length: 8 }, (_, i) => i * 45)
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g transform="translate(16 16)">
        {petals.map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-7.5"
            rx="2.4"
            ry="6.5"
            fill="currentColor"
            transform={`rotate(${deg})`}
          />
        ))}
        <circle r="2.2" fill="currentColor" />
      </g>
    </svg>
  )
}

// Sentry mark — the iconic "A" / mountain glyph rendered as two stacked
// chevron-like arcs (outer + inner), matching the official Sentry brand.
export function SentryLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.7 6.7a1.95 1.95 0 0 0-3.4 0l-3.05 5.28a13.9 13.9 0 0 1 7.93 11.42h-2.66a11.27 11.27 0 0 0-6.6-9.13l-2.66 4.6a6.05 6.05 0 0 1 3.32 4.53H8.94a3.4 3.4 0 0 0-1.85-2.36l-1.4 2.43a.95.95 0 0 0 .82 1.43h6.74a8.65 8.65 0 0 0-3.07-7.04l1.33-2.3a11.27 11.27 0 0 1 4.4 9.34h6.5a.95.95 0 0 0 .82-1.43L17.7 6.7Z"
      />
    </svg>
  )
}

// Devin (Cognition) mark — a 7-hexagon flower cluster (1 center + 6 around).
// Drawn with a single hexagon path repeated and translated using polar
// coordinates so it composes as the well-known Devin logo.
export function DevinLogo({ className }: IconProps) {
  // Pointy-top hexagon path centered at (0, 0), radius ~5.
  const hex = "M0 -5 L4.33 -2.5 L4.33 2.5 L0 5 L-4.33 2.5 L-4.33 -2.5 Z"
  // 6 surrounding hex centers at radius 9 (slightly more than 2*4.33 to avoid
  // visual overlap; 60° apart starting at the top).
  const ring = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (i * 60 - 90)
    return [Math.cos(a) * 9, Math.sin(a) * 9] as const
  })
  return (
    <svg viewBox="-16 -16 32 32" className={className} aria-hidden="true">
      <path d={hex} fill="currentColor" />
      {ring.map(([x, y], i) => (
        <path
          key={i}
          d={hex}
          fill="currentColor"
          transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}
        />
      ))}
    </svg>
  )
}

// ChatPRD mark — soft "swirl" composed of two facing comma/quote shapes,
// rendered in white over a pink-coral gradient supplied by the caller.
export function ChatPrdLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.2 7.6c2.6-2 6.4-1.4 8 1.3.5.9-.7 1.7-1.5 1-1.1-1.1-2.9-1.4-4.3-.5-1.6 1-2 3.1-.9 4.6.5.7-.5 1.6-1.2 1.1-2.4-1.7-2.7-5.3-.1-7.5Zm9.6 16.8c-2.6 2-6.4 1.4-8-1.3-.5-.9.7-1.7 1.5-1 1.1 1.1 2.9 1.4 4.3.5 1.6-1 2-3.1.9-4.6-.5-.7.5-1.6 1.2-1.1 2.4 1.7 2.7 5.3.1 7.5Z"
      />
      <circle cx="11.5" cy="20.5" r="1.3" fill="currentColor" />
      <circle cx="20.5" cy="11.5" r="1.3" fill="currentColor" />
    </svg>
  )
}

// Charlie (Charlie Labs) mark — stylized "C" with a notched bottom-right
// (suggesting a cat-like silhouette), drawn in solid currentColor on a
// lime-square background supplied by the caller.
export function CharlieLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 5a11 11 0 1 0 11 11 1.5 1.5 0 0 0-1.5-1.5h-3a1.5 1.5 0 0 0-1.5 1.5 5 5 0 1 1-5-5 1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 16 5Zm6.5 14.5a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 2.5-2.5Z"
      />
    </svg>
  )
}

// Claude (Anthropic) starburst — ten radial petals fanning from the center.
// Rendered in solid currentColor so the caller controls the color. The
// canonical brand uses the warm peach #D97757 on a near-white tile.
export function ClaudeLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="currentColor">
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i * 360) / 10
          return (
            <rect
              key={i}
              x="15.1"
              y="3"
              width="1.8"
              height="13"
              rx="0.9"
              transform={`rotate(${angle} 16 16)`}
            />
          )
        })}
        <circle cx="16" cy="16" r="2.4" />
      </g>
    </svg>
  )
}

// v0 by Vercel — black square wordmark. The "v0" lockup is set in a
// geometric sans on a black tile. Caller controls outer chrome; we draw
// the glyph in white so it reads on dark backgrounds.
export function V0Logo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        v0
      </text>
    </svg>
  )
}

// Windsurf — stylized wavy "W" rendered as a single continuous stroke.
// Solid currentColor so callers control the color (canonical mark is
// black on a white tile).
export function WindsurfLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M4 11 L9 22 L13 13 L16 22 L19 13 L23 22 L28 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Replit — three orange squares arranged in a stair / L pattern. The
// canonical mark uses #F26207. Drawn in currentColor so the caller can
// set the brand color.
export function ReplitLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="currentColor">
        <rect x="6" y="6" width="9" height="9" rx="1.5" />
        <rect x="17" y="6" width="9" height="9" rx="1.5" />
        <rect x="6" y="17" width="9" height="9" rx="1.5" />
      </g>
    </svg>
  )
}

// Dust — colorful pixel mark made up of variable-height bars in
// red / yellow / blue / green, evoking a stacked-bar chart. Caller
// supplies the white tile background.
export function DustLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {/* tall green bar */}
      <rect x="5" y="6" width="6" height="20" fill="#22c55e" />
      {/* yellow bar */}
      <rect x="12" y="10" width="6" height="16" fill="#facc15" />
      {/* short red bar */}
      <rect x="19" y="14" width="6" height="6" fill="#ef4444" />
      {/* blue accent bar */}
      <rect x="19" y="6" width="6" height="6" fill="#3b82f6" />
      {/* tiny yellow square bottom-right */}
      <rect x="19" y="21" width="6" height="5" fill="#facc15" />
    </svg>
  )
}

// Google ADK robot face — rounded "pill" outline (drawn in
// currentColor) with two dot eyes and a `<>` mouth glyph at the bottom.
// Renders as a flat white-on-black mark; the chrome border in the
// official badge is provided by the caller's tile color.
export function AdkLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="9" width="22" height="14" rx="7" />
        {/* mouth: [< >] */}
        <path d="M11 19 L13.5 17 L11 15" />
        <path d="M21 15 L18.5 17 L21 19" />
      </g>
      {/* eyes */}
      <circle cx="12" cy="13" r="1.4" fill="currentColor" />
      <circle cx="20" cy="13" r="1.4" fill="currentColor" />
    </svg>
  )
}

// PagerDuty — stylized "PD" inside a green tile. We render a clean
// solid "P" mark in currentColor; caller controls the green chrome.
export function PagerDutyLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M9 6h7.4a6.6 6.6 0 0 1 0 13.2H13V26H9Zm4 4v5.2h3.4a2.6 2.6 0 0 0 0-5.2Z"
      />
    </svg>
  )
}

// VS Code — angled folded ribbon mark. Drawn as two triangle paths in
// currentColor; caller supplies the blue tile.
export function VSCodeLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 4 12 14 7 10 4 12v8l3 2 5-4 10 10 6-3V7Zm0 7v10l-7-5Z"
      />
    </svg>
  )
}

// Datadog — stylized dog-head profile with a single circular eye.
// Rendered in currentColor on a purple tile supplied by the caller.
export function DatadogLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 14c0-5 4-9 9-9s9 4 9 9v6l4-3v6l-4 3v3h-3v-2l-3 1v-2l-3 1v-2l-3 1v-2l-3 1v-3a8 8 0 0 1-3-9Z"
      />
      <circle cx="13" cy="12" r="2" fill="#fff" />
      <circle cx="13" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

// incident.io — water-drop / flame mark. The brand uses an orange/red
// teardrop on a white tile; we draw the silhouette in currentColor so
// the caller controls the color.
export function IncidentIoLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 4c-4 6-9 10-9 16a9 9 0 0 0 18 0c0-6-5-10-9-16Z"
      />
      <path fill="#fff" d="M16 14c-2 3-4 5-4 8a4 4 0 0 0 8 0c0-3-2-5-4-8Z" />
    </svg>
  )
}

// Raycast — square tile mark formed by a tilted "R" shape. Rendered
// as a simple geometric glyph in currentColor on a coral tile.
export function RaycastLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 6h12l8 8v12h-4v-2l-2-2v4h-4v-6l-2-2v8H6Zm4 4v6l6 6h2v-2L10 12Zm12 4v4l-4-4Z"
      />
    </svg>
  )
}

// Linear Asks — Linear's stylized "A" mark, a triangular wedge with the
// crossbar omitted. Rendered in currentColor on a violet tile supplied
// by the caller.
export function LinearAsksLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 5 6 26h4l2-4.5h8l2 4.5h4Zm-2.4 12 2.4-5.4 2.4 5.4Z"
      />
    </svg>
  )
}

// Zapier — italic lowercase "z" wordmark in currentColor on an orange
// tile supplied by the caller.
export function ZapierLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="currentColor" d="M9 9h14l-9 12h9v2H7l9-12H9Z" />
    </svg>
  )
}

// Bird Eats Bug — a circle with a wedge cut out (Pac-Man style),
// representing the brand's stylized bird-mouth mark.
export function BirdEatsBugLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="currentColor" d="M16 4a12 12 0 1 0 12 12L16 16Z" />
    </svg>
  )
}

// Honeybadger — a stylized lightning-bolt strike on a tile, the brand's
// orange/red mark drawn in currentColor on a tile supplied by the caller.
export function HoneybadgerLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="currentColor" d="M19 4 8 17h6l-1 11 11-13h-6Z" />
    </svg>
  )
}

// Capybara — Move Work Forward's mascot, a stout rodent profile in
// currentColor with a small dot eye. The caller supplies the tile colour.
export function CapybaraLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 17c0-3 3-6 8-6h6c4 0 7 2.5 7 6v3a3 3 0 0 1-3 3h-1l-1 3h-2l-1-3h-8l-1 3h-2l-1-3H8a3 3 0 0 1-3-3v-3Zm17-5 3-3v3h-3Z"
      />
      <circle cx="22" cy="16" r="0.9" fill="#fff" />
    </svg>
  )
}

// Circleback — the brand's lower-case "c." inside a rounded square. The
// glyph itself renders in currentColor on a tile supplied by the caller.
export function CirclebackLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        d="M22 12.5a7 7 0 1 0 0 7"
      />
      <circle cx="22.5" cy="22.5" r="2" fill="currentColor" />
    </svg>
  )
}

// Fivetran — three rising bars/triangles forming the brand's "f" mark.
export function FivetranLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="currentColor" d="M5 22h6L8 6 5 22Z" />
      <path fill="currentColor" d="M14 22h6L17 12l-3 10Z" />
      <path fill="currentColor" d="M23 22h6l-3-6-3 6Z" />
    </svg>
  )
}

// Axolo — a friendly axolotl head with two "feathered" gills, the brand's
// salamander-cute mascot rendered in currentColor on a tile.
export function AxoloLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 9c4.5 0 8 3.5 8 8 0 4-3.5 7-8 7s-8-3-8-7c0-4.5 3.5-8 8-8Z"
      />
      <path
        fill="currentColor"
        d="M9 11c-2 1-3 3-3 5h3v-5Zm14 0c2 1 3 3 3 5h-3v-5ZM7 19c-1.5.5-2 2-2 3.5h3.5L7 19Zm18 0c1.5.5 2 2 2 3.5h-3.5L25 19Z"
      />
      <circle cx="13" cy="16" r="1.1" fill="#fff" />
      <circle cx="19" cy="16" r="1.1" fill="#fff" />
    </svg>
  )
}

// Jira — Atlassian's stylised "J" assembled from three offset chevrons. The
// caller supplies the tile background; the chevrons render in currentColor.
export function JiraLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 4 6 14l5 5 5-5 5 5-5 5-5-5-5 5 10 10 5-5-5-5 5-5-5-5-5-5Z"
      />
    </svg>
  )
}

// Inbox / Email intake — a tray with a downward arrow indicating ingestion of
// emails into Linear. Rendered in currentColor on a tile supplied by the caller.
export function EmailIntakeLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 5v10m0 0-4-4m4 4 4-4M5 18v6a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-6h-7l-2 3h-7l-2-3H5Z"
      />
    </svg>
  )
}

// Arc — the Browser Company's mark, two overlapping ovals forming an "A" in
// blue/orange tones rendered on a tile supplied by the caller.
export function ArcLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="arc-grad-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5b8def" />
          <stop offset="100%" stopColor="#1f5fff" />
        </linearGradient>
        <linearGradient id="arc-grad-b" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff7a3d" />
          <stop offset="100%" stopColor="#ff3d6d" />
        </linearGradient>
      </defs>
      <path fill="url(#arc-grad-a)" d="M9 22 16 6l7 16-3 1-4-9-4 9Z" />
      <circle cx="22" cy="23" r="3.6" fill="url(#arc-grad-b)" />
    </svg>
  )
}

// Jam — a stylized strawberry with a leafy crown rendered in currentColor on a
// tile supplied by the caller.
export function JamLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 9c5 0 10 4 10 10 0 5-5 9-10 9S6 24 6 19s5-10 10-10Z"
      />
      <path
        fill="currentColor"
        d="M16 9c-1.2-2.6-3.6-3.8-6.4-3.6.4 2.6 2.4 4.4 5 4.6Zm0 0c1.2-2.6 3.6-3.8 6.4-3.6-.4 2.6-2.4 4.4-5 4.6Z"
      />
      <circle cx="12.5" cy="17" r="0.8" fill="#fff" opacity="0.65" />
      <circle cx="17" cy="20" r="0.8" fill="#fff" opacity="0.65" />
      <circle cx="20.5" cy="15.5" r="0.8" fill="#fff" opacity="0.65" />
      <circle cx="14" cy="22.5" r="0.8" fill="#fff" opacity="0.65" />
    </svg>
  )
}

// Vercel — the iconic black equilateral triangle wordmark.
export function VercelLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="currentColor" d="M16 6 28 26H4Z" />
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
