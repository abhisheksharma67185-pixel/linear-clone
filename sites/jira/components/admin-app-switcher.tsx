"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

const mainApps = [
  {
    name: "Home",
    href: "/home",
    icon: (
      <svg
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    name: "Jira",
    href: "/dashboard",
    icon: (
      <svg className="size-6" viewBox="0 0 32 32" fill="none">
        <path
          d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z"
          fill="#2684FF"
        />
      </svg>
    ),
  },
  {
    name: "Goals",
    href: "/goals",
    icon: (
      <div className="flex size-6 items-center justify-center rounded-full bg-purple-600">
        <svg
          className="size-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
    ),
  },
  {
    name: "Projects",
    href: "/project-directory",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-green-600">
        <svg
          className="size-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>
    ),
  },
  {
    name: "Teams",
    href: "/teams",
    icon: (
      <div className="flex size-6 items-center justify-center rounded bg-blue-500">
        <svg
          className="size-3.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
    ),
  },
  {
    name: "Administration",
    href: "/admin",
    icon: (
      <div className="flex size-6 items-center justify-center">
        <svg
          className="size-5 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" />
        </svg>
      </div>
    ),
  },
]

const recommendedApps = [
  {
    name: "Jira Service Management",
    description: "Collaborative IT service management",
    icon: (
      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600">
        <svg
          className="size-4 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Jira Product Discovery",
    description: "Prioritize, collaborate, and deliver new i...",
    icon: (
      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-pink-500">
        <svg
          className="size-4 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
    ),
  },
  {
    name: "Confluence",
    description: "Document collaboration",
    icon: (
      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-teal-400">
        <svg
          className="size-4 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
    ),
  },
]

function RecommendedAppRow({
  app,
  onClose,
}: {
  app: { name: string; description: string; icon: React.ReactNode }
  onClose: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuOpen])

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent">
      {app.icon}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{app.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {app.description}
        </p>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute top-full right-0 z-50 mt-1 w-44 rounded-lg border bg-popover py-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onClose()
              }}
              className="w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent"
            >
              Not interested
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onClose()
              }}
              className="w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent"
            >
              Why am I seeing this?
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminAppSwitcher({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (open) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside)
      }, 0)
      return () => {
        clearTimeout(timer)
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={ref}
      className="absolute top-12 left-10 z-50 w-72 rounded-lg border bg-background py-2 shadow-lg"
    >
      {/* Main apps */}
      <div className="flex flex-col">
        {mainApps.map((app) => (
          <Link
            key={app.name}
            href={app.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
          >
            {app.icon}
            <span className="font-medium">{app.name}</span>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="my-2 border-t" />

      {/* Recommended */}
      <div className="px-4 py-2">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Recommended for your team
        </p>
      </div>
      <div className="flex flex-col">
        {recommendedApps.map((app) => (
          <RecommendedAppRow key={app.name} app={app} onClose={onClose} />
        ))}

        {/* More Atlassian apps */}
        <Link
          href="/home/apps"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
        >
          <div className="flex size-8 items-center justify-center rounded border">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <span className="text-sm font-medium">More Atlassian apps</span>
        </Link>
      </div>
    </div>
  )
}
