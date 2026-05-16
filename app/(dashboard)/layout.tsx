import { AppSidebar } from "@/components/layout/app-sidebar"
import { TopNavbar } from "@/components/layout/top-navbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <TopNavbar />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 md:p-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
