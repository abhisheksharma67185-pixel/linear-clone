"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import type { Project } from "@/app/lib/mock-data"

export default function CodePage() {
  const params = useParams<{ key: string }>()
  const projectKey = params.key
  const [project, setProject] = useState<Project | null>(null)
  const [viewsOpen, setViewsOpen] = useState(false)
  const [connectModal, setConnectModal] = useState<string | null>(null)

  const VIEWS = [
    { name: "Archived work items", icon: "archive" },
    { name: "Calendar", icon: "calendar" },
    { name: "Deployments", icon: "deploy" },
    { name: "Development", icon: "dev" },
    { name: "Forms", icon: "form" },
    { name: "Goals", icon: "goal" },
    { name: "List", icon: "list" },
    { name: "Pages", icon: "page" },
    { name: "Releases", icon: "release" },
    { name: "Reports", icon: "report" },
    { name: "Security", icon: "security" },
    { name: "Shortcuts", icon: "shortcut" },
    { name: "Timeline", icon: "timeline" },
  ]

  useEffect(() => {
    fetch(`/api/data/projects/${projectKey}`)
      .then((r) => r.json())
      .then(setProject)
  }, [projectKey])

  if (!project) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Project header */}
      <div className="px-6 pt-4 pb-1">
        <p className="mb-1 text-xs text-muted-foreground">
          <Link href="/projects" className="hover:underline">
            Spaces
          </Link>
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78m0 0L12 8l7-7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="Team members"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="More actions"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="Share"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
            </button>
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="Automation"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </button>
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="Chat"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button
              className="flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent"
              title="Full screen"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-b px-6">
        <div className="flex items-center gap-0">
          {[
            {
              label: "Summary",
              href: `/projects/${project.key}/summary`,
              icon: (
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
            },
            {
              label: "Backlog",
              href: `/projects/${project.key}/backlog`,
              icon: (
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 7h10M7 12h10M7 17h6" />
                </svg>
              ),
            },
            {
              label: "Board",
              href: `/projects/${project.key}/board`,
              icon: (
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="5" height="18" rx="1" />
                  <rect x="10" y="3" width="5" height="18" rx="1" />
                  <rect x="17" y="3" width="5" height="18" rx="1" />
                </svg>
              ),
            },
            {
              label: "Code",
              href: `/projects/${project.key}/code`,
              active: true,
              icon: (
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              ),
            },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                tab.active
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          ))}
          {/* + Add view button */}
          <div className="relative ml-1">
            <button
              onClick={() => setViewsOpen(!viewsOpen)}
              className={`flex size-8 items-center justify-center rounded transition-colors ${viewsOpen ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            {viewsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setViewsOpen(false)}
                />
                <div className="absolute top-full left-0 z-50 mt-2 flex rounded-lg border bg-popover shadow-xl">
                  <div className="w-[200px] border-r py-2">
                    <p className="px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      Views
                    </p>
                    {VIEWS.map((view) => (
                      <button
                        key={view.name}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                        onClick={() => setViewsOpen(false)}
                      >
                        <svg
                          className="size-4 shrink-0 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          {view.icon === "archive" && (
                            <>
                              <path d="M21 8v13H3V8" />
                              <path d="M1 3h22v5H1z" />
                              <path d="M10 12h4" />
                            </>
                          )}
                          {view.icon === "calendar" && (
                            <>
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2v4M8 2v4M3 10h18" />
                            </>
                          )}
                          {view.icon === "deploy" && (
                            <>
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </>
                          )}
                          {view.icon === "dev" && (
                            <>
                              <polyline points="16 18 22 12 16 6" />
                              <polyline points="8 6 2 12 8 18" />
                            </>
                          )}
                          {view.icon === "form" && (
                            <>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6M9 13h6M9 17h3" />
                            </>
                          )}
                          {view.icon === "goal" && (
                            <>
                              <circle cx="12" cy="12" r="10" />
                              <circle cx="12" cy="12" r="6" />
                              <circle cx="12" cy="12" r="2" />
                            </>
                          )}
                          {view.icon === "list" && (
                            <>
                              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                            </>
                          )}
                          {view.icon === "page" && (
                            <>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                            </>
                          )}
                          {view.icon === "release" && (
                            <>
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <path d="M12 15V3" />
                            </>
                          )}
                          {view.icon === "report" && (
                            <>
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </>
                          )}
                          {view.icon === "security" && (
                            <>
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </>
                          )}
                          {view.icon === "shortcut" && (
                            <>
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </>
                          )}
                          {view.icon === "timeline" && (
                            <>
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </>
                          )}
                        </svg>
                        {view.name}
                      </button>
                    ))}
                  </div>
                  <div className="w-[220px] p-4">
                    <div className="mb-3 flex h-[100px] items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-blue-900/20 dark:to-purple-900/20">
                      <svg
                        className="size-10 text-blue-400/50"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                    </div>
                    <p className="mb-1 text-sm font-medium">
                      Archived work items
                    </p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      View all the work items archived in your space items.
                    </p>
                    <button className="text-xs font-medium text-blue-600 hover:underline">
                      Add to navigation
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Code page content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        {/* Illustration placeholder */}
        <div className="mb-6 flex h-[160px] w-[220px] items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
          <svg
            className="size-16 text-purple-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
            <rect
              x="6"
              y="2"
              width="12"
              height="20"
              rx="2"
              strokeDasharray="4 2"
              opacity="0.3"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-xl font-semibold">
          Connect your code to Jira
        </h2>
        <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
          Minimise context switching and gain visibility of your team&apos;s
          pull requests and development workflow.
        </p>

        {/* Connect buttons */}
        <div className="mb-6 flex items-center gap-8">
          <button
            className="group flex flex-col items-center gap-2"
            onClick={() => setConnectModal("GitHub")}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Connect GitHub</span>
          </button>
          <button
            className="group flex flex-col items-center gap-2"
            onClick={() => setConnectModal("GitLab")}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
              <svg
                className="size-5 text-orange-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Connect GitLab</span>
          </button>
          <button
            className="group flex flex-col items-center gap-2"
            onClick={() => setConnectModal("Bitbucket")}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
              <svg
                className="size-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646L23.984 2.1a.768.768 0 0 0-.768-.892zM14.52 15.53H9.522L8.17 8.466h7.561z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Connect Bitbucket</span>
          </button>
        </div>

        <Link
          href="https://marketplace.atlassian.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Explore other integrations
        </Link>
      </div>

      {/* Connect modal */}
      {connectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setConnectModal(null)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[440px] rounded-lg border bg-popover shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold">
                Connect {connectModal}
              </h3>
              <button
                onClick={() => setConnectModal(null)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Connect your {connectModal} account to see development
                information alongside your Jira issues.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    1
                  </span>
                  <div>
                    <p className="text-sm font-medium">Authorize Jira</p>
                    <p className="text-xs text-muted-foreground">
                      Grant Jira access to your {connectModal} repositories.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    2
                  </span>
                  <div>
                    <p className="text-sm font-medium">Select repositories</p>
                    <p className="text-xs text-muted-foreground">
                      Choose which repositories to link to this project.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    3
                  </span>
                  <div>
                    <p className="text-sm font-medium">Start tracking</p>
                    <p className="text-xs text-muted-foreground">
                      See commits, branches, and pull requests on your Jira
                      issues.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-4">
              <button
                onClick={() => setConnectModal(null)}
                className="rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={() => setConnectModal(null)}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Connect {connectModal}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
