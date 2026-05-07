import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { GlobalRail } from "@/components/global-rail"
import { TopSearchBar } from "@/components/top-search-bar"
import { ThreadPanelProvider } from "@/components/thread-panel-provider"
import { ThreadPanel } from "@/components/thread-panel"
import { ForwardMessageProvider } from "@/components/forward-message-provider"
import { HuddleBar } from "@/components/huddle-bar"
import { CommandPalette } from "@/components/command-palette"
import { Toaster } from "@/components/ui/sonner"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThreadPanelProvider>
      <ForwardMessageProvider>
        {/* Top bar spans the full viewport (real Slack chrome). Body
            below is rail | sidebar | main, all sharing the aubergine
            chrome on the left two columns. h-svh + overflow-hidden
            traps body-level scroll so the only scrollable container is
            the message list — that's what keeps the composer pinned. */}
        <div className="flex h-svh flex-col overflow-hidden bg-slack-aubergine">
          <TopSearchBar />
          <div className="flex min-h-0 flex-1">
            <GlobalRail />
            <SidebarProvider className="!min-h-0 flex-1">
              <AppSidebar />
              <SidebarInset className="relative flex min-h-0 flex-1 flex-col bg-background">
                <div className="flex min-h-0 flex-1 overflow-hidden">
                  <main className="flex min-h-0 min-w-0 flex-1 flex-col">
                    {children}
                  </main>
                  <ThreadPanel />
                </div>
                <HuddleBar />
              </SidebarInset>
            </SidebarProvider>
          </div>
          <CommandPalette />
          <Toaster />
        </div>
      </ForwardMessageProvider>
    </ThreadPanelProvider>
  )
}
