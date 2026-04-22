"use client"

import Link from "next/link"

export default function ManagedAccountsPage() {
  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-semibold">Managed accounts</h1>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        {/* ID card illustration */}
        <svg className="mb-6 size-28" viewBox="0 0 120 120" fill="none">
          <rect
            x="20"
            y="25"
            width="80"
            height="60"
            rx="6"
            fill="#DBEAFE"
            stroke="#93C5FD"
            strokeWidth="1"
          />
          <rect x="20" y="25" width="80" height="18" rx="6" fill="#3B82F6" />
          <rect x="20" y="37" width="80" height="6" fill="#3B82F6" />
          <circle cx="45" cy="58" r="10" fill="#F59E0B" />
          <circle cx="45" cy="55" r="5" fill="#FBBF24" />
          <path d="M35 68a10 10 0 0 1 20 0" fill="#F59E0B" />
          <rect x="62" y="52" width="30" height="4" rx="2" fill="#93C5FD" />
          <rect x="62" y="60" width="24" height="4" rx="2" fill="#93C5FD" />
          <rect x="62" y="68" width="20" height="4" rx="2" fill="#93C5FD" />
        </svg>

        <h2 className="mb-3 text-xl font-semibold">
          Managed accounts are more secure
        </h2>
        <p className="mb-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          When you manage accounts, you can apply authentication policies,
          update account details, reset passwords, and even log everyone out if
          necessary.
        </p>
        <p className="mb-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Before you can manage accounts, you need to verify the domain to take
          ownership of the accounts. Once that&apos;s done, if someone has an
          email address that matches your domain, you can claim and manage their
          account.
        </p>
        <Link
          href="/admin/domains"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          View domains
        </Link>
      </div>
    </div>
  )
}
