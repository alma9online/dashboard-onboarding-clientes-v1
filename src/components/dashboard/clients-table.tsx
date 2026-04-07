import { ChevronDown, ChevronUp, MoreHorizontal, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Link, useNavigate } from 'react-router-dom'

import { useState, useEffect } from 'react'
import { Client } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { updateCliente } from '@/services/clientes'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import pb from '@/lib/pocketbase/client'

interface ClientsTableProps {
  clients: Client[]
  sortConfig: { key: keyof Client | 'nome' | 'data_prazo'; direction: 'asc' | 'desc' }
  onSort: (key: any) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const statusStyles: Record<string, string> = {
  pendente: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400',
  agendado: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  em_andamento: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  atrasado: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  concluido:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const formatStatus = (s: string) => {
  switch (s) {
    case 'pendente':
      return 'Pendente'
    case 'agendado':
      return 'Agendada'
    case 'em_andamento':
      return 'Em implantação'
    case 'atrasado':
      return 'Atrasado'
    case 'concluido':
      return 'Concluído'
    default:
      return s
  }
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
  const { user } = useAuth()

  const [assignClient, setAssignClient] = useState<Client | null>(null)
  const [implantadores, setImplantadores] = useState<any[]>([])
  const [selectedImp, setSelectedImp] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  const canAssign = user?.role === 'admin' || user?.role === 'gerente_integracao'

  useEffect(() => {
    if (assignClient && implantadores.length === 0) {
      pb.collection('users')
        .getFullList({ filter: "role='implantador'" })
        .then(setImplantadores)
        .catch(() => {})
    }
    if (assignClient) {
      setSelectedImp(assignClient.implantador_id || 'unassigned')
    }
  }, [assignClient, implantadores.length])

  const handleAssignSubmit = async () => {
    if (!assignClient) return
    setIsUpdating(true)
    try {
      await updateCliente(assignClient.id, {
        implantador_id: selectedImp === 'unassigned' ? '' : selectedImp,
      })
      toast.success('Implantador atribuído com sucesso')
      setAssignClient(null)
    } catch (e) {
      toast.error('Erro ao atribuir implantador')
    } finally {
      setIsUpdating(false)
    }
  }

  const SortIcon = ({ column }: { column: string }) => {
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
                onClick={() => onSort('nome')}
              >
                <div className="flex items-center">
                  Cliente <SortIcon column="nome" />
                </div>
              </TableHead>
              <TableHead className="font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead
                className="cursor-pointer font-semibold uppercase tracking-wide"
                onClick={() => onSort('data_prazo')}
              >
                <div className="flex items-center">
                  Prazo <SortIcon column="data_prazo" />
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
              clients.map((client, i) => {
                const avatarUrl = client.expand?.implantador_id?.avatar
                  ? pb.files.getUrl(
                      client.expand.implantador_id,
                      client.expand.implantador_id.avatar,
                    )
                  : ''
                const impName = client.expand?.implantador_id?.name || 'Não atribuído'

                return (
                  <TableRow
                    key={client.id}
                    className="animate-fade-in-up transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      <Link to={`/client/${client.id}`} className="hover:underline">
                        {client.nome}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('border font-medium', statusStyles[client.status_onboarding])}
                      >
                        {formatStatus(client.status_onboarding)}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        client.status_onboarding === 'atrasado'
                          ? 'font-medium text-red-600 dark:text-red-400'
                          : '',
                      )}
                    >
                      {client.data_prazo
                        ? format(new Date(client.data_prazo), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7 border">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback>{impName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{impName}</span>
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
                          {canAssign && (
                            <DropdownMenuItem onClick={() => setAssignClient(client)}>
                              Atribuir Implantador
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!assignClient} onOpenChange={(open) => !open && setAssignClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Implantador</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedImp} onValueChange={setSelectedImp}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um implantador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Não atribuído</SelectItem>
                {implantadores.map((imp) => (
                  <SelectItem key={imp.id} value={imp.id}>
                    {imp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignClient(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignSubmit} disabled={isUpdating}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
