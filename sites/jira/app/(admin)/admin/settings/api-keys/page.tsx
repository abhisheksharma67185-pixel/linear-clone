"use client"

import { Button } from "@/components/ui/button"

export default function ApiKeysPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">API keys</h1>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto">
        {/* Key illustration */}
        <div className="relative mb-6">
          <svg className="w-32 h-24" viewBox="0 0 128 96" fill="none">
            {/* Key body */}
            <rect x="10" y="30" width="60" height="12" rx="3" fill="#FFC400" />
            <rect x="10" y="30" width="60" height="12" rx="3" stroke="#FF991F" strokeWidth="1" />
            {/* Key head (circle part) */}
            <circle cx="22" cy="36" r="16" fill="#FFC400" stroke="#FF991F" strokeWidth="1.5" />
            <circle cx="22" cy="36" r="8" fill="#FF991F" />
            <circle cx="22" cy="36" r="4" fill="#FFC400" />
            {/* Key teeth */}
            <rect x="55" y="42" width="4" height="8" rx="1" fill="#FFC400" stroke="#FF991F" strokeWidth="0.5" />
            <rect x="63" y="42" width="4" height="10" rx="1" fill="#FFC400" stroke="#FF991F" strokeWidth="0.5" />
            {/* Connection ring */}
            <circle cx="82" cy="36" r="12" fill="#2684FF" stroke="#0052CC" strokeWidth="1.5" />
            <circle cx="82" cy="36" r="6" fill="#4C9AFF" />
            {/* Small decorative circle */}
            <circle cx="96" cy="28" r="4" fill="#B3D4FF" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold mb-3">
          Build more integrations with API keys
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          Create API keys to automate Atlassian administration tasks in your organization.{" "}
          <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Understand API keys</a>
        </p>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Create your API key
        </Button>
      </div>
    </div>
  )
}
