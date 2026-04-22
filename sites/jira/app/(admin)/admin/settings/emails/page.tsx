"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function EmailsPage() {
  const [addDomainOpen, setAddDomainOpen] = useState(false)
  const [domain, setDomain] = useState("")
  const [step, setStep] = useState<"enter" | "verify" | "done">("enter")

  const handleClose = () => {
    setAddDomainOpen(false)
    setTimeout(() => {
      setDomain("")
      setStep("enter")
    }, 200)
  }

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Emails</h1>

      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        {/* Globe illustration */}
        <div className="relative mb-6">
          <svg
            className="size-28 text-muted-foreground/20"
            viewBox="0 0 120 120"
            fill="none"
          >
            <circle
              cx="55"
              cy="65"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
            />
            <ellipse
              cx="55"
              cy="65"
              rx="20"
              ry="45"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="10"
              y1="50"
              x2="100"
              y2="50"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="10"
              y1="80"
              x2="100"
              y2="80"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="55"
              y1="20"
              x2="55"
              y2="110"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="55" cy="65" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="30" cy="45" r="2" fill="currentColor" opacity="0.3" />
            <circle cx="75" cy="85" r="2" fill="currentColor" opacity="0.3" />
          </svg>
          <div className="absolute -top-1 -right-1 flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <svg
              className="size-5 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>

        <h2 className="mb-3 text-lg font-semibold">
          Deliver secure emails from your domain
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Improve delivery rates and security by personalizing notifications
          from your apps. To start, verify your domain and add email addresses
          for project admins to use.{" "}
          <a
            href="https://support.atlassian.com/organization-administration/docs/explore-emails/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Explore emails
          </a>
        </p>

        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setAddDomainOpen(true)}
        >
          Add domain
        </Button>
      </div>

      {/* Add domain dialog */}
      <Dialog
        open={addDomainOpen}
        onOpenChange={(open) => {
          if (!open) handleClose()
        }}
      >
        <DialogContent className="sm:max-w-md">
          {step === "enter" && (
            <>
              <DialogHeader>
                <DialogTitle>Add domain</DialogTitle>
                <DialogDescription>
                  Enter the domain you want to verify for sending emails.
                  You&apos;ll need access to your domain&apos;s DNS settings to
                  complete verification.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium" htmlFor="domain-input">
                  Domain name
                </label>
                <Input
                  id="domain-input"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!domain.trim() || !domain.includes(".")}
                  onClick={() => setStep("verify")}
                >
                  Next
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "verify" && (
            <>
              <DialogHeader>
                <DialogTitle>Verify domain</DialogTitle>
                <DialogDescription>
                  Add the following DNS record to verify ownership of{" "}
                  <strong>{domain}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-mono">TXT</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Host</span>
                  <span className="font-mono">
                    _atlassian-domain-verification
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Value</span>
                  <span className="max-w-[200px] truncate text-right font-mono">
                    abcdef1234567890
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                DNS changes can take up to 72 hours to propagate. You can close
                this dialog and check the verification status later.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStep("enter")}>
                  Back
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setStep("done")}
                >
                  Verify domain
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "done" && (
            <>
              <DialogHeader>
                <DialogTitle>Domain verification pending</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <svg
                    className="size-6 text-yellow-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Verification in progress</p>
                <p className="text-center text-xs text-muted-foreground">
                  We&apos;re checking the DNS records for{" "}
                  <strong>{domain}</strong>. This can take up to 72 hours.
                  We&apos;ll notify you once verification is complete.
                </p>
              </div>
              <DialogFooter>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleClose}
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
