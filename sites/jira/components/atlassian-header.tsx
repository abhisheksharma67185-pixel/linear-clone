import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function AtlassianHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#dfe1e6] bg-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-8">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <svg className="h-6 w-6" viewBox="0 0 32 32" fill="#2684FF">
              <path
                d="M10.543 18.17a.86.86 0 0 0-1.478.147L4.076 28.204A.86.86 0 0 0 4.85 29.5h7.956a.86.86 0 0 0 .774-.491c1.806-3.763.62-8.928-3.037-10.839z"
                opacity="0.7"
              />
              <path d="M15.593 3.09a14.58 14.58 0 0 0-.98 14.79l4.56 9.13a.86.86 0 0 0 1.538 0l5.213-10.42a.86.86 0 0 0 0-.77L18.67 3.09a1.63 1.63 0 0 0-3.076 0z" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-[#253858]">ATLASSIAN</span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavItem label="Products" />
            <NavItem label="Solutions" />
            <NavItem label="Why Atlassian?" />
            <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#253858] hover:bg-[#f4f5f7] transition-colors">
              More +
            </button>
          </nav>
        </div>

        {/* Right: Search, Grid, Avatar */}
        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 text-[#42526E] hover:bg-[#f4f5f7] transition-colors">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
          <button className="rounded-full p-2 text-[#42526E] hover:bg-[#f4f5f7] transition-colors">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <div className="ml-1 flex items-center gap-2.5">
            <Avatar className="size-8 border-2 border-[#0052CC]">
              <AvatarFallback className="bg-[#0052CC] text-xs font-medium text-white">
                AS
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-[#253858]">Abhishek Sharma</span>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavItem({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#253858] hover:bg-[#f4f5f7] transition-colors">
      {label}
      <svg className="size-4 text-[#6B778C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  )
}
