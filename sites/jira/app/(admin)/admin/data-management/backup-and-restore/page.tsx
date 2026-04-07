"use client"

import { Button } from "@/components/ui/button"

export default function BackupAndRestorePage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">Backup and restore</h1>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto">
        {/* Safe/vault illustration */}
        <div className="relative mb-6">
          <svg className="w-36 h-36" viewBox="0 0 144 144" fill="none">
            {/* Safe body */}
            <rect x="24" y="24" width="80" height="88" rx="6" fill="#2684FF" />
            {/* Safe top */}
            <rect x="20" y="20" width="88" height="12" rx="3" fill="#4C9AFF" />
            {/* Safe door */}
            <rect x="32" y="40" width="64" height="60" rx="4" fill="#0052CC" />
            {/* Dial circle */}
            <circle cx="58" cy="68" r="18" fill="#FFC400" stroke="#FF991F" strokeWidth="2" />
            {/* Dial center */}
            <circle cx="58" cy="68" r="4" fill="#FF991F" />
            {/* Dial marks */}
            <line x1="58" y1="52" x2="58" y2="56" stroke="#FF991F" strokeWidth="2" />
            <line x1="58" y1="80" x2="58" y2="84" stroke="#FF991F" strokeWidth="2" />
            <line x1="42" y1="68" x2="46" y2="68" stroke="#FF991F" strokeWidth="2" />
            <line x1="70" y1="68" x2="74" y2="68" stroke="#FF991F" strokeWidth="2" />
            {/* Dial pointer */}
            <line x1="58" y1="68" x2="58" y2="55" stroke="#FF991F" strokeWidth="3" strokeLinecap="round" />
            <line x1="58" y1="68" x2="68" y2="74" stroke="#FF991F" strokeWidth="3" strokeLinecap="round" />
            {/* Handle */}
            <rect x="82" y="62" width="8" height="12" rx="2" fill="#FFC400" />
            {/* Legs */}
            <rect x="30" y="108" width="8" height="12" rx="2" fill="#0052CC" />
            <rect x="90" y="108" width="8" height="12" rx="2" fill="#0052CC" />
            {/* Red accent */}
            <rect x="100" y="60" width="12" height="16" rx="3" fill="#DE350B" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold mb-3">
          Backup up your Jira and Confluence data
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          Easily recover your data in case of accidental or malicious deletion.
          Start by creating a backup policy.
        </p>

        <div className="flex items-center gap-4 mb-6">
          <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-muted-foreground hover:text-foreground">
            Explore benefits
          </a>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Contact sales
          </Button>
        </div>

        {/* Features list */}
        <div className="rounded-lg border p-5 w-full text-left">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <svg className="size-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="text-sm">Automate backups daily, weekly, or on demand</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <svg className="size-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm">Restore data within 30 days using Atlassian storage</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <svg className="size-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <span className="text-sm">Get reliable protection with full site recovery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
