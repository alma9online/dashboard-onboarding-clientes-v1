import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Mail,
  Users,
  Video,
  Phone,
  CheckCircle,
  Edit2,
} from 'lucide-react'
import { format, differenceInDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Client, User, ClientStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface ClientHeaderProps {
  client: Client
  users: User[]
  onUpdate: (data: Partial<Client>) => Promise<void>
}

const statusOptions: { value: ClientStatus; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'agendar', label: 'Agendar' },
  { value: 'aguardando_retorno', label: 'Aguardando Retorno' },
  { value: 'agendado', label: 'Agendado' },
  { value: 'em_implantacao', label: 'Em Implantação' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'atrasado', label: 'Atrasado' },
  { value: 'em_acompanhamento', label: 'Em Acompanhamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'arquivado', label: 'Arquivado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export function ClientHeader({ client, users, onUpdate }: ClientHeaderProps) {
  const navigate = useNavigate()

  const [reunioes, setReunioes] = useState(client.qtd_reunioes?.toString() || '')
  const [horas, setHoras] = useState(client.horas_estimadas_reuniao?.toString() || '')

  // Name edit state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(client.nome)

  // Closure modal state
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false)
  const [closureStatus, setClosureStatus] = useState<'concluido' | 'arquivado'>('concluido')
  const [closureReason, setClosureReason] = useState('')
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    setReunioes(client.qtd_reunioes?.toString() || '')
    setHoras(client.horas_estimadas_reuniao?.toString() || '')
    setEditName(client.nome)
  }, [client])

  const handleMetricsBlur = () => {
    const r = parseInt(reunioes, 10)
    const h = parseInt(horas, 10)

    const updateData: Partial<Client> = {}
    if (!isNaN(r) && r !== client.qtd_reunioes) updateData.qtd_reunioes = r
    if (!isNaN(h) && h !== client.horas_estimadas_reuniao) updateData.horas_estimadas_reuniao = h

    if (Object.keys(updateData).length > 0) {
      onUpdate(updateData)
    }
  }

  const handleNameSave = () => {
    if (editName.trim() && editName !== client.nome) {
      onUpdate({ nome: editName.trim() })
    }
    setIsEditingName(false)
  }

  const handleCloseOnboarding = async () => {
    if (!closureReason.trim()) return
    setIsClosing(true)
    try {
      await onUpdate({
        status_onboarding: closureStatus,
        motivo_encerramento: closureReason.trim(),
      })
      toast.success(
        `Onboarding ${closureStatus === 'concluido' ? 'concluído' : 'arquivado'} com sucesso!`,
      )
      setIsClosureModalOpen(false)
      setClosureReason('')
    } catch (error) {
      toast.error('Erro ao encerrar onboarding.')
    } finally {
      setIsClosing(false)
    }
  }

  // Calculate deadline alert
  let daysToDeadline: number | null = null
  if (client.data_prazo) {
    const today = startOfDay(new Date())
    const prazoDate = startOfDay(new Date(client.data_prazo))
    const diff = differenceInDays(prazoDate, today)

    if (diff >= 0 && diff <= 5) {
      daysToDeadline = diff
    }
  }

  const systemOptions = ['Expedy', 'Snap', 'Handsys'] as const

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/em-implantacao')}
            className="rounded-full shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0 flex items-center flex-wrap gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="h-8 text-lg font-bold w-64"
                />
              </div>
            ) : (
              <h1 className="text-2xl font-bold tracking-tight truncate flex items-center group">
                {client.codigo_cliente && (
                  <span className="text-muted-foreground mr-2 font-medium">
                    #{client.codigo_cliente}
                  </span>
                )}
                {client.nome}
                <button
                  onClick={() => setIsEditingName(true)}
                  className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </h1>
            )}

            <div className="flex items-center gap-1 ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2 flex gap-1 bg-secondary hover:bg-secondary/80 border-0 text-secondary-foreground rounded-full"
                  >
                    {client.sistemas && client.sistemas.length > 0
                      ? client.sistemas.join(', ')
                      : 'Adicionar Sistema'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {systemOptions.map((s) => (
                    <DropdownMenuCheckboxItem
                      key={s}
                      checked={client.sistemas?.includes(s)}
                      onCheckedChange={(checked) => {
                        const current = client.sistemas || []
                        const next = checked ? [...current, s] : current.filter((x) => x !== s)
                        onUpdate({ sistemas: next as any })
                      }}
                    >
                      {s}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="shrink-0 w-48">
            <Select
              value={client.status_onboarding}
              onValueChange={(val: ClientStatus) => onUpdate({ status_onboarding: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="shrink-0 gap-2"
            onClick={() => setIsClosureModalOpen(true)}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Encerrar</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Responsáveis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Principal</Label>
              <Select
                value={client.implantador_id || 'none'}
                onValueChange={(val) => onUpdate({ implantador_id: val === 'none' ? '' : val })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Não atribuído" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não atribuído</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Secundário</Label>
              <Select
                value={client.implantador_secundario_id || 'none'}
                onValueChange={(val) =>
                  onUpdate({ implantador_secundario_id: val === 'none' ? '' : val })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Não atribuído" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não atribuído</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Métricas de Reunião</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Qtd Reuniões</Label>
              <Input
                type="number"
                min="0"
                className="h-8 text-xs"
                value={reunioes}
                onChange={(e) => setReunioes(e.target.value)}
                onBlur={handleMetricsBlur}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Horas Estimadas</Label>
              <Input
                type="number"
                min="0"
                className="h-8 text-xs"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                onBlur={handleMetricsBlur}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Prazos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground block">Data da Venda</Label>
              <span className="text-sm font-medium">
                {client.data_venda
                  ? format(new Date(client.data_venda), 'dd/MM/yyyy', { locale: ptBR })
                  : '-'}
              </span>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground block flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" /> Prazo
              </Label>
              <div className="flex items-center">
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {client.data_prazo
                    ? format(new Date(client.data_prazo), 'dd/MM/yyyy', { locale: ptBR })
                    : '-'}
                </span>
                {daysToDeadline !== null && (
                  <Badge variant="destructive" className="ml-2 text-[10px] h-5">
                    {daysToDeadline === 0
                      ? 'Vence hoje'
                      : `Falta${daysToDeadline > 1 ? 'm' : ''} ${daysToDeadline} dia${daysToDeadline > 1 ? 's' : ''}`}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Contato e Valor</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <div>
                <Label className="text-xs text-muted-foreground block flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Telefone
                </Label>
                <span className="text-sm font-medium block truncate" title={client.telefone}>
                  {client.telefone || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-xs text-muted-foreground block flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </Label>
                  <span
                    className="text-sm font-medium truncate block max-w-[120px]"
                    title={client.email}
                  >
                    {client.email || '-'}
                  </span>
                </div>
                <div className="text-right">
                  <Label className="text-xs text-muted-foreground block flex items-center justify-end gap-1">
                    <DollarSign className="h-3 w-3" /> Valor
                  </Label>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {client.valor_contrato
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(client.valor_contrato)
                      : 'R$ 0,00'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isClosureModalOpen} onOpenChange={setIsClosureModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Encerrar Onboarding</DialogTitle>
            <DialogDescription>
              Selecione o resultado final e forneça uma justificativa para o encerramento deste
              projeto de onboarding.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Resultado Final</Label>
              <Select
                value={closureStatus}
                onValueChange={(val: 'concluido' | 'arquivado') => setClosureStatus(val)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concluido">Concluído (Sucesso)</SelectItem>
                  <SelectItem value="arquivado">Arquivado / Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motivo">
                Motivo <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="motivo"
                placeholder="Descreva o motivo do encerramento..."
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClosureModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCloseOnboarding} disabled={!closureReason.trim() || isClosing}>
              {isClosing ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
