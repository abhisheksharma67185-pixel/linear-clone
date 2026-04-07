"use client"

export default function HipaaCompliancePage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">HIPAA Compliance</h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        We provide comprehensive privacy and security protections that enable you to operate our apps in compliance with regulatory requirements, frameworks, and guidelines.{" "}
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Explore compliance programs</a>
      </p>

      {/* HIPAA card */}
      <div className="rounded-lg border hover:bg-accent/30 cursor-pointer transition-colors">
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
            <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline">How HIPAA works</a>
          </div>
          <svg className="size-5 text-muted-foreground shrink-0 ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
