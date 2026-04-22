"use client"

import { useState } from "react"
// Input replaced with plain <input> — base-ui Input unreliable

const helpLinks = [
  {
    label: "Read help articles",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    external: true,
  },
  {
    label: "Find out what's changed in your Atlassian apps",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    external: true,
  },
  {
    label: "Ask our community forum",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    external: true,
  },
  {
    label: "Contact support",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    external: true,
  },
  {
    label: "Give feedback",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    external: false,
  },
]

// Mock search data for help articles
const helpArticles = [
  {
    title: "Getting started with Atlassian administration",
    category: "Admin basics",
  },
  { title: "Managing users and groups", category: "User management" },
  { title: "Understanding authentication policies", category: "Security" },
  { title: "Setting up SSO with SAML", category: "Identity providers" },
  { title: "Configuring external user access", category: "User security" },
  { title: "Understanding data residency", category: "Data management" },
  { title: "Managing app access settings", category: "Apps" },
  { title: "Billing and subscription management", category: "Billing" },
  { title: "Using Rovo AI features", category: "Rovo" },
  { title: "Audit log and compliance", category: "Insights" },
  { title: "Domain verification guide", category: "Directory" },
  { title: "IP allowlists and device security", category: "Security" },
]

export function AdminSearchPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState("")

  if (!open) return null

  const filteredArticles = query.trim()
    ? helpArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div className="flex h-full w-80 flex-col border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-base font-semibold">Search</h2>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-accent"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Search input */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <svg
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles"
            autoFocus
            className="w-full rounded-md border bg-background py-2 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Search results or help links */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {query.trim() ? (
          filteredArticles.length > 0 ? (
            <div className="flex flex-col gap-1">
              {filteredArticles.map((article, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery("")
                    onClose()
                  }}
                  className="flex items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent"
                >
                  <svg
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <div>
                    <p className="text-sm">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {article.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg
                className="mb-2 size-10 text-muted-foreground/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-1">
            {helpLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => onClose()}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              >
                <span className="text-muted-foreground">{link.icon}</span>
                <span className="flex-1">{link.label}</span>
                {link.external && (
                  <svg
                    className="size-3.5 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <button
            onClick={() => onClose()}
            className="transition-colors hover:text-foreground"
          >
            About
          </button>
          <button
            onClick={() => onClose()}
            className="transition-colors hover:text-foreground"
          >
            Terms of use
          </button>
          <button
            onClick={() => onClose()}
            className="transition-colors hover:text-foreground"
          >
            Privacy policy
          </button>
        </div>
      </div>
    </div>
  )
}
