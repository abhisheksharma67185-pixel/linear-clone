"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-accent"
      title="Copy"
    >
      {copied ? (
        <svg
          className="size-4 text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

export default function DomainsPage() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(0) // 0=before you begin, 1=add domain, 2=verify
  const [domain, setDomain] = useState("")
  const [verifyTab, setVerifyTab] = useState<
    "dns" | "https" | "google" | "azure"
  >("dns")

  const verificationToken =
    "atlassian-domain-verification=6xODC7e4vHCSHmWiA2R4hM0N1nhvLzj2AaFabBud4ilHGdIrq7wK3"
  const htmlFileName =
    "atlassian-domain-verification-8a4ad557-8b34-42a0-b230-cf68de0bee81.html"
  const domainDisplay = domain || "yourdomain.com"

  if (wizardOpen) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <div className="flex items-center px-6 py-4">
          <button
            onClick={() => {
              setWizardOpen(false)
              setWizardStep(0)
            }}
            className="rounded border p-1.5 text-muted-foreground hover:bg-accent"
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

        {/* Stepper (steps 1 & 2 only) */}
        {wizardStep >= 1 && (
          <>
            <div className="flex items-center justify-center gap-4 py-4">
              <div
                className={`size-2.5 rounded-full ${wizardStep >= 1 ? "bg-blue-600" : "bg-muted-foreground"}`}
              />
              <div
                className={`h-0.5 w-28 ${wizardStep >= 2 ? "bg-blue-600" : "bg-muted"}`}
              />
              <div
                className={`size-2.5 rounded-full ${wizardStep >= 2 ? "bg-blue-600" : "bg-muted-foreground"}`}
              />
            </div>
            <div className="-mt-1 mb-4 flex items-center justify-center gap-20">
              <span
                className={`text-sm ${wizardStep === 1 ? "font-medium text-blue-600" : "text-muted-foreground"}`}
              >
                Add a domain
              </span>
              <span
                className={`text-sm ${wizardStep === 2 ? "font-medium text-blue-600" : "text-muted-foreground"}`}
              >
                Verify your domain
              </span>
            </div>
            <div className="border-t" />
          </>
        )}

        {/* Content */}
        <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-8 py-8">
          {/* Step 0: Before you begin */}
          {wizardStep === 0 && (
            <>
              <h2 className="mt-12 mb-2 text-xl font-semibold">
                Before you begin
              </h2>
              <p className="mb-8 text-sm text-muted-foreground">
                Understand how to verify a domain
              </p>

              <div className="grid grid-cols-3 gap-8">
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Add domain</h3>
                  <p className="text-sm text-muted-foreground">
                    Your company&apos;s domain is everything that comes after
                    the @ symbol in someone&apos;s email address.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Verify domain</h3>
                  <p className="text-sm text-muted-foreground">
                    There&apos;s multiple ways to prove you own the domain. It
                    usually takes a few minutes but can take up to 72 hours.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Claim accounts</h3>
                  <p className="text-sm text-muted-foreground">
                    You have the flexibility to choose how to claim your
                    accounts. Claimed accounts become managed accounts.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Add a domain */}
          {wizardStep === 1 && (
            <>
              <h2 className="mb-2 text-xl font-semibold">Add a domain</h2>
              <p className="mb-1 text-sm text-muted-foreground">
                Enter the domain name
              </p>
              <Input
                placeholder="yourdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="mt-2 max-w-lg"
              />
            </>
          )}

          {/* Step 2: Verify domain */}
          {wizardStep === 2 && (
            <>
              <h2 className="mb-2 text-xl font-semibold">Verify domain</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                To verify ownership of this domain, use one of the following
                methods.{" "}
                <button type="button" className="text-blue-600 hover:underline">
                  Learn about domain verification
                </button>
              </p>

              {/* Verification method tabs */}
              <div className="mb-6 flex gap-6 border-b">
                {(["dns", "https", "google", "azure"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setVerifyTab(tab)}
                    className={`pb-2.5 text-sm font-medium transition-colors ${
                      verifyTab === tab
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "dns"
                      ? "DNS"
                      : tab === "https"
                        ? "HTTPS"
                        : tab === "google"
                          ? "Google Workspace"
                          : "Azure AD sync"}
                  </button>
                ))}
              </div>

              {/* DNS tab */}
              {verifyTab === "dns" && (
                <>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Choose this method if you can edit your domain&apos;s DNS
                    records.
                  </p>

                  <p className="mb-2 text-sm">
                    <strong>1.</strong> Create a new TXT record
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Copy the information from all fields (e.g., Name, host or
                    alias) and add it to your domain host&apos;s DNS settings
                    for {domainDisplay}.
                  </p>

                  <div className="mb-4">
                    <label className="mb-1 block text-sm text-muted-foreground">
                      Name, host or alias
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value="@"
                        readOnly
                        className="max-w-lg bg-muted/30"
                      />
                      <CopyButton value="@" />
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">
                        Time to live (TTL)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input value="86400" readOnly className="bg-muted/30" />
                        <CopyButton value="86400" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-muted-foreground">
                        Record type
                      </label>
                      <div className="flex items-center gap-2">
                        <Input value="TXT" readOnly className="bg-muted/30" />
                        <CopyButton value="TXT" />
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="mb-1 block text-sm text-muted-foreground">
                      Record or data
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={verificationToken}
                        readOnly
                        className="bg-muted/30"
                      />
                      <CopyButton value={verificationToken} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      You can use the same record for multiple domains.
                    </p>
                  </div>

                  <p className="mt-6 mb-2 text-sm">
                    <strong>2.</strong> Verify the TXT record
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    After you add the TXT record, you can verify the domain.
                  </p>

                  <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800 dark:bg-yellow-950/20">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-yellow-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                    </svg>
                    <p className="text-sm">
                      Remember to keep the <strong>DNS record</strong> on your
                      server (don&apos;t delete it). We need to verify it
                      regularly.
                    </p>
                  </div>
                </>
              )}

              {/* HTTPS tab */}
              {verifyTab === "https" && (
                <>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Choose this method if you can upload files to the root
                    directory of your domain&apos;s webserver. You need an SSL
                    certificate to use this method.
                  </p>

                  <p className="mb-2 text-sm">
                    <strong>1.</strong> Download the file
                  </p>
                  <div className="mb-1">
                    <label className="mb-1 block text-sm text-muted-foreground">
                      HTML file
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={htmlFileName}
                        readOnly
                        className="max-w-lg bg-muted/30"
                      />
                      <button
                        className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-accent"
                        title="Download"
                      >
                        <svg
                          className="size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This file is unique to this organization. We verify the
                      domain with the information in the file.
                    </p>
                  </div>

                  <p className="mt-6 mb-2 text-sm">
                    <strong>2.</strong> Upload file to {domainDisplay}
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Go to your server and upload the file to the root folder of
                    your domain&apos;s website.
                  </p>

                  <p className="mb-2 text-sm">
                    <strong>3.</strong> Confirm file upload
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Visit{" "}
                    <strong>
                      {domainDisplay}/{htmlFileName}
                    </strong>{" "}
                    in your browser to confirm you uploaded the file.
                  </p>

                  <p className="mb-2 text-sm">
                    <strong>4.</strong> Verify the domain
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    After you confirm file upload, you can verify the domain.
                  </p>

                  <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800 dark:bg-yellow-950/20">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-yellow-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                    </svg>
                    <p className="text-sm">
                      Remember to keep the <strong>HTML file</strong> on your
                      server (don&apos;t delete it). We need to verify it
                      regularly.
                    </p>
                  </div>
                </>
              )}

              {/* Google Workspace tab */}
              {verifyTab === "google" && (
                <p className="text-sm text-muted-foreground">
                  To verify your domains and import users from Google Workspace,
                  connect your Google Workspace account.{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                  >
                    Learn more about Google Workspace
                  </button>
                </p>
              )}

              {/* Azure AD sync tab */}
              {verifyTab === "azure" && (
                <p className="text-sm text-muted-foreground">
                  To verify your domains and import users from Azure AD, connect
                  your Azure AD account.{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                  >
                    Learn more about Azure AD sync
                  </button>
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-8 py-4">
          {wizardStep === 0 && (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setWizardOpen(false)
                  setWizardStep(0)
                }}
              >
                Do this later
              </Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setWizardStep(1)}
              >
                Next
              </Button>
            </>
          )}
          {wizardStep === 1 && (
            <>
              <Button variant="ghost" onClick={() => setWizardStep(0)}>
                Back
              </Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setWizardStep(2)}
              >
                Next
              </Button>
            </>
          )}
          {wizardStep === 2 && (
            <>
              <Button variant="ghost" onClick={() => setWizardStep(1)}>
                Back
              </Button>
              {verifyTab === "google" || verifyTab === "azure" ? (
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Go to Identity providers
                </Button>
              ) : (
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Verify domain
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Domains</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {/* Lock illustration */}
        <div className="relative mb-6">
          <svg className="size-28" viewBox="0 0 120 120" fill="none">
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
                fill="#FFC400"
                stroke="#FF991F"
                strokeWidth="1.5"
              />
              <circle cx="10" cy="10" r="4" fill="#FF991F" />
            </g>
            <circle cx="90" cy="48" r="4" fill="#B3D4FF" />
            <circle cx="98" cy="60" r="3" fill="#B3D4FF" opacity="0.5" />
          </svg>
        </div>

        <h2 className="mb-3 text-xl font-semibold">
          Level up your organization&apos;s security
        </h2>
        <p className="mb-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          You need to verify that you own your company&apos;s domain before you
          can claim and manage your users&apos; Atlassian accounts.
        </p>
        <p className="mb-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Managed accounts are more secure. When you manage accounts, you can
          apply authentication policies, update account details, reset
          passwords, and even log everyone out if necessary.
        </p>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setWizardOpen(true)}
        >
          Verify your company domain
        </Button>
      </div>
    </div>
  )
}
