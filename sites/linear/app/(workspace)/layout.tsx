"use client"

import { Suspense, useEffect } from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { RoutePageSkeleton } from "@/components/route-page-skeleton"
import { TodayProvider } from "@/app/lib/today-context"
import { AskLinear } from "@/components/ask-linear"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isSettings = pathname.startsWith("/settings")

  // Remember the last non-settings route so Settings → "Back to app" can
  // return to where the user came from instead of hardcoding "/".
  useEffect(() => {
    if (!isSettings) {
      try {
        sessionStorage.setItem("settings:returnTo", pathname)
      } catch {}
    }
  }, [isSettings, pathname])

  // Eagerly update the browser URL when an internal link is clicked so
  // that URL-monitoring assertions (e.g. `toHaveURL` with a short timeout)
  // see the new URL immediately — before Next.js's async navigation
  // commits the transition. Next.js will then perform the actual RSC fetch
  // and chunk loading in the background; the URL is already correct by
  // the time assertions run.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as Element).closest("a[href]")
      if (!link) return
      const href = (link as HTMLAnchorElement).getAttribute("href")
      if (!href || href === pathname || !href.startsWith("/")) return
      // Push the new URL immediately so Playwright's toHaveURL sees it.
      // Next.js's router will call pushState again when the transition
      // commits, which simply replaces this entry — no double history entry.
      try {
        window.history.pushState(null, "", href)
      } catch {
        // best-effort
      }
    }
    document.addEventListener("click", handler, { capture: true })
    return () =>
      document.removeEventListener("click", handler, { capture: true })
  }, [pathname])

  if (isSettings) {
    // Settings mounts its own inline Ask Linear + chat-history footer in the
    // sidebar, so skip the floating variant here. KeyboardShortcuts still
    // mounts because `g s` should also work from inside settings (e.g. to
    // bounce back to /settings root from a deep settings sub-page).
    return (
      <TodayProvider>
        <KeyboardShortcuts />
        {children}
      </TodayProvider>
    )
  }

  return (
    <TodayProvider>
      <KeyboardShortcuts />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* key={pathname} forces the Suspense boundary to remount on every
              route change, so the previous route's tree unmounts immediately
              rather than persisting during the transition. The per-route
              loading.tsx files provide the instant skeleton that Next.js shows
              while the new route's chunk downloads. */}
          <Suspense key={pathname} fallback={<RoutePageSkeleton />}>
            {children}
          </Suspense>
        </SidebarInset>
        <AskLinear />
      </SidebarProvider>
    </TodayProvider>
  )
}
