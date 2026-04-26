"use client"

import { Suspense, useEffect } from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { RoutePageSkeleton } from "@/components/route-page-skeleton"
import { TodayProvider } from "@/app/lib/today-context"
import { AskLinear } from "@/components/ask-linear"

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

  if (isSettings) {
    // Settings mounts its own inline Ask Linear + chat-history footer in the
    // sidebar, so skip the floating variant here.
    return <TodayProvider>{children}</TodayProvider>
  }

  return (
    <TodayProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/*
           * Keying on pathname forces the outlet to fully unmount the previous
           * route's tree on navigation, so a new route's Suspense (or any
           * useQuery/useSWR fetch on mount) can't render against stale data.
           * The Suspense fallback shows immediately instead of holding the
           * old page in place while the new one resolves.
           */}
          <Suspense key={pathname} fallback={<RoutePageSkeleton />}>
            {children}
          </Suspense>
        </SidebarInset>
        <AskLinear />
      </SidebarProvider>
    </TodayProvider>
  )
}
