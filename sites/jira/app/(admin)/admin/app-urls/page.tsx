"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

// ── Update URL Dialog ──────────────────────────────────────────────
function UpdateURLDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [siteUrl, setSiteUrl] = useState("abhisheksharma67185")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Update URL
          </DialogTitle>
        </DialogHeader>

        {/* Warning banner */}
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
          <div className="flex gap-2">
            <svg
              className="mt-0.5 size-5 shrink-0 text-amber-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Review and evaluate your Marketplace apps
              </p>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                Apps connected to your site may stop working when the site URL
                changes. If you have any installed Marketplace apps,{" "}
                <button className="text-blue-600 hover:underline">
                  learn more about our recommendations.
                </button>
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-1.5">
            Site URL <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center">
            <Input
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="rounded-r-none border-r-0"
            />
            <span className="flex h-9 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
              .atlassian.net
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            You can change this site&apos;s URL <strong>15 more times.</strong>
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground"
            disabled={!siteUrl.trim()}
            onClick={() => onOpenChange(false)}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Specify Domain Step ────────────────────────────────────────────
const subdomainRegex = /^[a-zA-Z0-9-]*$/
const domainRegex = /^[a-zA-Z0-9.-]*$/

function SpecifyDomainStep({
  subdomain1,
  setSubdomain1,
  subdomain2,
  setSubdomain2,
  domain,
  setDomain,
  redirectOpen,
  setRedirectOpen,
  redirectUrl,
  setRedirectUrl,
}: {
  subdomain1: string
  setSubdomain1: (v: string) => void
  subdomain2: string
  setSubdomain2: (v: string) => void
  domain: string
  setDomain: (v: string) => void
  redirectOpen: boolean
  setRedirectOpen: (v: boolean) => void
  redirectUrl: string
  setRedirectUrl: (v: string) => void
}) {
  const sub1Error = subdomain1 && !subdomainRegex.test(subdomain1)
  const sub2Error = subdomain2 && !subdomainRegex.test(subdomain2)
  const domainError = domain && !domainRegex.test(domain)

  const previewUrl = [subdomain1, subdomain2, domain].filter(Boolean).join(".")

  return (
    <div>
      <h2 className="mb-3 text-2xl font-semibold">Specify your domain</h2>
      <p className="mb-1 text-sm text-muted-foreground">
        Domains must follow the format of <em>subdomain1.subdomain2.domain</em>.
        Both subdomains are required for security purposes.
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        All fields are required
      </p>

      <p className="mb-4 text-sm font-semibold">Custom domain</p>

      {/* Subdomain 1 */}
      <div className="mb-4">
        <Label className="mb-1.5">
          Subdomain 1 <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="internal"
          value={subdomain1}
          onChange={(e) => setSubdomain1(e.target.value)}
          className={
            sub1Error
              ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30"
              : ""
          }
        />
        {sub1Error && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0V5zm.75 6.25a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
            Subdomain can only include letters, numbers, or hyphens
          </p>
        )}
      </div>

      {/* Subdomain 2 */}
      <div className="mb-4">
        <Label className="mb-1.5">
          Subdomain 2 <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="jira"
          value={subdomain2}
          onChange={(e) => setSubdomain2(e.target.value)}
          className={
            sub2Error
              ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30"
              : ""
          }
        />
        {sub2Error && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0V5zm.75 6.25a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
            Subdomain can only include letters, numbers, or hyphens
          </p>
        )}
      </div>

      {/* Domain */}
      <div className="mb-6">
        <Label className="mb-1.5">
          Domain <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="acme.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className={
            domainError
              ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30"
              : ""
          }
        />
        {domainError && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0V5zm.75 6.25a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
            Domain can only include letters, numbers, hyphens, or dots
          </p>
        )}
      </div>

      {/* Preview */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold">Preview</p>
        <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          <svg
            className="size-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          https:// {previewUrl || "subdomain1.subdomain2.domain"}
        </div>
      </div>

      <div className="border-t pt-6">
        <p className="mb-2 text-sm font-semibold">Redirect URL</p>

        {!redirectOpen ? (
          <button
            onClick={() => setRedirectOpen(true)}
            className="flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-blue-600"
          >
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Add an optional redirect
          </button>
        ) : (
          <div>
            <button
              onClick={() => setRedirectOpen(false)}
              className="mb-3 flex items-center gap-1.5 text-sm text-foreground"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              Add an optional redirect
            </button>
            <p className="mb-4 text-sm text-muted-foreground">
              Make your custom domain easier to remember with a simpler redirect
              URL. When someone uses this URL they&apos;ll be redirected to the
              custom domain.
            </p>
            <div>
              <Label className="mb-1.5">Redirect URL (optional)</Label>
              <Input
                placeholder="help.acme.com"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Add Custom Domain Wizard ───────────────────────────────────────
const wizardSteps = [
  { id: "before", label: "Before you begin" },
  { id: "select-app", label: "Select app" },
  { id: "specify-domain", label: "Specify domain" },
  { id: "review", label: "Review" },
]

function AddCustomDomainWizard({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [appDropdownOpen, setAppDropdownOpen] = useState(false)
  const [appSearch, setAppSearch] = useState("")
  const [subdomain1, setSubdomain1] = useState("")
  const [subdomain2, setSubdomain2] = useState("")
  const [domain, setDomain] = useState("")
  const [redirectOpen, setRedirectOpen] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState("")

  if (!open) return null

  const currentStepId = wizardSteps[currentStep].id

  function handleNext() {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  function handleClose() {
    setCurrentStep(0)
    setSelectedApp(null)
    setAppDropdownOpen(false)
    setAppSearch("")
    setSubdomain1("")
    setSubdomain2("")
    setDomain("")
    setRedirectOpen(false)
    setRedirectUrl("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <button
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground"
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
        <div />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 px-8 py-6">
        {wizardSteps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center">
                {i > 0 && (
                  <div
                    className={`h-0.5 w-24 ${i <= currentStep ? "bg-blue-600" : "bg-muted-foreground/30"}`}
                  />
                )}
                <div
                  className={`size-2.5 rounded-full ${i <= currentStep ? "bg-blue-600" : "bg-muted-foreground/40"}`}
                />
                {i < wizardSteps.length - 1 && i === wizardSteps.length - 1
                  ? null
                  : null}
              </div>
              <span
                className={`text-sm whitespace-nowrap ${i === currentStep ? "font-medium text-blue-600" : i < currentStep ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-8 py-8">
          {/* Step 1: Before you begin */}
          {currentStepId === "before" && (
            <div>
              <h2 className="mb-3 text-2xl font-semibold">
                Before you add a custom domain
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                There are some things you need to know.{" "}
                <button className="text-blue-600 hover:underline">
                  Learn more about custom domains
                </button>
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-1 text-base font-semibold">DNS access</h3>
                  <p className="text-sm text-muted-foreground">
                    To verify that you own the domain, you&apos;ll need to add
                    the CNAME records we generate to your DNS provider.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-base font-semibold">
                    Security constraints
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Custom domains must also follow a specific format, but
                    you&apos;ll have the option to add a redirect if desired.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-base font-semibold">
                    Certificate requirements
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We require a unique SSL certificate for every custom domain.
                    You can&apos;t bring your own certificate.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-base font-semibold">Limitations</h3>
                  <p className="text-sm text-muted-foreground">
                    You can only add a custom domain for Jira or Confluence
                    apps.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select app */}
          {currentStepId === "select-app" && (
            <div>
              <h2 className="mb-3 text-2xl font-semibold">Select an app</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                You can create a custom domain for apps that aren&apos;t already
                associated with another custom domain.{" "}
                <button className="text-blue-600 hover:underline">
                  Tell me more about custom domains
                </button>
              </p>

              <div>
                <p className="mb-2 text-sm font-medium">App</p>
                <div className="relative inline-block">
                  <button
                    onClick={() => setAppDropdownOpen(!appDropdownOpen)}
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${appDropdownOpen ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
                  >
                    {selectedApp || "Select an app"}
                    <svg
                      className="size-3.5"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </button>
                  {appDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setAppDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border bg-background shadow-lg">
                        {/* Search */}
                        <div className="border-b p-2">
                          <div className="relative">
                            <Input
                              placeholder="Search"
                              value={appSearch}
                              onChange={(e) => setAppSearch(e.target.value)}
                              className="h-8 pr-8 text-sm"
                            />
                            <svg
                              className="absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                          </div>
                        </div>
                        {/* App list */}
                        {[{ name: "Jira", site: "abhisheksharma67185" }]
                          .filter(
                            (a) =>
                              !appSearch ||
                              a.name
                                .toLowerCase()
                                .includes(appSearch.toLowerCase())
                          )
                          .map((app) => (
                            <button
                              key={app.name}
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
                              onClick={() => {
                                setSelectedApp(app.name)
                                setAppDropdownOpen(false)
                              }}
                            >
                              <Checkbox checked={selectedApp === app.name} />
                              <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                                <svg
                                  className="size-4"
                                  viewBox="0 0 32 32"
                                  fill="white"
                                >
                                  <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {app.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {app.site}
                                </p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Specify domain */}
          {currentStepId === "specify-domain" && (
            <SpecifyDomainStep
              subdomain1={subdomain1}
              setSubdomain1={setSubdomain1}
              subdomain2={subdomain2}
              setSubdomain2={setSubdomain2}
              domain={domain}
              setDomain={setDomain}
              redirectOpen={redirectOpen}
              setRedirectOpen={setRedirectOpen}
              redirectUrl={redirectUrl}
              setRedirectUrl={setRedirectUrl}
            />
          )}

          {/* Step 4: Review */}
          {currentStepId === "review" && (
            <div>
              <h2 className="mb-3 text-2xl font-semibold">Review</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Review your custom domain configuration before proceeding.
              </p>

              <div className="space-y-3 rounded-md border p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">App</span>
                  <span className="font-medium">{selectedApp || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custom domain</span>
                  <span className="font-medium">
                    {subdomain1 && subdomain2 && domain
                      ? `${subdomain1}.${subdomain2}.${domain}`
                      : "—"}
                  </span>
                </div>
                {redirectUrl && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Redirect URL</span>
                    <span className="font-medium">{redirectUrl}</span>
                  </div>
                )}
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                After you confirm, you&apos;ll need to add the CNAME records we
                provide to your DNS provider to verify domain ownership.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-end gap-2 border-t px-8 py-4">
        {currentStep === 0 && (
          <>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleNext}
            >
              Next
            </Button>
          </>
        )}
        {currentStep === 1 && (
          <>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                if (selectedApp) handleNext()
                else handleNext() // Skip allows moving forward without selection
              }}
            >
              Skip
            </Button>
          </>
        )}
        {currentStep === 2 && (
          <>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              disabled={
                !subdomain1.trim() || !subdomain2.trim() || !domain.trim()
              }
              onClick={handleNext}
            >
              Next
            </Button>
          </>
        )}
        {currentStep === 3 && (
          <>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleClose}
            >
              Confirm
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AppURLsPage() {
  const [activeTab, setActiveTab] = useState("default")
  const [updateUrlOpen, setUpdateUrlOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<"yes" | "no" | null>(null)

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">App URLs</h1>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setWizardOpen(true)}
        >
          Add custom domain
        </Button>
      </div>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        App URLs are used to access individual instances of an app. You can
        update the subdomain in the default URL (up to 3 times), or specify your
        own domain.{" "}
        <button className="text-blue-600 hover:underline">
          Tell me more about app URLs
        </button>
      </p>

      <div className="mb-4 flex gap-4 border-b">
        {[
          { id: "default", label: "Default URLs" },
          { id: "custom", label: "Custom domains" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Default URLs tab */}
      {activeTab === "default" && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Sites and apps</TableHead>
                <TableHead className="w-[100px] font-medium">Plan</TableHead>
                <TableHead className="font-medium">URL</TableHead>
                <TableHead className="w-[120px] font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                      <svg
                        className="size-4 text-white"
                        viewBox="0 0 32 32"
                        fill="white"
                      >
                        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">abhisheksharma67185</p>
                      <p className="text-xs text-muted-foreground">Site</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell />
                <TableCell>
                  <button className="text-sm text-blue-600 hover:underline">
                    abhisheksharma67185.atlassian.net
                  </button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpdateUrlOpen(true)}
                  >
                    Update URL
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3 pl-8">
                    <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                      <svg
                        className="size-4 text-white"
                        viewBox="0 0 32 32"
                        fill="white"
                      >
                        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                      </svg>
                    </div>
                    <span className="text-sm">Jira</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">Premium</TableCell>
                <TableCell>
                  <button className="text-sm text-blue-600 hover:underline">
                    abhisheksharma67185.atlassian.net/jira
                  </button>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Custom domains tab */}
      {activeTab === "custom" && (
        <div className="mx-auto max-w-lg py-16 text-center">
          <h2 className="mb-3 text-xl font-semibold">
            Promote your company with branded URLs
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Provide branded, easy-to-remember URLs for your users to access your
            Atlassian apps. You&apos;ll need to update your DNS records to
            verify you own the domain.{" "}
            <button className="text-blue-600 hover:underline">
              Tell me more about custom domains
            </button>
          </p>

          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold">
              Is this feature useful to you?
            </span>
            <Button
              variant="outline"
              size="sm"
              className={
                feedbackGiven === "yes" ? "border-blue-600 text-blue-600" : ""
              }
              onClick={() => setFeedbackGiven("yes")}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={
                feedbackGiven === "no" ? "border-blue-600 text-blue-600" : ""
              }
              onClick={() => setFeedbackGiven("no")}
            >
              No
            </Button>
            <button className="ml-2 text-sm text-blue-600 hover:underline">
              Give feedback or make a suggestion
            </button>
          </div>
          {feedbackGiven && (
            <p className="mt-3 text-sm text-muted-foreground">
              Thanks for your feedback!
            </p>
          )}
        </div>
      )}

      {/* Update URL dialog */}
      <UpdateURLDialog open={updateUrlOpen} onOpenChange={setUpdateUrlOpen} />

      {/* Add custom domain wizard */}
      <AddCustomDomainWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  )
}
