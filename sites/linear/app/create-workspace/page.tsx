"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateWorkspacePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [urlSlug, setUrlSlug] = useState("")
  const [region, setRegion] = useState("United States")

  // Auto-generate slug from name
  function handleNameChange(val: string) {
    setName(val)
    setUrlSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
  }

  return (
    <div className="flex min-h-screen flex-col bg-[oklch(0.08_0_0)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Linear
        </Link>
        <span className="text-sm text-muted-foreground">
          Logged in as{" "}
          <span className="text-foreground">theta.computer01@gmail.com</span>
        </span>
      </div>

      {/* Center content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        {/* Heading */}
        <h1 className="mb-3 text-center text-3xl font-semibold text-foreground">
          Create a new workspace
        </h1>
        <p className="mb-10 max-w-md text-center text-sm text-muted-foreground">
          Workspaces are shared environments where teams can work on projects, cycles and issues.
        </p>

        {/* Form card */}
        <div className="w-full max-w-md rounded-2xl bg-[oklch(0.13_0_0)] p-6">
          {/* Workspace Name */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Workspace Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-violet-500/70 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              placeholder=""
            />
          </div>

          {/* Workspace URL */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Workspace URL
            </label>
            <div className="flex items-center rounded-lg border border-border bg-transparent px-3 py-2.5">
              <span className="shrink-0 text-sm text-muted-foreground">linear.app/</span>
              <input
                type="text"
                value={urlSlug}
                onChange={(e) => setUrlSlug(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                placeholder=""
              />
            </div>
          </div>

          {/* Region */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Workspace will be hosted in the</span>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="appearance-none rounded-md border border-border bg-[oklch(0.18_0_0)] py-1 pl-2.5 pr-6 text-xs font-medium text-foreground focus:outline-none cursor-pointer"
              >
                <option>United States</option>
                <option>European Union</option>
              </select>
              <svg viewBox="0 0 10 10" className="pointer-events-none absolute right-1.5 top-1/2 size-2.5 -translate-y-1/2 text-muted-foreground" fill="currentColor">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <button
              type="button"
              className="flex size-5 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground hover:text-foreground"
            >
              ?
            </button>
          </div>
        </div>

        {/* Create button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-5 w-full max-w-md rounded-full bg-violet-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-600 active:bg-violet-700"
        >
          Create workspace
        </button>
      </div>
    </div>
  )
}
