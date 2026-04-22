"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const providers = [
  {
    name: "Google Workspace",
    description: "Uses Google Workspace to integrate.",
    action: "Choose",
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48">
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
    ),
  },
  {
    name: "Active Directory Federation Services",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48">
        <rect width="22" height="22" x="2" y="2" fill="#F25022" />
        <rect width="22" height="22" x="24" y="2" fill="#7FBA00" />
        <rect width="22" height="22" x="2" y="24" fill="#00A4EF" />
        <rect width="22" height="22" x="24" y="24" fill="#FFB900" />
      </svg>
    ),
  },
  {
    name: "Auth0",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <path d="M34 8H14l-4 12 10 8-4 12h16l-4-12 10-8-4-12z" fill="#EB5424" />
      </svg>
    ),
  },
  {
    name: "Cyberark Idaptive",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#00A98F" />
        <path
          d="M24 12v24M16 18l16 12M32 18L16 30"
          stroke="white"
          strokeWidth="3"
        />
      </svg>
    ),
  },
  {
    name: "Duo",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#6BBF4E" />
        <text x="8" y="34" fill="white" fontWeight="bold" fontSize="22">
          duo
        </text>
      </svg>
    ),
  },
  {
    name: "Google Cloud Identity",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#4285F4" />
        <path
          d="M24 14a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    name: "JumpCloud",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#1E2D3D" />
        <path d="M14 28l10-16 10 16H14z" fill="#65CB8B" />
      </svg>
    ),
  },
  {
    name: "Microsoft Azure AD",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <path d="M18 6l-14 24h10l4-8 8 16h14L18 6z" fill="#0078D4" />
      </svg>
    ),
  },
  {
    name: "Okta",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#F5F5F5" />
        <text x="6" y="32" fill="#007DC1" fontWeight="bold" fontSize="18">
          okta
        </text>
      </svg>
    ),
  },
  {
    name: "OneLogin",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#2D3F50" />
        <circle cx="24" cy="24" r="10" fill="#01B4CE" />
        <text x="20" y="28" fill="white" fontSize="10" fontWeight="bold">
          1
        </text>
      </svg>
    ),
  },
  {
    name: "Ping Identity",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#B71C1C" />
        <text x="4" y="32" fill="white" fontWeight="bold" fontSize="16">
          Ping
        </text>
      </svg>
    ),
  },
  {
    name: "Other provider",
    guardRequired: true,
    iconBg: "bg-white",
    icon: (
      <svg className="size-8" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#E0E0E0" />
        <circle cx="24" cy="20" r="8" fill="#9E9E9E" />
        <path d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#9E9E9E" />
      </svg>
    ),
  },
]

export default function IdentityProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const selected = providers.find((p) => p.name === selectedProvider)

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Identity providers</h1>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        Manage users in Atlassian apps from one place, your identity provider.
        Set up single sign-on and user sync after you connect your identity
        provider.{" "}
        <Link
          href="/admin/security/security-guide"
          className="text-blue-600 hover:underline"
        >
          Explore identity providers
        </Link>
      </p>

      <h2 className="mb-4 text-base font-semibold">
        Choose an identity provider
      </h2>

      <div className="grid grid-cols-4 gap-4">
        {providers.map((provider) => (
          <button
            key={provider.name}
            onClick={() => setSelectedProvider(provider.name)}
            className="cursor-pointer rounded-lg border p-4 text-left transition-colors hover:bg-accent/50"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex size-10 items-center justify-center overflow-hidden rounded">
                {provider.icon}
              </div>
              {provider.action && (
                <span className="text-sm font-medium text-blue-600">
                  {provider.action}
                </span>
              )}
            </div>
            <h3 className="mb-1 text-sm font-semibold">{provider.name}</h3>
            {provider.description && (
              <p className="text-xs text-muted-foreground">
                {provider.description}
              </p>
            )}
            {provider.guardRequired && (
              <p className="text-xs text-blue-600">
                Requires an Atlassian Guard subscription
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Provider selection dialog */}
      <Dialog
        open={!!selectedProvider}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProvider(null)
            setConfirmed(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selected && (
                <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded">
                  {selected.icon}
                </div>
              )}
              {selectedProvider}
            </DialogTitle>
          </DialogHeader>

          {!confirmed ? (
            <div>
              {selected?.guardRequired ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:bg-yellow-950/20">
                    <svg
                      className="size-5 shrink-0 text-yellow-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z" />
                      <path d="M11 10h2v5h-2zm0 6h2v2h-2z" />
                    </svg>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      This provider requires an Atlassian Guard subscription.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start a free trial of Atlassian Guard to connect{" "}
                    {selectedProvider} as your identity provider.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Connect {selectedProvider} to manage users, enable single
                    sign-on, and sync user directories with your Atlassian
                    organization.
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h4 className="mb-2 text-sm font-medium">
                      What happens next:
                    </h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <svg
                          className="size-4 shrink-0 text-green-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Configure SSO settings
                      </li>
                      <li className="flex items-center gap-2">
                        <svg
                          className="size-4 shrink-0 text-green-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Set up user provisioning
                      </li>
                      <li className="flex items-center gap-2">
                        <svg
                          className="size-4 shrink-0 text-green-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Verify domain ownership
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="size-8 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-center text-sm font-medium">
                Setup initiated for {selectedProvider}
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Configuration steps will appear in your admin panel.
              </p>
            </div>
          )}

          <DialogFooter>
            {!confirmed ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProvider(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setConfirmed(true)}
                >
                  {selected?.guardRequired ? "Start free trial" : "Connect"}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProvider(null)
                  setConfirmed(false)
                }}
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
