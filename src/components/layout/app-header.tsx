import { Bell, Search, LogOut, User as UserIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSearch } from '@/contexts/SearchContext'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import { getAvatarUrl } from '@/lib/utils'

export function AppHeader() {
  const { search, setSearch } = useSearch()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-6 lg:h-[60px] dark:bg-slate-950">
      <SidebarTrigger />
      <div className="flex w-full flex-1 items-center justify-between">
        <h1 className="hidden text-lg font-semibold text-slate-900 md:block dark:text-white">
          Onboarding Dashboard
        </h1>
        <div className="flex items-center gap-4 ml-auto">
          <div className="relative w-full max-w-[200px] lg:max-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cliente..."
              className="w-full rounded-full bg-slate-100 pl-8 dark:bg-slate-900 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative shrink-0 h-9 w-9 text-slate-600 dark:text-slate-300"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-600 dark:border-slate-950"></span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800">
                  <AvatarImage
                    src={getAvatarUrl(user, user?.avatar)}
                    alt={user?.name || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-medium">
                    {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1">
                    {user?.email}
                  </p>
                  {user?.role && (
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
                      {user.role === 'admin'
                        ? 'Administrador'
                        : user.role === 'gerente_integracao'
                          ? 'Gerente de Integração'
                          : 'Implantador'}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-slate-700 dark:text-slate-300">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:text-red-500 dark:focus:bg-red-950/50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair da conta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
