"use client"

import { Button } from "@/components/ui/button"

export default function ProjectFollowingPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between rounded-lg border bg-blue-50/50 px-5 py-4 dark:bg-blue-900/10">
        <div className="flex items-center gap-3">
          <svg className="size-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm">Use projects to keep everyone up to date with weekly status updates on any stream on work.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">Create your first project</Button>
          <button className="text-sm text-muted-foreground hover:underline">More about projects</button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-muted-foreground">Projects</h1>
        <div className="flex items-center gap-1">
          <button className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">All projects</button>
          <button className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">My projects</button>
          <button className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">Archived</button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="mb-4 size-16 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
        <p className="text-sm text-muted-foreground">You&apos;re not following any projects yet.</p>
      </div>
    </div>
  )
}
