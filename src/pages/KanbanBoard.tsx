import { useEffect, useState } from 'react'
import { Kanban, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { getClientes, updateCliente } from '@/services/clientes'
import { getTarefas } from '@/services/tarefas'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import type { Client, Task, ClientStatus } from '@/types'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const COLUMNS: { id: ClientStatus; title: string; color: string }[] = [
  { id: 'pendente', title: 'Pendente', color: 'bg-slate-200 dark:bg-slate-800' },
  { id: 'agendado', title: 'Agendado', color: 'bg-blue-100 dark:bg-blue-900/40' },
  { id: 'em_andamento', title: 'Em Andamento', color: 'bg-indigo-100 dark:bg-indigo-900/40' },
  { id: 'atrasado', title: 'Atrasado', color: 'bg-red-100 dark:bg-red-900/40' },
  { id: 'concluido', title: 'Concluído', color: 'bg-green-100 dark:bg-green-900/40' },
]

export default function KanbanBoard() {
  const [clients, setClients] = useState<Client[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeColumn, setActiveColumn] = useState<ClientStatus | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [clientsData, tasksData] = await Promise.all([getClientes(), getTarefas()])
      setClients(clientsData)
      setTasks(tasksData)
    } catch (error) {
      toast({ title: 'Erro ao carregar dados do board', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('clientes', () => {
    loadData()
  })

  useRealtime('tarefas_onboarding', () => {
    loadData()
  })

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

  const handleDragLeave = () => {
    setActiveColumn(null)
  }

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

  return (
    <div className="flex flex-col h-full bg-background/50 rounded-xl border shadow-sm">
      <div className="flex items-center p-5 border-b shrink-0 bg-card rounded-t-xl">
        <h1 className="text-xl font-bold flex items-center gap-2.5 text-foreground">
          <Kanban className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Em Implantação
        </h1>
      </div>

      <ScrollArea className="flex-1 whitespace-nowrap bg-muted/20">
        <div className="flex p-5 gap-5 h-full min-h-[calc(100vh-14rem)] items-stretch">
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
                      const isAtrasado = client.status_onboarding === 'atrasado'
                      const isConcluido = client.status_onboarding === 'concluido'

                      return (
                        <Card
                          key={client.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, client.id)}
                          className={cn(
                            'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-border/80 transition-all',
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

                              <div className="flex items-center gap-2.5 pt-3 border-t border-border/50">
                                <Avatar className="h-6 w-6 border border-border/50 shadow-sm">
                                  <AvatarImage
                                    src={
                                      client.expand?.implantador_id?.avatar
                                        ? pb.files.getUrl(
                                            client.expand.implantador_id,
                                            client.expand.implantador_id.avatar,
                                          )
                                        : undefined
                                    }
                                  />
                                  <AvatarFallback className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                                    {client.expand?.implantador_id?.name
                                      ?.substring(0, 2)
                                      .toUpperCase() || 'NA'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground truncate font-medium">
                                  {client.expand?.implantador_id?.name || 'Não atribuído'}
                                </span>
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
