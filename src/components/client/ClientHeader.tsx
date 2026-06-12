import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building, Calendar, Clock, DollarSign, Mail, Users, Video } from 'lucide-react'
import { format } from 'date-fns'
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
  { value: 'cancelado', label: 'Cancelado' },
]

export function ClientHeader({ client, users, onUpdate }: ClientHeaderProps) {
  const navigate = useNavigate()

  const [reunioes, setReunioes] = useState(client.qtd_reunioes?.toString() || '')
  const [horas, setHoras] = useState(client.horas_estimadas_reuniao?.toString() || '')

  useEffect(() => {
    setReunioes(client.qtd_reunioes?.toString() || '')
    setHoras(client.horas_estimadas_reuniao?.toString() || '')
  }, [client.qtd_reunioes, client.horas_estimadas_reuniao])

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

  return (
    <>
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/em-implantacao')}
          className="rounded-full shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0 flex items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold tracking-tight truncate flex items-center">
            {client.codigo_cliente && (
              <span className="text-muted-foreground mr-2 font-medium">
                #{client.codigo_cliente}
              </span>
            )}
            {client.nome}
          </h1>
          {client.sistemas && client.sistemas.length > 0 && (
            <div className="flex gap-1 ml-2">
              {client.sistemas.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
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
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                {client.data_prazo
                  ? format(new Date(client.data_prazo), 'dd/MM/yyyy', { locale: ptBR })
                  : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Contato e Valor</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground block flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <span className="text-sm font-medium truncate block" title={client.email}>
                {client.email || '-'}
              </span>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground block flex items-center gap-1 mt-1">
                <DollarSign className="h-3 w-3" /> Valor do Contrato
              </Label>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {client.valor_contrato
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      client.valor_contrato,
                    )
                  : 'R$ 0,00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
