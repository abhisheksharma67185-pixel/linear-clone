"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function UserDropdown() {
  const router = useRouter()

  const menuItems = [
    { label: "Switch Account", href: "/switch-account" },
    { label: "Profile", href: "/home/profile" },
    { label: "Licenses", href: "/admin/billing" },
    { label: "Log out", href: "/login" },
  ]

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-2.5 rounded-full px-1 py-0.5 transition-colors">
        <Avatar className="size-8 border-2 border-[#0052CC]">
          <AvatarFallback className="bg-[#0052CC] text-xs font-medium text-white">
            AS
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-[#0052CC]">
          Abhishek Sharma
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-[280px] p-0"
      >
        <div className="border-b px-4 py-3">
          <p className="truncate text-sm font-bold text-slate-800">
            ABHISHEKSHARMA67185@GMAIL.COM
          </p>
        </div>
        <div className="py-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="w-full px-4 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-accent"
            >
              {item.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function WelcomeHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="flex h-14 items-center justify-between border-b border-border/10 bg-white px-6">
        <div className="flex items-center gap-5">
          {/* Atlassian logo mark */}
          <Link href="/" className="flex items-center">
            <div className="flex size-8 items-center justify-center rounded bg-[#1868db]">
              <svg
                className="size-5 text-white"
                viewBox="0 0 32 32"
                fill="currentColor"
              >
                <path
                  d="M10.543 18.17a.86.86 0 0 0-1.478.147L4.076 28.204A.86.86 0 0 0 4.85 29.5h7.956a.86.86 0 0 0 .774-.491c1.806-3.763.62-8.928-3.037-10.839z"
                  opacity="0.7"
                />
                <path d="M15.593 3.09a14.58 14.58 0 0 0-.98 14.79l4.56 9.13a.86.86 0 0 0 1.538 0l5.213-10.42a.86.86 0 0 0 0-.77L18.67 3.09a1.63 1.63 0 0 0-3.076 0z" />
              </svg>
            </div>
          </Link>

          {/* Jira logo */}
          <Link href="/home" className="flex items-center gap-2">
            <svg className="size-6" viewBox="0 0 32 32" fill="#2684FF">
              <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
            </svg>
            <span className="text-lg font-semibold text-slate-800">Jira</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="rounded-sm bg-[#0052CC] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0747A6]"
          >
            Go to Jira
          </Link>
          <UserDropdown />
        </div>
      </div>

      {/* Introducing agents banner */}
      <div className="flex items-center justify-center gap-2 border-b border-blue-200 bg-blue-50 px-6 py-2.5 text-sm">
        <span className="text-base">👋</span>
        <span className="text-slate-800">Introducing agents in Jira</span>
        <Link
          href="/products"
          className="font-medium text-[#0052CC] hover:underline"
        >
          Learn more
        </Link>
      </div>
    </header>
  )
}
