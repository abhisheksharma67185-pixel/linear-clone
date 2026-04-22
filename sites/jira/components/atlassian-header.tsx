import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function AtlassianHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
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
            <span className="text-xl font-bold tracking-tight text-slate-800">
              ATLASSIAN
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavDropdown label="Products">
              <div className="py-1">
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-accent"
                >
                  <svg
                    className="size-5 text-blue-600"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                  >
                    <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                  </svg>
                  <div>
                    <p className="font-medium">Jira</p>
                    <p className="text-xs text-muted-foreground">
                      Project and issue tracking
                    </p>
                  </div>
                </Link>
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-accent"
                >
                  <svg
                    className="size-5 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  <div>
                    <p className="font-medium">Confluence</p>
                    <p className="text-xs text-muted-foreground">
                      Document collaboration
                    </p>
                  </div>
                </Link>
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-accent"
                >
                  <svg
                    className="size-5 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                  <div>
                    <p className="font-medium">Trello</p>
                    <p className="text-xs text-muted-foreground">
                      Visual project management
                    </p>
                  </div>
                </Link>
              </div>
              <div className="border-t px-4 py-2">
                <Link
                  href="/products"
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View all products
                </Link>
              </div>
            </NavDropdown>
            <NavDropdown label="Solutions">
              <div className="py-1">
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">DevOps</p>
                    <p className="text-xs text-muted-foreground">
                      Ship faster with integrated tools
                    </p>
                  </div>
                </Link>
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">IT Service Management</p>
                    <p className="text-xs text-muted-foreground">
                      Deliver great service experiences
                    </p>
                  </div>
                </Link>
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">Agile & DevOps</p>
                    <p className="text-xs text-muted-foreground">
                      Run agile and DevOps together
                    </p>
                  </div>
                </Link>
              </div>
            </NavDropdown>
            <NavDropdown label="Why Atlassian?">
              <div className="py-1">
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">Teamwork</p>
                    <p className="text-xs text-muted-foreground">
                      Power your team&apos;s collaboration
                    </p>
                  </div>
                </Link>
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">Enterprise</p>
                    <p className="text-xs text-muted-foreground">
                      Scale with confidence
                    </p>
                  </div>
                </Link>
              </div>
            </NavDropdown>
            <Link
              href="/products"
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
            >
              More +
            </Link>
          </nav>
        </div>

        {/* Right: Search, Grid, Avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </Link>
          <Link
            href="/home/apps"
            className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </Link>
          <div className="ml-1 flex items-center gap-2.5">
            <Avatar className="size-8 border-2 border-[#0052CC]">
              <AvatarFallback className="bg-[#0052CC] text-xs font-medium text-white">
                AS
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-800">
              Abhishek Sharma
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavDropdown({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100">
        {label}
        <svg
          className="size-4 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="w-[280px] p-0"
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}
