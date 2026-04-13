import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { IssueDrawerProvider } from "@/components/issue-drawer-provider";
import { DrawerDetectProvider } from "@/components/issue-link";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-w-0">
        <IssueDrawerProvider>
          <DrawerDetectProvider>
            <TopNav />
            <div className="flex-1 overflow-auto min-w-0">{children}</div>
          </DrawerDetectProvider>
        </IssueDrawerProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
