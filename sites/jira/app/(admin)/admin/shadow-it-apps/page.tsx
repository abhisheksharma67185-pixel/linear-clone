"use client"

import { Button } from "@/components/ui/button"

export default function ShadowItAppsPage() {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Shadow IT apps</h1>

      <div className="flex flex-col items-center py-8 text-center">
        {/* Telescope illustration */}
        <svg
          className="mb-6 size-28"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="60" cy="60" r="56" fill="#EFF6FF" />
          <rect
            x="50"
            y="30"
            width="12"
            height="50"
            rx="3"
            transform="rotate(-25 50 30)"
            fill="#3B82F6"
          />
          <rect
            x="38"
            y="18"
            width="16"
            height="22"
            rx="3"
            transform="rotate(-25 38 18)"
            fill="#2563EB"
          />
          <circle cx="42" cy="24" r="6" fill="#1D4ED8" />
          <circle cx="42" cy="24" r="3" fill="#93C5FD" />
          <line
            x1="62"
            y1="78"
            x2="45"
            y2="100"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="62"
            y1="78"
            x2="80"
            y2="100"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="52"
            y1="90"
            x2="73"
            y2="90"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <h2 className="mb-2 text-lg font-semibold">
          Discover and track all app instances
        </h2>
      </div>

      <div className="rounded-lg border p-6">
        <p className="mb-1 font-bold">You need to verify a domain</p>
        <p className="mb-2 text-sm text-muted-foreground">
          To discover apps administered by managed accounts, you need to verify
          a domain.
        </p>
        <a
          href="/admin/domains"
          className="mb-4 block text-sm text-blue-600 hover:underline"
        >
          Tell me more about discovered apps
        </a>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => (window.location.href = "/admin/domains")}
        >
          Verify domain
        </Button>
      </div>
    </div>
  )
}
