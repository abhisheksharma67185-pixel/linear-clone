"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AddAccountPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-[oklch(0.08_0_0)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none">
            <path
              d="M10 4L6 8l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Linear
        </Link>
        <span className="text-muted-foreground text-sm">
          Logged in as{" "}
          <span className="text-foreground">theta.computer01@gmail.com</span>
        </span>
      </div>

      {/* Center content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4">
        {/* Linear logo — sphere with diagonal stripes */}
        <svg viewBox="0 0 56 56" className="size-14" fill="none">
          <circle cx="28" cy="28" r="28" fill="#fff" fillOpacity="0.06" />
          <path
            d="M10 28C10 18.059 18.059 10 28 10a17.96 17.96 0 0 1 12.728 5.272L15.272 40.728A17.96 17.96 0 0 1 10 28Z"
            fill="white"
            fillOpacity="0.9"
          />
          <path
            d="M17.1 43.607 43.607 17.1A18 18 0 0 1 46 28c0 9.941-8.059 18-18 18a17.96 17.96 0 0 1-10.9-2.393Z"
            fill="white"
            fillOpacity="0.5"
          />
          <path
            d="M14.322 42.264 42.264 14.322a18.064 18.064 0 0 1 1.343 2.778L17.1 43.607a18.063 18.063 0 0 1-2.778-1.343Z"
            fill="white"
            fillOpacity="0.75"
          />
        </svg>

        {/* Heading */}
        <h1 className="text-foreground text-2xl font-semibold">
          Add an account
        </h1>

        {/* Buttons */}
        <div className="flex w-full max-w-xs flex-col gap-3">
          {/* Continue with Google — primary violet */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex w-full items-center justify-center gap-2.5 rounded-full bg-violet-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-600"
          >
            {/* Google G icon */}
            <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none">
              <path
                d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.4a4.6 4.6 0 0 1-2 3.03v2.52h3.23c1.89-1.74 2.97-4.3 2.97-7.34Z"
                fill="#fff"
                fillOpacity="0.9"
              />
              <path
                d="M10 20c2.7 0 4.97-.9 6.63-2.43l-3.23-2.52c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H1.06v2.6A10 10 0 0 0 10 20Z"
                fill="#fff"
                fillOpacity="0.75"
              />
              <path
                d="M4.39 11.88A5.98 5.98 0 0 1 4.07 10c0-.65.11-1.28.32-1.88V5.52H1.06A10 10 0 0 0 0 10c0 1.61.39 3.14 1.06 4.48l3.33-2.6Z"
                fill="#fff"
                fillOpacity="0.6"
              />
              <path
                d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.94 9.94 0 0 0 10 0 10 10 0 0 0 1.06 5.52L4.39 8.12C5.18 5.75 7.39 3.96 10 3.96Z"
                fill="#fff"
                fillOpacity="0.85"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-muted-foreground text-center text-xs">
            You used Google to log in last time
          </p>

          {/* Continue with email */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-foreground w-full rounded-full bg-[oklch(0.22_0_0)] py-3 text-sm font-medium transition-colors hover:bg-[oklch(0.26_0_0)]"
          >
            Continue with email
          </button>

          {/* Continue with SAML SSO */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-foreground w-full rounded-full bg-[oklch(0.22_0_0)] py-3 text-sm font-medium transition-colors hover:bg-[oklch(0.26_0_0)]"
          >
            Continue with SAML SSO
          </button>

          {/* Log in with passkey */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-foreground w-full rounded-full bg-[oklch(0.22_0_0)] py-3 text-sm font-medium transition-colors hover:bg-[oklch(0.26_0_0)]"
          >
            Log in with passkey
          </button>
        </div>
      </div>
    </div>
  )
}
