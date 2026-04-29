import { LayoutDashboard, BarChart3, Settings, Users, Kanban } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center justify-center px-4 lg:h-[60px]">
        <img
          src="https://expedy.com.br/wp-content/uploads/2026/04/handcorp-logo.png"
          alt="HANDCORP"
          className="h-8 w-auto object-contain"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                  <Link to="/">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/em-implantacao'}>
                  <Link to="/em-implantacao">
                    <Kanban />
                    <span>Em Implantação</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/reports'}>
                  <Link to="/">
                    <BarChart3 />
                    <span>Relatórios</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/settings'}>
                  <Link to="/settings">
                    <Settings />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/admin/users'}>
                    <Link to="/admin/users">
                      <Users />
                      <span>Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
