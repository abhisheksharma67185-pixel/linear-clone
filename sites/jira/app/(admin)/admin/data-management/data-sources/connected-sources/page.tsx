"use client"

import { Button } from "@/components/ui/button"

export default function ConnectedSourcesPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">Connected sources</h1>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto">
        {/* Globe illustration */}
        <div className="relative mb-6">
          <svg className="size-32" viewBox="0 0 128 128" fill="none">
            {/* Globe */}
            <circle cx="56" cy="72" r="40" fill="#E0E0E0" />
            <ellipse cx="56" cy="72" rx="20" ry="40" fill="#BDBDBD" />
            <line x1="16" y1="72" x2="96" y2="72" stroke="#9E9E9E" strokeWidth="1.5" />
            <line x1="56" y1="32" x2="56" y2="112" stroke="#9E9E9E" strokeWidth="1.5" />
            <ellipse cx="56" cy="52" rx="35" ry="8" stroke="#9E9E9E" strokeWidth="1" fill="none" />
            <ellipse cx="56" cy="92" rx="35" ry="8" stroke="#9E9E9E" strokeWidth="1" fill="none" />
            {/* Plus circle */}
            <circle cx="88" cy="44" r="24" fill="#2684FF" />
            <line x1="88" y1="34" x2="88" y2="54" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <line x1="78" y1="44" x2="98" y2="44" stroke="white" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold mb-3">
          Connect your Data Center instance
        </h2>

        <p className="text-sm text-muted-foreground mb-2">
          Bring your Data Center instance into your cloud organization.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Once connected, you&apos;ll be able to manage your connections from a single location and integrate with a variety of apps.{" "}
          <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Learn how</a>
        </p>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Connect Data Center
        </Button>
      </div>
    </div>
  )
}
