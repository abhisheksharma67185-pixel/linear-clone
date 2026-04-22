"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HipaaCompliancePage() {
  const [showOverlay, setShowOverlay] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showBaaForm, setShowBaaForm] = useState(false)
  const [baaForm, setBaaForm] = useState({
    companyLegalName: "",
    email: "",
    confirmEmail: "",
    signatoryName: "",
    signatoryTitle: "",
    signatoryEmail: "",
    confirmSignatoryEmail: "",
    country: "",
    city: "",
    address: "",
    state: "",
    postalCode: "",
  })

  if (showBaaForm) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        <button
          onClick={() => setShowBaaForm(false)}
          className="absolute top-6 left-6 rounded p-1.5 text-muted-foreground hover:bg-accent"
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mx-auto max-w-xl px-8 pt-24 pb-32">
          <h1 className="mb-4 text-2xl font-bold">
            Sign a Business Associate Agreement (BAA)
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            The BAA specifies each party&apos;s responsibilities when it comes
            to safeguarding and using Protected Health Information (PHI). This
            agreement must be signed before the transfer of any PHI to the
            business associate. Trial plans are not eligible to sign BAAs.{" "}
            <Link
              href="/admin/security/security-guide"
              className="text-blue-600 hover:underline"
            >
              How to sign a BAA
            </Link>
          </p>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Company legal name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.companyLegalName}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, companyLegalName: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Your email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={baaForm.email}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, email: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Confirm your email address{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={baaForm.confirmEmail}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, confirmEmail: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name of signatory <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.signatoryName}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, signatoryName: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Title of signatory <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.signatoryTitle}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, signatoryTitle: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Email address of signatory{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={baaForm.signatoryEmail}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, signatoryEmail: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Confirm email address of signatory{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={baaForm.confirmSignatoryEmail}
                onChange={(e) =>
                  setBaaForm({
                    ...baaForm,
                    confirmSignatoryEmail: e.target.value,
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <h2 className="pt-4 text-xl font-bold">
              Organization&apos;s physical address
            </h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.country}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, country: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.city}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, city: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.address}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, address: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.state}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, state: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Postal code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.postalCode}
                onChange={(e) =>
                  setBaaForm({ ...baaForm, postalCode: e.target.value })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="fixed right-0 bottom-0 left-0 flex items-center justify-center gap-3 border-t bg-background py-4">
          <Button variant="outline" onClick={() => setShowBaaForm(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowBaaForm(false)}
          >
            Confirm
          </Button>
        </div>
      </div>
    )
  }

  if (showDetail) {
    return (
      <div className="max-w-5xl p-8">
        <button
          onClick={() => setShowDetail(false)}
          className="mb-2 flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Compliance
        </button>
        <h1 className="mb-8 text-2xl font-semibold">
          Health Insurance Portability and Accountability Act (HIPAA)
        </h1>

        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <svg className="mb-6 size-32" viewBox="0 0 120 120" fill="none">
            <rect x="28" y="56" width="52" height="40" rx="6" fill="#2684FF" />
            <path
              d="M38 56V42a16 16 0 0 1 32 0v14"
              stroke="#B3D4FF"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="54" cy="74" r="5" fill="white" />
            <rect x="51.5" y="77" width="5" height="8" rx="2" fill="white" />
            <g transform="translate(72, 58)">
              <circle
                cx="10"
                cy="10"
                r="9"
                fill="#0065FF"
                stroke="#B3D4FF"
                strokeWidth="2"
              />
              <circle cx="10" cy="10" r="4" fill="#FFC400" />
              <rect x="17" y="8" width="14" height="4" rx="1" fill="#0065FF" />
            </g>
            <circle cx="90" cy="48" r="4" fill="#B3D4FF" />
            <circle cx="98" cy="60" r="3" fill="#B3D4FF" opacity="0.5" />
          </svg>

          <h2 className="mb-2 text-lg font-semibold">
            Tag your apps to enable HIPAA
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Select and tag apps to enable HIPAA.{" "}
            <Link
              href="/admin/security/security-guide"
              className="text-blue-600 hover:underline"
            >
              Explore HIPAA compliance
            </Link>
          </p>

          <div className="w-full rounded-lg border p-6 text-center">
            <h3 className="mb-2 text-sm font-semibold">Before you tag apps</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              You need to sign a Business Associate Agreement (BAA) with us.
              This agreement must be signed before the transfer of any Protected
              Health Information (PHI) to the business associate.
            </p>
            <Link
              href="/admin/security/security-guide"
              className="mb-4 inline-block text-sm text-blue-600 hover:underline"
            >
              How to sign a BAA
            </Link>
            <div>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setShowBaaForm(true)}
              >
                Sign a BAA
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Full-screen overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
          <button
            onClick={() => setShowOverlay(false)}
            className="absolute top-6 left-6 rounded p-1.5 text-muted-foreground hover:bg-accent"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="mx-auto max-w-2xl px-8 pt-24 pb-32">
            <h1 className="mb-6 text-2xl font-bold">
              HIPAA compliance for Atlassian apps
            </h1>

            <p className="mb-6 text-sm text-muted-foreground">
              HIPAA is currently available for Jira, Jira Service Management,
              and Confluence. It is important to remember that HIPAA compliance
              is a shared responsibility between Atlassian and you. Simply
              completing these steps won&apos;t automatically guarantee your
              compliance with HIPAA.{" "}
              <Link
                href="/admin/security/security-guide"
                className="text-blue-600 hover:underline"
              >
                Explore HIPAA compliance for Atlassian apps
              </Link>
            </p>

            <h2 className="mb-2 text-base font-semibold">
              Sign a Business Associate Agreement (BAA)
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              A BAA is a written contract between a business associate and a
              covered entity or another business associate. The BAA outlines the
              terms and conditions to ensure Protected Health Information (PHI)
              is appropriately safeguarded.{" "}
              <Link
                href="/admin/security/security-guide"
                className="text-blue-600 hover:underline"
              >
                How to sign a BAA
              </Link>
            </p>

            <h2 className="mb-2 text-base font-semibold">
              Tag your apps to enable HIPAA
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Tagged apps help us identify apps that contain PHI. Only these
              apps will be protected in accordance with HIPAA requirements.{" "}
              <Link
                href="/admin/security/security-guide"
                className="text-blue-600 hover:underline"
              >
                How to tag apps
              </Link>
            </p>

            <h2 className="mb-2 text-base font-semibold">
              Follow our HIPAA Implementation Guide
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              You must follow the steps outlined in the HIPAA Implementation
              Guide to manually configure app settings.{" "}
              <Link
                href="/admin/security/security-guide"
                className="text-blue-600 hover:underline"
              >
                Explore the HIPAA implementation guide
              </Link>
            </p>
          </div>

          <div className="fixed right-0 bottom-0 left-0 flex items-center justify-center gap-3 border-t bg-background py-4">
            <Button variant="outline" onClick={() => setShowOverlay(false)}>
              Back
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                setShowOverlay(false)
                setShowDetail(true)
              }}
            >
              I understand
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-5xl p-8">
        <h1 className="mb-4 text-2xl font-semibold">HIPAA Compliance</h1>

        <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
          We provide comprehensive privacy and security protections that enable
          you to operate our apps in compliance with regulatory requirements,
          frameworks, and guidelines.{" "}
          <Link
            href="/admin/security/security-guide"
            className="text-blue-600 hover:underline"
          >
            Explore compliance programs
          </Link>
        </p>

        <button
          onClick={() => setShowOverlay(true)}
          className="block w-full cursor-pointer rounded-lg border text-left transition-colors hover:bg-accent/30"
        >
          <div className="border-b px-5 py-3">
            <span className="text-sm text-muted-foreground">Region: US</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 className="mb-1 text-sm font-semibold">
                Health Insurance Portability and Accountability Act (HIPAA)
              </h3>
              <p className="mb-2 max-w-3xl text-sm text-muted-foreground">
                The Health Insurance Portability and Accountability Act of 1996
                (HIPAA) is a US federal law that requires privacy and security
                protections for Protected Health Information (PHI). Sign your
                Business Associate Agreements (BAA), tag apps, and learn how to
                configure your HIPAA eligible apps.
              </p>
              <span className="text-sm text-blue-600 hover:underline">
                How HIPAA works
              </span>
            </div>
            <svg
              className="ml-4 size-5 shrink-0 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </>
  )
}
