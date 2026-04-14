import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AskLinear } from "@/components/ask-linear"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="rounded-tl-2xl shadow-sm">
        {children}
      </SidebarInset>
      <AskLinear />
    </SidebarProvider>
  )
}
