import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Kanban, Calendar, Clock } from 'lucide-react'
import { format, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { getClientes, updateCliente } from '@/services/clientes'
import { CreateClientDialog } from '@/components/client/CreateClientDialog'
import { getTarefas } from '@/services/tarefas'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import type { Client, Task, ClientStatus, User } from '@/types'
import { cn, formatHoursToReadableTime } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const COLUMNS: { id: ClientStatus; title: string; color: string }[] = [
  { id: 'pendente', title: 'Pendente', color: 'bg-slate-200 dark:bg-slate-800' },
  { id: 'agendar', title: 'Agendar', color: 'bg-orange-100 dark:bg-orange-900/40' },
  {
    id: 'aguardando_retorno',
    title: 'Aguardando Retorno',
    color: 'bg-yellow-100 dark:bg-yellow-900/40',
  },
  { id: 'agendado', title: 'Agendado', color: 'bg-blue-100 dark:bg-blue-900/40' },
  { id: 'em_implantacao', title: 'Em Implantação', color: 'bg-indigo-100 dark:bg-indigo-900/40' },
  { id: 'pausado', title: 'Pausado', color: 'bg-stone-200 dark:bg-stone-800' },
  { id: 'atrasado', title: 'Atrasado', color: 'bg-red-100 dark:bg-red-900/40' },
  { id: 'em_acompanhamento', title: 'Em Acompanhamento', color: 'bg-teal-100 dark:bg-teal-900/40' },
  { id: 'concluido', title: 'Concluído', color: 'bg-green-100 dark:bg-green-900/40' },
  { id: 'cancelado', title: 'Cancelado', color: 'bg-zinc-100 dark:bg-zinc-800' },
]

export default function KanbanBoard() {
  const [clients, setClients] = useState<Client[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activeColumn, setActiveColumn] = useState<ClientStatus | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  const loadData = async () => {
    try {
      const [clientsData, tasksData, usersData] = await Promise.all([
        getClientes(),
        getTarefas(),
        getUsers(),
      ])
      setClients(clientsData)
      setTasks(tasksData)
      setUsers(usersData)
    } catch (error) {
      toast({ title: 'Erro ao carregar dados do board', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('clientes', () => loadData())
  useRealtime('tarefas_onboarding', () => loadData())

  const getClientProgress = (clientId: string) => {
    const clientTasks = tasks.filter((t) => t.cliente_id === clientId)
    if (clientTasks.length === 0) return 0
    const completed = clientTasks.filter((t) => t.concluido).length
    return Math.round((completed / clientTasks.length) * 100)
  }

  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    e.dataTransfer.setData('clientId', clientId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: ClientStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (activeColumn !== status) {
      setActiveColumn(status)
    }
  }

  const handleDragLeave = () => setActiveColumn(null)

  const handleDrop = async (e: React.DragEvent, status: ClientStatus) => {
    e.preventDefault()
    setActiveColumn(null)
    const clientId = e.dataTransfer.getData('clientId')
    if (!clientId) return

    const client = clients.find((c) => c.id === clientId)
    if (client && client.status_onboarding !== status) {
      const previousStatus = client.status_onboarding

      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, status_onboarding: status } : c)),
      )

      try {
        await updateCliente(clientId, { status_onboarding: status })
        toast({ title: 'Status do cliente atualizado' })
      } catch (error) {
        setClients((prev) =>
          prev.map((c) => (c.id === clientId ? { ...c, status_onboarding: previousStatus } : c)),
        )
        toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
      }
    }
  }

  const handleAssigneeChange = async (
    clientId: string,
    field: 'implantador_id' | 'implantador_secundario_id',
    userId: string,
  ) => {
    const newValue = userId === 'unassigned' ? '' : userId

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updated = { ...c, [field]: newValue }
          const assignedUser = users.find((u) => u.id === newValue)
          if (!updated.expand) updated.expand = {}
          updated.expand[field] = assignedUser
          return updated
        }
        return c
      }),
    )

    try {
      await updateCliente(clientId, { [field]: newValue })
      toast({ title: 'Responsável atualizado' })
    } catch (error) {
      toast({ title: 'Erro ao atualizar responsável', variant: 'destructive' })
      loadData()
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background/50 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between p-5 border-b shrink-0 bg-card rounded-t-xl">
        <h1 className="text-xl font-bold flex items-center gap-2.5 text-foreground">
          <Kanban className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Em Implantação
        </h1>
        <CreateClientDialog />
      </div>

      <ScrollArea className="flex-1 whitespace-nowrap bg-muted/20">
        <div className="flex p-5 gap-5 h-full items-stretch">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className={cn(
                'flex flex-col w-[340px] shrink-0 bg-slate-100/50 dark:bg-slate-900/40 rounded-xl border border-dashed transition-all duration-200',
                activeColumn === col.id
                  ? 'bg-slate-100 dark:bg-slate-800 border-indigo-500/50 scale-[1.02] shadow-sm'
                  : 'border-border/60',
              )}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
            >
              <div
                className={cn(
                  'p-3.5 flex items-center justify-between border-b rounded-t-xl shrink-0',
                  col.color,
                )}
              >
                <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                  {col.title}
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-background/80 hover:bg-background font-mono text-xs"
                >
                  {clients.filter((c) => c.status_onboarding === col.id).length}
                </Badge>
              </div>

              <ScrollArea className="flex-1 p-3">
                <div className="flex flex-col gap-3 min-h-[120px]">
                  {clients
                    .filter((c) => c.status_onboarding === col.id)
                    .map((client) => {
                      const progress = getClientProgress(client.id)
                      const isConcluido =
                        client.status_onboarding === 'concluido' ||
                        client.status_onboarding === 'cancelado'
                      const isAtrasado =
                        client.status_onboarding === 'atrasado' ||
                        (!!client.data_prazo &&
                          !isConcluido &&
                          isBefore(startOfDay(new Date(client.data_prazo)), startOfDay(new Date())))

                      const primary = client.expand?.implantador_id
                      const secondary = client.expand?.implantador_secundario_id

                      return (
                        <Card
                          key={client.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, client.id)}
                          onClick={() => navigate(`/client/${client.id}`)}
                          className={cn(
                            'cursor-pointer active:cursor-grabbing hover:shadow-md hover:border-border/80 transition-all',
                            isAtrasado &&
                              'border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20',
                            isConcluido && 'opacity-70 grayscale-[20%]',
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3 gap-2">
                              <h4
                                className="font-semibold text-sm leading-snug text-wrap break-words"
                                title={client.nome}
                              >
                                {client.codigo_cliente && (
                                  <span className="text-muted-foreground font-medium">
                                    #{client.codigo_cliente} -{' '}
                                  </span>
                                )}
                                {client.nome}
                              </h4>
                              {isAtrasado && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-medium"
                                >
                                  Atrasado
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-3.5">
                              <div className="flex items-center text-xs text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-foreground/70" />
                                  {client.data_prazo
                                    ? format(new Date(client.data_prazo), 'dd/MM/yyyy', {
                                        locale: ptBR,
                                      })
                                    : 'Sem prazo'}
                                </span>
                              </div>

                              {client.sistemas && client.sistemas.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {client.sistemas.map((sys) => (
                                    <Badge
                                      key={sys}
                                      variant="outline"
                                      className="text-[9px] px-1.5 py-0 h-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                                    >
                                      {sys}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center text-[10px] text-muted-foreground font-medium">
                                <Clock className="w-3 h-3 mr-1.5 text-foreground/70" />
                                {formatHoursToReadableTime(client.horas_acumuladas)}
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                  <span>Progresso</span>
                                  <span>{progress}%</span>
                                </div>
                                <Progress
                                  value={progress}
                                  className={cn(
                                    'h-1.5 bg-secondary',
                                    isAtrasado
                                      ? '[&>div]:bg-red-500'
                                      : progress === 100
                                        ? '[&>div]:bg-green-500'
                                        : '[&>div]:bg-indigo-500',
                                  )}
                                />
                              </div>

                              <div
                                className="pt-3 mt-3 border-t border-border/50"
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                              >
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 -ml-1.5 rounded-md transition-colors w-fit">
                                      <div className="flex -space-x-2">
                                        <Avatar className="h-6 w-6 border-2 border-background shadow-sm z-10">
                                          <AvatarImage
                                            src={
                                              primary?.avatar
                                                ? pb.files.getUrl(primary, primary.avatar)
                                                : undefined
                                            }
                                          />
                                          <AvatarFallback className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                                            {primary?.name?.substring(0, 2).toUpperCase() || 'NA'}
                                          </AvatarFallback>
                                        </Avatar>
                                        {secondary && (
                                          <Avatar className="h-6 w-6 border-2 border-background shadow-sm z-0">
                                            <AvatarImage
                                              src={
                                                secondary.avatar
                                                  ? pb.files.getUrl(secondary, secondary.avatar)
                                                  : undefined
                                              }
                                            />
                                            <AvatarFallback className="text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                              {secondary.name?.substring(0, 2).toUpperCase() ||
                                                'NA'}
                                            </AvatarFallback>
                                          </Avatar>
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground truncate font-medium">
                                        {primary ? primary.name : 'Não atribuído'}
                                        {secondary ? ` +1` : ''}
                                      </span>
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-64 space-y-4"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="space-y-2">
                                      <Label className="text-xs">Implantador Principal</Label>
                                      <Select
                                        value={client.implantador_id || 'unassigned'}
                                        onValueChange={(val) =>
                                          handleAssigneeChange(client.id, 'implantador_id', val)
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="unassigned">Não atribuído</SelectItem>
                                          {users.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>
                                              {u.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs">Implantador Secundário</Label>
                                      <Select
                                        value={client.implantador_secundario_id || 'unassigned'}
                                        onValueChange={(val) =>
                                          handleAssigneeChange(
                                            client.id,
                                            'implantador_secundario_id',
                                            val,
                                          )
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="unassigned">Não atribuído</SelectItem>
                                          {users.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>
                                              {u.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2.5" />
      </ScrollArea>
    </div>
  )
}
