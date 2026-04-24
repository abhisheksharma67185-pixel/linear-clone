"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
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
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
      <AskLinear />
    </SidebarProvider>
  )
}
