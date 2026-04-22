"use client"

import Link from "next/link"

export default function SitesPage() {
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">Sites</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage your Atlassian sites.
      </p>

      <Link href="/admin/sites/abhisheksharma67185" className="block">
        <div className="cursor-pointer rounded-lg border p-5 transition-colors hover:bg-accent/30">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
              <svg className="size-4" viewBox="0 0 32 32" fill="white">
                <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">abhisheksharma67185</p>
              <p className="text-xs text-blue-600 hover:underline">
                abhisheksharma67185.atlassian.net
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
