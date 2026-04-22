"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DataClassificationPage() {
  const [showBenefits, setShowBenefits] = useState(false)

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Data classification</h1>

      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        {/* Shield illustration */}
        <div className="relative mb-6">
          <svg className="size-28" viewBox="0 0 120 120" fill="none">
            <path
              d="M60 10L15 30v30c0 27.6 19.2 53.4 45 60 25.8-6.6 45-32.4 45-60V30L60 10z"
              fill="#FFC400"
            />
            <path
              d="M60 16L21 34v26c0 25 17.4 48.4 39 54.4V16z"
              fill="#FF991F"
            />
            <path
              d="M60 16l39 18v26c0 25-17.4 48.4-39 54.4V16z"
              fill="#FFC400"
            />
            <g transform="translate(72, 12)">
              <path
                d="M10 20l8 8 16-16"
                stroke="#36B37E"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M5 15l6 6 12-12"
                stroke="#36B37E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.5"
              />
            </g>
          </svg>
        </div>

        <h2 className="mb-3 text-lg font-semibold">
          Classify data in your Atlassian apps
        </h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Data classification allows you to define classification levels for
          users to categorize their content into. It&apos;s the foundation of
          data governance and can be based on different taxonomies, such as data
          sensitivity, data type or regulatory requirements.{" "}
          <Link
            href="/admin/security/security-guide"
            className="text-blue-600 hover:underline"
          >
            How data classification works
          </Link>
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowBenefits(!showBenefits)}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore benefits
          </button>
          <Link href="/admin/security/security-guide">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Trial Atlassian Guard Premium
            </Button>
          </Link>
        </div>

        {/* Benefits panel */}
        {showBenefits && (
          <div className="mt-8 w-full rounded-lg border bg-card p-6 text-left">
            <h3 className="mb-4 text-base font-semibold">
              Benefits of Data Classification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="size-4 text-green-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Data governance</p>
                  <p className="text-xs text-muted-foreground">
                    Define classification levels and enforce data handling
                    policies across your organization.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="size-4 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Compliance</p>
                  <p className="text-xs text-muted-foreground">
                    Meet regulatory requirements like GDPR, HIPAA, and SOC 2
                    with proper data categorization.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <svg
                    className="size-4 text-purple-600"
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
                </div>
                <div>
                  <p className="text-sm font-medium">User awareness</p>
                  <p className="text-xs text-muted-foreground">
                    Help users understand data sensitivity when creating and
                    sharing content.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                  <svg
                    className="size-4 text-yellow-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Risk reduction</p>
                  <p className="text-xs text-muted-foreground">
                    Prevent accidental data exposure by labeling sensitive
                    information clearly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
