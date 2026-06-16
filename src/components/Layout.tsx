import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col bg-slate-50 dark:bg-slate-900 h-screen overflow-hidden">
        <div className="shrink-0 z-10 sticky top-0 w-full bg-slate-50 dark:bg-slate-900">
          <AppHeader />
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 flex flex-col min-h-0">
          <div className="w-full h-full flex-1 flex flex-col min-h-0">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
