"use client"

import { Button } from "@/components/ui/button"

export default function UserCountsPage() {
  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="mb-6 size-28" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="55" r="35" fill="#E9D5FF" />
          <rect x="38" y="30" width="44" height="55" rx="8" fill="#A855F7" />
          <rect x="38" y="30" width="44" height="18" rx="8" fill="#7C3AED" />
          <circle cx="54" cy="60" r="4" fill="#E9D5FF" />
          <rect x="52" y="64" width="4" height="12" rx="2" fill="#E9D5FF" />
          <circle cx="60" cy="38" r="3" fill="#E9D5FF" opacity="0.5" />
        </svg>
        <h2 className="mb-3 text-xl font-semibold">
          We&apos;re unable to let you in
        </h2>
        <p className="mb-2 text-sm text-muted-foreground">
          You need to have an eligible plan to access this feature.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          If you think you should have access, try refreshing the page or
          contact support.
        </p>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          See eligible plans
        </Button>
      </div>
    </div>
  )
}
