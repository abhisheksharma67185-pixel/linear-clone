/**
 * Inspector navigation
 *
 * PURPOSE  Renders the sticky desktop sidebar (`<Sidebar>`, md+) and
 *          the mobile top bar with a Sheet drawer (`<MobileNav>`,
 *          below md). Both share the same nav-item list and active-
 *          path matching logic so menus stay in sync.
 * USAGE    Mounted once by `app/layout.tsx`. To add a new top-level
 *          route, append to NAV_ITEMS — `match` decides which routes
 *          highlight the link (use `path.startsWith("/foo")` for
 *          parents that should match their children too).
 * EXTRAS   Includes the `<ThemeToggle>` (light / dark, hotkey "d"
 *          via theme-provider) and a "source" link in the footer.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconList,
  IconStairs,
  IconPlayerPlay,
  IconServer2,
  IconGitCompare,
  IconMenu2,
  IconMoon,
  IconSun,
  IconBrandGithub,
} from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  match: (path: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    icon: IconLayoutDashboard,
    match: (p) => p === "/",
  },
  {
    href: "/sites",
    label: "Sites",
    icon: IconServer2,
    match: (p) => p.startsWith("/sites"),
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: IconList,
    match: (p) => p.startsWith("/tasks"),
  },
  {
    href: "/curriculum",
    label: "Curriculum",
    icon: IconStairs,
    match: (p) => p.startsWith("/curriculum"),
  },
  {
    href: "/episodes/new",
    label: "Run episode",
    icon: IconPlayerPlay,
    match: (p) => p.startsWith("/episodes"),
  },
  {
    href: "/snapshots",
    label: "Snapshots",
    icon: IconGitCompare,
    match: (p) => p.startsWith("/snapshots"),
  },
]

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname()
  const active = item.match(pathname)
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="size-4" />
      {item.label}
    </Link>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  // SSR-mount detection: theme is server-unknowable, so we render an icon
  // placeholder until hydration. Standard `useEffect`+`setState` pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), [])

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <IconSun className="size-4" />
      ) : (
        <IconMoon className="size-4" />
      )}
    </Button>
  )
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 px-2 py-1">
      <div className="grid size-7 place-items-center rounded-md bg-primary font-mono text-sm font-semibold text-primary-foreground">
        ϴ
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">ThetaBench</span>
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
          Inspector
        </span>
      </div>
    </Link>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="border-b px-2 py-3">
        <Brand />
      </div>
      <nav
        className="flex-1 space-y-1 overflow-y-auto p-2"
        aria-label="Primary"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} onClick={onNavigate} />
        ))}
      </nav>
      <div className="flex items-center justify-between border-t p-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <IconBrandGithub className="size-3.5" />
          source
        </a>
        <ThemeToggle />
      </div>
    </>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <SidebarBody />
    </aside>
  )
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  // Close the drawer when navigating to a new route. URL → UI sync is
  // exactly what useEffect is for; the lint rule is over-cautious here.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false)
  }, [pathname])

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-background px-3 py-2 md:hidden">
      <Brand />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Open menu">
                <IconMenu2 className="size-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Inspector navigation menu
            </SheetDescription>
            <div className="flex h-full flex-col">
              <SidebarBody onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
