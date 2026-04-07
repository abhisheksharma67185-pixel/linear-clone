"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function TeamsForYouPage() {
  return (
    <div className="p-8 max-w-5xl">
      {/* People you work with */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">People you work with</h2>
            <Button variant="outline" size="sm">Add people</Button>
          </div>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Browse everyone
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex w-40 flex-col items-center rounded-lg border p-6 hover:bg-accent/50 transition-colors cursor-pointer">
            <Avatar className="size-20 mb-3">
              <AvatarFallback className="bg-blue-600 text-2xl font-semibold text-white">AS</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-center">Abhishek Sharma</span>
          </div>
        </div>
      </div>

      {/* Open up your team work */}
      <div className="flex items-start gap-8 rounded-xl overflow-hidden">
        {/* Illustration */}
        <div className="w-[360px] shrink-0 rounded-xl bg-gray-100 p-6 dark:bg-gray-800">
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2">
              <div className="size-4 rounded bg-yellow-400" />
              <div className="h-2.5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="ml-auto h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-2 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="size-3 rounded-full bg-blue-400" />
              <div className="size-3 rounded-full bg-pink-400" />
              <div className="h-2 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="mt-2 flex gap-2">
              <div className="h-6 w-12 rounded bg-blue-500" />
              <div className="h-6 w-12 rounded bg-blue-400" />
              <div className="h-6 w-16 rounded bg-orange-400" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="pt-4">
          <h2 className="mb-3 text-xl font-semibold">Open up your team work</h2>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground max-w-md">
            Capture who&apos;s on your team, what they work on, and how people can get help from your team. All in a profile that can be used across Jira, Confluence and other Atlassian apps.
          </p>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            Create a team
          </Button>
        </div>
      </div>
    </div>
  )
}
