import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopSearchBar } from "@/components/top-search-bar";
import { ThreadPanelProvider } from "@/components/thread-panel-provider";
import { ThreadPanel } from "@/components/thread-panel";
import { HuddleBar } from "@/components/huddle-bar";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "@/components/ui/sonner";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThreadPanelProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex min-h-svh flex-col bg-background">
          <TopSearchBar />
          <div className="flex min-h-0 flex-1">
            <main className="flex min-w-0 flex-1 flex-col">{children}</main>
            <ThreadPanel />
          </div>
          <HuddleBar />
        </SidebarInset>
        <CommandPalette />
        <Toaster />
      </SidebarProvider>
    </ThreadPanelProvider>
  );
}
