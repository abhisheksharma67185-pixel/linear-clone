import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { IssueDrawerProvider } from "@/components/issue-drawer-provider"
import { DrawerDetectProvider } from "@/components/issue-link"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-w-0 flex-col">
        <IssueDrawerProvider>
          <DrawerDetectProvider>
            <TopNav />
            <div className="min-w-0 flex-1 overflow-auto">{children}</div>
          </DrawerDetectProvider>
        </IssueDrawerProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
