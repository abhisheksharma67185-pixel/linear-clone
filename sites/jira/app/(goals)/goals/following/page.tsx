"use client"

import { Button } from "@/components/ui/button"

export default function FollowingPage() {
  return (
    <div className="p-6">
      {/* Banner */}
      <div className="mb-6 flex items-center justify-between rounded-lg border bg-blue-50/50 px-5 py-4 dark:bg-blue-900/10">
        <div className="flex items-center gap-3">
          <svg className="size-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" opacity="0.2" /><circle cx="12" cy="12" r="5" />
          </svg>
          <p className="text-sm">
            Goals give teams a single place to track progress toward the outcomes that their work contributes to.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <Button className="bg-green-600 text-white hover:bg-green-700">Create your first goal</Button>
          <button className="text-sm text-muted-foreground hover:underline">More about goals</button>
        </div>
      </div>

      {/* Same Goals header with All goals tab structure */}
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">Goals</h1>
        <div className="flex items-center gap-1">
          <button className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">All goals</button>
          <button className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">My goals</button>
          <button className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">Archived</button>
          <button className="flex items-center gap-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
            More views <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </button>
        </div>
      </div>

      {/* Empty following state */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="mb-4 size-16 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
        <p className="text-sm text-muted-foreground">You&apos;re not following any goals yet.</p>
        <p className="text-sm text-muted-foreground">Follow goals to see updates here.</p>
      </div>
    </div>
  )
}
