"use client"

import { Button } from "@/components/ui/button"

export default function ApiKeysPage() {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">API keys</h1>

      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        {/* Key illustration */}
        <div className="relative mb-6">
          <svg className="h-24 w-32" viewBox="0 0 128 96" fill="none">
            {/* Key body */}
            <rect x="10" y="30" width="60" height="12" rx="3" fill="#FFC400" />
            <rect
              x="10"
              y="30"
              width="60"
              height="12"
              rx="3"
              stroke="#FF991F"
              strokeWidth="1"
            />
            {/* Key head (circle part) */}
            <circle
              cx="22"
              cy="36"
              r="16"
              fill="#FFC400"
              stroke="#FF991F"
              strokeWidth="1.5"
            />
            <circle cx="22" cy="36" r="8" fill="#FF991F" />
            <circle cx="22" cy="36" r="4" fill="#FFC400" />
            {/* Key teeth */}
            <rect
              x="55"
              y="42"
              width="4"
              height="8"
              rx="1"
              fill="#FFC400"
              stroke="#FF991F"
              strokeWidth="0.5"
            />
            <rect
              x="63"
              y="42"
              width="4"
              height="10"
              rx="1"
              fill="#FFC400"
              stroke="#FF991F"
              strokeWidth="0.5"
            />
            {/* Connection ring */}
            <circle
              cx="82"
              cy="36"
              r="12"
              fill="#2684FF"
              stroke="#0052CC"
              strokeWidth="1.5"
            />
            <circle cx="82" cy="36" r="6" fill="#4C9AFF" />
            {/* Small decorative circle */}
            <circle cx="96" cy="28" r="4" fill="#B3D4FF" />
          </svg>
        </div>

        <h2 className="mb-3 text-lg font-semibold">
          Build more integrations with API keys
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Create API keys to automate Atlassian administration tasks in your
          organization.{" "}
          <button type="button" className="text-blue-600 hover:underline">
            Understand API keys
          </button>
        </p>

        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Create your API key
        </Button>
      </div>
    </div>
  )
}
