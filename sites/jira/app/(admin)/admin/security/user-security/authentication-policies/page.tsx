"use client"

import { Button } from "@/components/ui/button"

export default function AuthenticationPoliciesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 max-w-2xl mx-auto text-center">
      {/* Lock illustration */}
      <div className="relative mb-8">
        <svg className="size-32" viewBox="0 0 128 128" fill="none">
          {/* Padlock body */}
          <rect x="28" y="56" width="72" height="52" rx="8" fill="#2684FF" />
          {/* Padlock shackle */}
          <path d="M40 56V40a24 24 0 0 1 48 0v16" stroke="#2684FF" strokeWidth="8" fill="none" strokeLinecap="round" />
          {/* Keyhole */}
          <circle cx="64" cy="78" r="6" fill="white" />
          <rect x="61" y="82" width="6" height="10" rx="2" fill="white" />
          {/* Key decoration */}
          <g transform="translate(80, 52)">
            <circle cx="12" cy="12" r="10" fill="#FFC400" stroke="#FF991F" strokeWidth="2" />
            <circle cx="12" cy="12" r="5" fill="#FF991F" />
            <rect x="20" y="10" width="16" height="4" rx="1" fill="#FFC400" />
            <rect x="30" y="10" width="4" height="8" rx="1" fill="#FFC400" />
          </g>
          {/* Small circles decoration */}
          <circle cx="96" cy="44" r="4" fill="#B3D4FF" />
          <circle cx="104" cy="56" r="3" fill="#B3D4FF" opacity="0.6" />
        </svg>
      </div>

      <h1 className="text-xl font-semibold mb-3">
        Before you can set up authentication policies
      </h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        You need to verify ownership of your company domain and claim your user accounts. You can then set up an authentication policy to secure log in for your users.{" "}
        <button type="button" className="text-blue-600 hover:underline">Explore authentication policies</button>
      </p>

      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
        Verify domain
      </Button>
    </div>
  )
}
