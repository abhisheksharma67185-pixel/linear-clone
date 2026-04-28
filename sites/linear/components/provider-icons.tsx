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

// Salesforce — sky-blue rounded square with the brand cloud silhouette in
// white. Approximates the official cloud mark using overlapping circles.
export function SalesforceLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#00A1E0" />
      {/* Cloud silhouette built from overlapping circles */}
      <path
        fill="#fff"
        d="M11.2 11.5a3.4 3.4 0 0 1 6.5-.6 2.6 2.6 0 0 1 3.4 3.6 2.4 2.4 0 0 1-1.5 4.4h-9.4a2.9 2.9 0 0 1-1.6-5.3 3 3 0 0 1 2.6-2.1Z"
      />
    </svg>
  )
}

// Atlas Support — indigo→purple gradient rounded square with a stylised
// upward chevron (the brand's "compass" mark).
export function AtlasSupportLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="atlasBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5C5CE0" />
          <stop offset="1" stopColor="#9C5BE6" />
        </linearGradient>
      </defs>
      <rect width="28" height="28" rx="6" fill="url(#atlasBg)" />
      {/* Upward chevron / compass needle */}
      <path fill="#fff" d="m14 7 5 13-5-3-5 3 5-13Z" />
    </svg>
  )
}

// Productlane — near-black rounded square with a stylised "PL" mark made
// from two interlocking arrow shapes. Brand uses pure black + white.
export function ProductlaneLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#0B0B0F" />
      {/* Down-right arrow */}
      <path
        fill="#fff"
        d="M9 6h4l-1.5 5.5L17 8.5l2 3.5-5.5 3.2L18 16l-1.5 5h-4l1.5-5.5-5.5 3.3-2-3.5L11.5 12 7 11l1.5-5Z"
      />
    </svg>
  )
}

// Index — dark navy rounded square with three white horizontal bars (the
// brand's stacked "≡" mark, slightly tapered at the right edge).
export function IndexLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="indexBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A1B26" />
          <stop offset="1" stopColor="#0A0B12" />
        </linearGradient>
      </defs>
      <rect width="28" height="28" rx="6" fill="url(#indexBg)" />
      <rect x="7" y="9" width="14" height="2" rx="1" fill="#fff" />
      <rect x="7" y="13" width="13" height="2" rx="1" fill="#fff" />
      <rect x="7" y="17" width="11" height="2" rx="1" fill="#fff" />
    </svg>
  )
}

// Front — rounded square with a stylised "F"/notification dot mark. Front's
// brand uses a violet/purple background with a white inset glyph.
export function FrontLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#A276FF" />
      {/* Inner upper-left rounded rectangle */}
      <rect x="6" y="6" width="10" height="10" rx="3" fill="#fff" />
      {/* Inner lower-right circle (notification dot) */}
      <circle cx="18.5" cy="18.5" r="4.5" fill="#fff" />
    </svg>
  )
}

// Canny — rounded indigo square with an outlined "C" mark. The brand uses a
// stylised crescent that reads as both a "C" and a sound-wave glyph.
export function CannyLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#5C5BD6" />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="2.25"
        strokeLinecap="round"
        d="M19 9.5a6.5 6.5 0 1 0 0 9"
      />
      <circle cx="19" cy="14" r="1.5" fill="#fff" />
    </svg>
  )
}

// Zendesk — abstract "Z" mark made from two right-angle wedges. The brand
// uses a deep teal background; the mark itself is white space cut from the
// fill. Caller controls the background via parent text colour.
export function ZendeskLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#03363D" />
      {/* Top-left wedge: filled triangle pointing down-right */}
      <path fill="#fff" d="M6 8h10L6 20V8Z" />
      {/* Top-right wedge: rounded "fan" shape */}
      <path fill="#fff" d="M22 12a6 6 0 0 1-6-6h6v6Z" />
      {/* Bottom-right wedge: filled triangle pointing up-left */}
      <path fill="#fff" d="M22 20H12L22 8v12Z" />
      {/* Bottom-left wedge: rounded "fan" shape */}
      <path fill="#fff" d="M6 16a6 6 0 0 1 6 6H6v-6Z" />
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

// Descript — blue rounded square with a stylised lowercase "d" wordmark
// glyph in white. Approximates the Descript brand mark: a chunky letter "D"
// with the descender curving back into a partial circle.
export function DescriptLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#2D7FF9" />
      <path
        fill="#fff"
        d="M19 7v10.5c0 2.5-2 4.5-4.5 4.5h-1.4a4.6 4.6 0 1 1 0-9.2h2.5V9.6c0-.4.3-.7.6-.7H18c.5 0 1 .5 1 1Zm-3.4 9.3v-2.7H13c-1.4 0-2.5 1.2-2.5 2.7s1.1 2.7 2.5 2.7h.1c1.4 0 2.5-1.2 2.5-2.7Z"
      />
    </svg>
  )
}

// Canva AI Connector — cyan→blue gradient rounded square with a stylised
// white "C" wordmark glyph plus a sparkle accent. Approximates the new
// "Canva AI" iconography (the spiralling C with a star to the upper-right).
export function CanvaLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="canvaBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7B8DFF" />
          <stop offset="0.55" stopColor="#3CC4FF" />
          <stop offset="1" stopColor="#28E0CF" />
        </linearGradient>
      </defs>
      <rect width="28" height="28" rx="6" fill="url(#canvaBg)" />
      {/* Stylised C arc */}
      <path
        d="M19 11.5a5.6 5.6 0 1 0 0 5"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sparkle */}
      <path
        d="M21 7.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6Z"
        fill="#fff"
      />
    </svg>
  )
}

// Claap — coral/pink rounded square with the "claap" lowercase wordmark in
// white. The brand mark is the word with a few accent dots. Caller passes
// className for sizing.
export function ClaapLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#FF5C7A" />
      <text
        x="14"
        y="17.5"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui"
        fontSize="7"
        fontWeight="700"
        fill="#fff"
      >
        claap
      </text>
      {/* Accent dots — three pairs flanking the wordmark */}
      <circle cx="6" cy="9" r="0.7" fill="#fff" opacity="0.7" />
      <circle cx="22" cy="9" r="0.7" fill="#fff" opacity="0.7" />
      <circle cx="5.2" cy="20.5" r="0.6" fill="#fff" opacity="0.55" />
      <circle cx="22.8" cy="20.5" r="0.6" fill="#fff" opacity="0.55" />
    </svg>
  )
}

// Range — white rounded square with a rainbow-striped arch (the brand's
// "bridge" mark). The arch uses five bands cycling through red→purple to
// approximate the official multicolour stripe stack.
export function RangeLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#fff" />
      <path
        d="M4 19a10 10 0 0 1 20 0"
        stroke="#FF6B6B"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M5.6 19.4a8.4 8.4 0 0 1 16.8 0"
        stroke="#FFB454"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M7.2 19.8a6.8 6.8 0 0 1 13.6 0"
        stroke="#5BD891"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M8.8 20.2a5.2 5.2 0 0 1 10.4 0"
        stroke="#5DAEFF"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M10.4 20.6a3.6 3.6 0 0 1 7.2 0"
        stroke="#A276FF"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Microsoft Teams — purple rounded square with the official-style "T" mark
// rendered in white, plus a small accent dot. Tile background is part of the
// glyph so it composes correctly when the parent has no fill.
export function MicrosoftTeamsLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#6264A7" />
      {/* People silhouettes – primary group on the left */}
      <circle cx="11" cy="9.25" r="2.4" fill="#fff" />
      <rect x="6.6" y="12" width="8.8" height="9" rx="1.4" fill="#fff" />
      <rect x="8.6" y="13.4" width="1.4" height="6.2" fill="#6264A7" />
      <rect x="12" y="13.4" width="1.4" height="6.2" fill="#6264A7" />
      <rect x="8.6" y="13.4" width="4.8" height="1.4" fill="#6264A7" />
      {/* Secondary smaller silhouette on the right */}
      <circle cx="19" cy="8.5" r="1.9" fill="#fff" opacity="0.85" />
      <path
        d="M16.4 12h5.2c.6 0 1 .4 1 1v5.4c0 1.6-1.3 2.9-2.9 2.9h-.4a2.9 2.9 0 0 1-2.9-2.9V13c0-.6.4-1 1-1Z"
        fill="#fff"
        opacity="0.85"
      />
    </svg>
  )
}

// Discord — indigo rounded square with the official two-eye game-controller
// silhouette in white. Approximates the brand mark using simple ellipses for
// the eyes plus a rounded body shape.
export function DiscordLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#5865F2" />
      <path
        fill="#fff"
        d="M19.7 8.6a13 13 0 0 0-3.3-1l-.2.3c1.2.2 2.3.6 3.3 1.2-1.5-.8-3.2-1.2-4.9-1.2-1.7 0-3.4.4-4.9 1.2 1-.6 2.1-1 3.3-1.2l-.2-.3a13 13 0 0 0-3.3 1c-2 3-2.6 6-2.4 9 .1 0 1.3 1 3.5 1.2.3-.4.6-.9.8-1.4-.7-.3-1.4-.6-2-1l.5-.4a9.4 9.4 0 0 0 8.4 0l.5.4c-.6.4-1.3.7-2 1l.8 1.4c2.2-.2 3.4-1.2 3.5-1.2.2-3.5-.6-6.4-2.4-9ZM10.7 16.5c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Zm6.6 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5Z"
      />
    </svg>
  )
}

// Glean — soft white rounded square with a dark "g" arc mark. Mirrors the
// brand's monochrome wordmark glyph: a curved "g" with a short tail.
export function GleanLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#F4F4F2" />
      <path
        fill="none"
        stroke="#0B0B0F"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M19.5 11.5a5.6 5.6 0 1 0 0 5"
      />
      <path
        fill="none"
        stroke="#0B0B0F"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M19.5 11.5v8.4a3.4 3.4 0 0 1-3.4 3.4h-1.6"
      />
    </svg>
  )
}

// Loom — sunburst mark, drawn white so it can sit on a purple background.
export function LoomLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="#fff">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const cx = 16 + Math.cos(angle - Math.PI / 2) * 9
          const cy = 16 + Math.sin(angle - Math.PI / 2) * 9
          return <circle key={i} cx={cx} cy={cy} r="2.4" />
        })}
        <circle cx="16" cy="16" r="3.4" />
      </g>
    </svg>
  )
}

// Miro — three black vertical glyphs on a transparent canvas; caller supplies
// the yellow backing.
export function MiroLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="#0b0b0f">
        <path d="M21.5 5.5h2.6l-2.7 7.6 4.4-7.6h2.6l-3.7 8.6 4.5-8.6h2.4l-5 11.6q-1.6 3.7-4.7 3.7-2 0-2-1.7 0-1.1.7-2.6l2.4-5.6-4 8.2q-1.3 2.6-3.6 2.6-1.9 0-1.9-1.7 0-1.1.7-2.7l2.6-5.5-4.1 8q-1.2 2.5-3.6 2.5-1.9 0-1.9-1.8 0-1.1.6-2.7L8.6 5.5h2.6l-3 7.7 4.5-7.7h2.4l-3.7 8.5 4.5-8.5h2.5l-3.6 8.5z" />
      </g>
    </svg>
  )
}

// Screenpresso — italic "p" mark in white on a red background (caller-provided).
export function ScreenpressoLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="#fff"
        d="M11.6 25.5 14.8 7.5h6.4q3.4 0 5.1 1.6 1.7 1.5 1.7 4.3 0 3.1-2.1 5-2.1 1.9-5.6 1.9h-3.5l-1 5.2zM18.4 16h2.5q1.6 0 2.5-.8.9-.8.9-2.3 0-1.1-.7-1.7-.7-.6-2.1-.6h-2.1z"
      />
    </svg>
  )
}

// Airbyte — stylized white tunnel/arch mark on the caller-provided indigo
// background.
export function AirbyteLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 24V14a6 6 0 0 1 12 0v10" />
        <path d="M13 24v-9a3 3 0 0 1 6 0v9" />
        <path d="M19 24v-7a3 3 0 0 1 6 0v7" />
      </g>
    </svg>
  )
}

// Retool — stylized "F" / staircase mark in white on the caller-provided dark
// background.
export function RetoolLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="#fff">
        <rect x="6" y="7" width="14" height="3.6" rx="0.6" />
        <rect x="6" y="14.2" width="10" height="3.6" rx="0.6" />
        <rect x="6" y="21.4" width="6" height="3.6" rx="0.6" />
        <rect x="22" y="14.2" width="3.6" height="10.8" rx="0.6" />
      </g>
    </svg>
  )
}

// Span — abstract upward-curving arch glyph (as seen on span.app), drawn dark
// so it can sit on a white tile.
export function SpanLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="#0b0b0f"
        d="M5 24 14 8h4l9 16h-4.5l-2.1-3.8h-9L9.5 24Zm9.6-7.6h5.8L17.5 11Z"
      />
    </svg>
  )
}

// Tella — square mark with a play triangle and recording dot, in white so it
// can sit on the brand violet background supplied by the caller.
export function TellaLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="#fff">
        <circle cx="9" cy="9" r="3" />
        <path d="M11 19h12v3H11zM11 24h8v3h-8z" />
        <path d="M22 8.5 28 12l-6 3.5z" />
      </g>
    </svg>
  )
}

// YouTube — rounded red play badge.
export function YouTubeLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="3" y="8" width="26" height="16" rx="4" fill="#FF0000" />
      <path d="M14 13.2v5.6l5-2.8z" fill="#fff" />
    </svg>
  )
}

// Jellyfish — stylized jellyfish silhouette in white on the caller-provided
// violet background. Dome with three trailing tendrils.
export function JellyfishLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="#fff">
        <path d="M6 14.5a10 10 0 0 1 20 0v1.5H6z" />
        <path d="M9.5 17.5q.8 2.4 0 4.6-.8 2.2.8 3.4 1.6 1.2 2-.6.4-1.8-.4-3.6-.8-1.8.4-3.8z" />
        <path d="M15 17.5q.6 3 .6 5.6 0 2.6-1 3.4-1 .8-1.4-1-.4-1.8.4-4 .8-2.2.4-4z" />
        <path d="M21.5 17.5q-.6 2.4-.4 4.4.2 2 -.8 3.6-1 1.6-1.8.4-.8-1.2.2-3.4 1-2.2.8-5z" />
      </g>
    </svg>
  )
}

// Kawach AI — shield with a "K" cut-out in white on the caller-provided
// dark grey tile (subtle gradient fill is added by the caller).
export function KawachLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="#fff"
        d="M16 4 6 8v8q0 6 4.4 9.4Q14 28 16 28t5.6-2.6Q26 22 26 16V8z"
      />
      <path
        d="M13 11v10M13 16l5-5M13 16l5 5"
        stroke="#1f1f23"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// Orca Security — stacked "orca / SECURITY" wordmark drawn dark on a white
// tile (caller controls the tile colour). Simplified mark uses a small
// orca-fin glyph + uppercase rule.
export function OrcaSecurityLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="#0b1f4d">
        <path d="M5 13q3-2 7-2 5 0 9 4l3-1-2 3q1 2 1 4h-3q-1-3-3-4-3-2-7-2-3 0-5 1zM7 16h2v2H7zM12 16h2v2h-2z" />
      </g>
      <g fill="#0b1f4d">
        <rect x="6" y="22" width="20" height="0.8" />
        <text
          x="16"
          y="27.6"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="3.6"
          fontWeight="700"
          letterSpacing="0.4"
        >
          SECURITY
        </text>
      </g>
    </svg>
  )
}

// Drata — sharpened "A" / shield wordmark in white on the caller-provided
// dark navy tile.
export function DrataLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="#fff">
        <path d="M16 5 5 26h4l1.6-3.2h10.8L23 26h4zm-3.4 14.4L16 12.8l3.4 6.6z" />
      </g>
    </svg>
  )
}

// Fencer — open shield/book mark in white on the caller-provided emerald
// tile.
export function FencerLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="#fff">
        <path d="M7 6h8.4q1.6 0 2.6 1 1 1 1 2.6V26h-8.4q-1.6 0-2.6-1-1-1-1-2.6z" />
        <path d="M25 6h-4v17q0 1.4-1 2.4-.6.6-1.4.8h6.4q.4 0 .6-.2.4-.4.4-.8z" />
      </g>
      <path
        d="M11 12h4M11 15h4M11 18h3"
        stroke="#0b7a3a"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Aikido Security — bold "A" / upward chevron lockup in white on the
// caller-provided indigo tile, with a small bar beneath suggesting a base.
export function AikidoLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g fill="#fff">
        <path d="M16 6 6 22h4l6-9.6 6 9.6h4z" />
        <rect x="9" y="23" width="14" height="2.4" rx="0.8" />
      </g>
    </svg>
  )
}

// Cloudback — abstract "C/L" backup glyph in dark on a white tile (caller
// provides the tile colour). Stylized as an interlocked link badge.
export function CloudbackLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g
        fill="none"
        stroke="#0b0b0f"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11a7 7 0 1 0 0 10" />
        <path d="M14 16h6" />
        <path d="M17 13l3 3-3 3" />
      </g>
    </svg>
  )
}

// Cycle Report — circular refresh-arrow glyph drawn in violet on the
// caller-provided dark tile. Two arc segments suggest a sprint cycle.
export function CycleReportLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g
        fill="none"
        stroke="#A78BFA"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 12a9 9 0 1 0 1.5 8.5" />
        <path d="M25 6.5V12h-5.5" />
      </g>
      <circle cx="16" cy="16" r="2.6" fill="#A78BFA" />
    </svg>
  )
}

// Coda — rounded orange tile with a stylized white "C" mark.
export function CodaLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="#fff"
        d="M22 9q-2.6-1.6-6-1.6-4.2 0-7.1 2.5Q6 12.4 6 16t2.9 6.1q2.9 2.5 7.1 2.5 3.4 0 6-1.6l-2.4-3.4q-1.6 1-3.6 1-2.4 0-4.1-1.3-1.7-1.3-1.7-3.3t1.7-3.3q1.7-1.3 4.1-1.3 2 0 3.6 1z"
      />
    </svg>
  )
}

// SecureSlate — stylized lightning-bolt "S" in emerald on the caller-provided
// dark tile.
export function SecureSlateLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="#10B981" d="M19.4 5.5h-7.2L7 16h6l-2.6 10.5 9.6-13.6h-5.8z" />
    </svg>
  )
}

// Vanta — bold "V" wordmark glyph in white on the caller-provided dark tile.
// A small peace-sign dot caps the right stroke, echoing the production mark.
export function VantaLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="#fff" d="m6 8 7.4 16h5.2L26 8h-4.2l-5.6 12.4L10.2 8z" />
      <circle cx="24.4" cy="9.6" r="1.7" fill="#fff" />
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
