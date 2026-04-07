"use client"

import { Button } from "@/components/ui/button"

export default function TeamsDirectoryPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <Button variant="outline">Create team</Button>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        {/* Team icon illustration */}
        <div className="relative mb-6">
          <div className="flex size-28 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <svg className="size-16 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="7" r="3" />
              <circle cx="17" cy="7" r="3" />
              <circle cx="9" cy="7" r="3" />
              <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" opacity="0.3" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M14 21v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" opacity="0.2" />
            </svg>
          </div>
          <div className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </div>
        </div>

        <h2 className="mb-3 text-xl font-semibold">Bring everyone together onto one team</h2>
        <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          Don&apos;t go it alone—create a team to start connecting work across apps and celebrating your collective success.
        </p>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Create team
        </Button>
      </div>
    </div>
  )
}
