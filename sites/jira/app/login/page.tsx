"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const router = useRouter()

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    // Simulate login — just redirect to the welcome page
    router.push("/")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50 to-blue-100" />

      {/* Bottom illustrations - left */}
      <div className="absolute bottom-0 left-0 h-[320px] w-[300px]">
        <svg viewBox="0 0 300 320" fill="none" className="h-full w-full">
          <rect x="80" y="180" width="60" height="100" rx="4" fill="#FFB74D" />
          <circle cx="110" cy="160" r="20" fill="#FFB74D" />
          <rect x="140" y="200" width="40" height="60" rx="4" fill="#E3F2FD" />
          <rect x="160" y="200" width="50" height="90" rx="4" fill="#1868DB" />
          <circle cx="185" cy="180" r="18" fill="#1868DB" />
          <rect
            x="30"
            y="100"
            width="80"
            height="100"
            rx="6"
            fill="white"
            stroke="#E0E0E0"
            strokeWidth="2"
          />
          <rect x="42" y="120" width="12" height="40" fill="#42A5F5" />
          <rect x="60" y="130" width="12" height="30" fill="#66BB6A" />
          <rect x="78" y="110" width="12" height="50" fill="#FFA726" />
        </svg>
      </div>

      {/* Bottom illustrations - right */}
      <div className="absolute right-0 bottom-0 h-[320px] w-[300px]">
        <svg viewBox="0 0 300 320" fill="none" className="h-full w-full">
          <circle
            cx="220"
            cy="120"
            r="40"
            stroke="#1868DB"
            strokeWidth="6"
            fill="none"
          />
          <line
            x1="248"
            y1="148"
            x2="270"
            y2="170"
            stroke="#FF7043"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect
            x="100"
            y="160"
            width="70"
            height="90"
            rx="6"
            fill="white"
            stroke="#E0E0E0"
            strokeWidth="2"
          />
          <rect x="110" y="175" width="40" height="4" rx="2" fill="#90CAF9" />
          <rect x="110" y="185" width="50" height="4" rx="2" fill="#E0E0E0" />
          <rect x="110" y="195" width="35" height="4" rx="2" fill="#E0E0E0" />
          <rect x="180" y="200" width="50" height="90" rx="4" fill="#1868DB" />
          <circle cx="205" cy="180" r="18" fill="#1868DB" />
          <line
            x1="230"
            y1="170"
            x2="250"
            y2="140"
            stroke="#FFA726"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-[400px] rounded-lg bg-white px-10 py-10 shadow-[0_0_10px_rgba(0,0,0,0.1)]">
        {/* Atlassian logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <svg className="h-7 w-7" viewBox="0 0 32 32" fill="#1868DB">
            <path
              d="M10.543 18.17a.86.86 0 0 0-1.478.147L4.076 28.204A.86.86 0 0 0 4.85 29.5h7.956a.86.86 0 0 0 .774-.491c1.806-3.763.62-8.928-3.037-10.839z"
              opacity="0.7"
            />
            <path d="M15.593 3.09a14.58 14.58 0 0 0-.98 14.79l4.56 9.13a.86.86 0 0 0 1.538 0l5.213-10.42a.86.86 0 0 0 0-.77L18.67 3.09a1.63 1.63 0 0 0-3.076 0z" />
          </svg>
          <span className="text-xl font-bold tracking-wide text-[#1868DB]">
            ATLASSIAN
          </span>
        </div>

        {/* Heading */}
        <h1 className="mb-6 text-center text-base font-semibold text-slate-800">
          Log in to continue
        </h1>

        {/* Email form */}
        <form onSubmit={handleContinue}>
          <div className="mb-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[3px] border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-500 focus:border-[#0052CC] focus:bg-white"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-[3px] bg-[#0052CC] py-2.5 text-sm font-medium text-white hover:bg-[#0747A6]"
          >
            Continue
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs text-slate-500">OR</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* SSO buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2 rounded-[3px] border-slate-200 text-sm font-medium text-slate-800 hover:bg-slate-50"
            onClick={() => router.push("/")}
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2 rounded-[3px] border-slate-200 text-sm font-medium text-slate-800 hover:bg-slate-50"
            onClick={() => router.push("/")}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Microsoft
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2 rounded-[3px] border-slate-200 text-sm font-medium text-slate-800 hover:bg-slate-50"
            onClick={() => router.push("/")}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
            </svg>
            Continue with Apple
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2 rounded-[3px] border-slate-200 text-sm font-medium text-slate-800 hover:bg-slate-50"
            onClick={() => router.push("/")}
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Continue with Slack
          </Button>
        </div>

        {/* Can't log in link */}
        <div className="mt-6 text-center">
          <Link
            href="/switch-account"
            className="text-sm text-[#0052CC] hover:underline"
          >
            Can&apos;t log in? Create an account
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 32 32" fill="#B3BAC5">
                <path
                  d="M10.543 18.17a.86.86 0 0 0-1.478.147L4.076 28.204A.86.86 0 0 0 4.85 29.5h7.956a.86.86 0 0 0 .774-.491c1.806-3.763.62-8.928-3.037-10.839z"
                  opacity="0.7"
                />
                <path d="M15.593 3.09a14.58 14.58 0 0 0-.98 14.79l4.56 9.13a.86.86 0 0 0 1.538 0l5.213-10.42a.86.86 0 0 0 0-.77L18.67 3.09a1.63 1.63 0 0 0-3.076 0z" />
              </svg>
              <span className="text-xs font-bold tracking-wide text-slate-400">
                ATLASSIAN
              </span>
            </div>
            <p className="text-xs text-slate-500">
              One account for Jira, Confluence, Trello and{" "}
              <Link href="/products" className="text-[#0052CC] hover:underline">
                more
                <span className="ml-0.5 inline-block text-[10px]">↗</span>
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
