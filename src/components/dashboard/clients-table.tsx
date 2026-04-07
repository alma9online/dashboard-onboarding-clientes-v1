import { ChevronDown, ChevronUp, MoreHorizontal, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Link, useNavigate } from 'react-router-dom'

import { Client } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ClientsTableProps {
  clients: Client[]
  sortConfig: { key: keyof Client; direction: 'asc' | 'desc' }
  onSort: (key: keyof Client) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const statusStyles: Record<string, string> = {
  'Em implantação':
    'bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  Agendada:
    'bg-amber-100 text-amber-700 hover:bg-amber-100/80 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  Atrasado:
    'bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  Concluído:
    'bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
}

export function ClientsTable({
  clients,
  sortConfig,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
}: ClientsTableProps) {
  const navigate = useNavigate()

  const SortIcon = ({ column }: { column: keyof Client }) => {
    if (sortConfig.key !== column) return null
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="rounded-xl border bg-white shadow-sm dark:bg-slate-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead
                className="cursor-pointer font-semibold uppercase tracking-wide"
                onClick={() => onSort('companyName')}
              >
                <div className="flex items-center">
                  Cliente <SortIcon column="companyName" />
                </div>
              </TableHead>
              <TableHead className="font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead
                className="cursor-pointer font-semibold uppercase tracking-wide"
                onClick={() => onSort('deadline')}
              >
                <div className="flex items-center">
                  Prazo <SortIcon column="deadline" />
                </div>
              </TableHead>
              <TableHead className="font-semibold uppercase tracking-wide">
                Implantador Responsável
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="mb-4 h-10 w-10 opacity-20" />
                    <p className="text-lg font-medium">Nenhum cliente encontrado</p>
                    <p className="text-sm">Tente ajustar os filtros selecionados.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client, i) => (
                <TableRow
                  key={client.id}
                  className="animate-fade-in-up transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    <Link to={`/client/${client.id}`} className="hover:underline">
                      {client.companyName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('border font-medium', statusStyles[client.status])}
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      client.status === 'Atrasado'
                        ? 'font-medium text-red-600 dark:text-red-400'
                        : '',
                    )}
                  >
                    {format(new Date(client.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7 border">
                        <AvatarImage src={client.implementerAvatar} />
                        <AvatarFallback>{client.implementer.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{client.implementer}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/client/${client.id}`)}>
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {clients.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
