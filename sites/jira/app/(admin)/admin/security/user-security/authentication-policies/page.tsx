import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Authentication policies",
}

export default function AuthenticationPoliciesPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-8 text-center">
      {/* Lock illustration */}
      <div className="relative mb-8">
        <svg className="size-32" viewBox="0 0 128 128" fill="none">
          {/* Padlock body */}
          <rect x="28" y="56" width="72" height="52" rx="8" fill="#2684FF" />
          {/* Padlock shackle */}
          <path
            d="M40 56V40a24 24 0 0 1 48 0v16"
            stroke="#2684FF"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Keyhole */}
          <circle cx="64" cy="78" r="6" fill="white" />
          <rect x="61" y="82" width="6" height="10" rx="2" fill="white" />
          {/* Key decoration */}
          <g transform="translate(80, 52)">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="#FFC400"
              stroke="#FF991F"
              strokeWidth="2"
            />
            <circle cx="12" cy="12" r="5" fill="#FF991F" />
            <rect x="20" y="10" width="16" height="4" rx="1" fill="#FFC400" />
            <rect x="30" y="10" width="4" height="8" rx="1" fill="#FFC400" />
          </g>
          {/* Small circles decoration */}
          <circle cx="96" cy="44" r="4" fill="#B3D4FF" />
          <circle cx="104" cy="56" r="3" fill="#B3D4FF" opacity="0.6" />
        </svg>
      </div>

      <h1 className="mb-3 text-xl font-semibold">
        Before you can set up authentication policies
      </h1>

      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        You need to verify ownership of your company domain and claim your user
        accounts. You can then set up an authentication policy to secure log in
        for your users.{" "}
        <a
          href="https://support.atlassian.com/security-and-access-policies/docs/understand-authentication-policies/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Learn more about authentication policies, opens in new tab"
          className="text-blue-600 hover:underline"
        >
          Explore authentication policies
        </a>
      </p>

      <Link
        href="/admin/domains"
        aria-label="Verify your company domain to set up authentication policies"
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Verify domain
      </Link>
    </div>
  )
}
