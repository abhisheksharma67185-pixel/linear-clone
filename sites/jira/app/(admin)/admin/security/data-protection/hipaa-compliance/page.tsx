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
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <button
          onClick={() => setShowBaaForm(false)}
          className="absolute left-6 top-6 rounded p-1.5 text-muted-foreground hover:bg-accent"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="max-w-xl mx-auto px-8 pt-24 pb-32">
          <h1 className="text-2xl font-bold mb-4">Sign a Business Associate Agreement (BAA)</h1>
          <p className="text-sm text-muted-foreground mb-8">
            The BAA specifies each party&apos;s responsibilities when it comes to safeguarding and using Protected Health Information (PHI). This agreement must be signed before the transfer of any PHI to the business associate. Trial plans are not eligible to sign BAAs.{" "}
            <Link href="/admin/security/security-guide" className="text-blue-600 hover:underline">How to sign a BAA</Link>
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Company legal name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.companyLegalName}
                onChange={(e) => setBaaForm({ ...baaForm, companyLegalName: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Your email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={baaForm.email}
                onChange={(e) => setBaaForm({ ...baaForm, email: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Confirm your email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={baaForm.confirmEmail}
                onChange={(e) => setBaaForm({ ...baaForm, confirmEmail: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Name of signatory <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.signatoryName}
                onChange={(e) => setBaaForm({ ...baaForm, signatoryName: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Title of signatory <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.signatoryTitle}
                onChange={(e) => setBaaForm({ ...baaForm, signatoryTitle: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Email address of signatory <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={baaForm.signatoryEmail}
                onChange={(e) => setBaaForm({ ...baaForm, signatoryEmail: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Confirm email address of signatory <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={baaForm.confirmSignatoryEmail}
                onChange={(e) => setBaaForm({ ...baaForm, confirmSignatoryEmail: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <h2 className="text-xl font-bold pt-4">Organization&apos;s physical address</h2>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.country}
                onChange={(e) => setBaaForm({ ...baaForm, country: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.city}
                onChange={(e) => setBaaForm({ ...baaForm, city: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.address}
                onChange={(e) => setBaaForm({ ...baaForm, address: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.state}
                onChange={(e) => setBaaForm({ ...baaForm, state: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Postal code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={baaForm.postalCode}
                onChange={(e) => setBaaForm({ ...baaForm, postalCode: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-3 border-t bg-background py-4">
          <Button variant="outline" onClick={() => setShowBaaForm(false)}>Cancel</Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
      <div className="p-8 max-w-5xl">
        <button onClick={() => setShowDetail(false)} className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-2">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to Compliance
        </button>
        <h1 className="text-2xl font-semibold mb-8">Health Insurance Portability and Accountability Act (HIPAA)</h1>

        <div className="flex flex-col items-center text-center max-w-lg mx-auto">
          <svg className="size-32 mb-6" viewBox="0 0 120 120" fill="none">
            <rect x="28" y="56" width="52" height="40" rx="6" fill="#2684FF" />
            <path d="M38 56V42a16 16 0 0 1 32 0v14" stroke="#B3D4FF" strokeWidth="6" fill="none" strokeLinecap="round" />
            <circle cx="54" cy="74" r="5" fill="white" />
            <rect x="51.5" y="77" width="5" height="8" rx="2" fill="white" />
            <g transform="translate(72, 58)">
              <circle cx="10" cy="10" r="9" fill="#0065FF" stroke="#B3D4FF" strokeWidth="2" />
              <circle cx="10" cy="10" r="4" fill="#FFC400" />
              <rect x="17" y="8" width="14" height="4" rx="1" fill="#0065FF" />
            </g>
            <circle cx="90" cy="48" r="4" fill="#B3D4FF" />
            <circle cx="98" cy="60" r="3" fill="#B3D4FF" opacity="0.5" />
          </svg>

          <h2 className="text-lg font-semibold mb-2">Tag your apps to enable HIPAA</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Select and tag apps to enable HIPAA.{" "}
            <Link href="/admin/security/security-guide" className="text-blue-600 hover:underline">Explore HIPAA compliance</Link>
          </p>

          <div className="rounded-lg border p-6 w-full text-center">
            <h3 className="text-sm font-semibold mb-2">Before you tag apps</h3>
            <p className="text-sm text-muted-foreground mb-3">
              You need to sign a Business Associate Agreement (BAA) with us. This agreement must be signed before the transfer of any Protected Health Information (PHI) to the business associate.
            </p>
            <Link href="/admin/security/security-guide" className="text-sm text-blue-600 hover:underline inline-block mb-4">How to sign a BAA</Link>
            <div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowBaaForm(true)}>Sign a BAA</Button>
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
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <button onClick={() => setShowOverlay(false)} className="absolute left-6 top-6 rounded p-1.5 text-muted-foreground hover:bg-accent">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          <div className="max-w-2xl mx-auto px-8 pt-24 pb-32">
            <h1 className="text-2xl font-bold mb-6">HIPAA compliance for Atlassian apps</h1>

            <p className="text-sm text-muted-foreground mb-6">
              HIPAA is currently available for Jira, Jira Service Management, and Confluence. It is important to remember that HIPAA compliance is a shared responsibility between Atlassian and you. Simply completing these steps won&apos;t automatically guarantee your compliance with HIPAA.{" "}
              <Link href="/admin/security/security-guide" className="text-blue-600 hover:underline">Explore HIPAA compliance for Atlassian apps</Link>
            </p>

            <h2 className="text-base font-semibold mb-2">Sign a Business Associate Agreement (BAA)</h2>
            <p className="text-sm text-muted-foreground mb-6">
              A BAA is a written contract between a business associate and a covered entity or another business associate. The BAA outlines the terms and conditions to ensure Protected Health Information (PHI) is appropriately safeguarded.{" "}
              <Link href="/admin/security/security-guide" className="text-blue-600 hover:underline">How to sign a BAA</Link>
            </p>

            <h2 className="text-base font-semibold mb-2">Tag your apps to enable HIPAA</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Tagged apps help us identify apps that contain PHI. Only these apps will be protected in accordance with HIPAA requirements.{" "}
              <Link href="/admin/security/security-guide" className="text-blue-600 hover:underline">How to tag apps</Link>
            </p>

            <h2 className="text-base font-semibold mb-2">Follow our HIPAA Implementation Guide</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You must follow the steps outlined in the HIPAA Implementation Guide to manually configure app settings.{" "}
              <Link href="/admin/security/security-guide" className="text-blue-600 hover:underline">Explore the HIPAA implementation guide</Link>
            </p>
          </div>

          <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-3 border-t bg-background py-4">
            <Button variant="outline" onClick={() => setShowOverlay(false)}>Back</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setShowOverlay(false); setShowDetail(true) }}>I understand</Button>
          </div>
        </div>
      )}

      <div className="p-8 max-w-5xl">
        <h1 className="text-2xl font-semibold mb-4">HIPAA Compliance</h1>

        <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
          We provide comprehensive privacy and security protections that enable you to operate our apps in compliance with regulatory requirements, frameworks, and guidelines.{" "}
          <Link href="/admin/security/security-guide" className="text-blue-600 hover:underline">Explore compliance programs</Link>
        </p>

        <button onClick={() => setShowOverlay(true)} className="block w-full rounded-lg border hover:bg-accent/30 cursor-pointer transition-colors text-left">
          <div className="px-5 py-3 border-b">
            <span className="text-sm text-muted-foreground">Region: US</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Health Insurance Portability and Accountability Act (HIPAA)
              </h3>
              <p className="text-sm text-muted-foreground mb-2 max-w-3xl">
                The Health Insurance Portability and Accountability Act of 1996 (HIPAA) is a US federal law that requires privacy and security protections for Protected Health Information (PHI). Sign your Business Associate Agreements (BAA), tag apps, and learn how to configure your HIPAA eligible apps.
              </p>
              <span className="text-sm text-blue-600 hover:underline">How HIPAA works</span>
            </div>
            <svg className="size-5 text-muted-foreground shrink-0 ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </>
  )
}
