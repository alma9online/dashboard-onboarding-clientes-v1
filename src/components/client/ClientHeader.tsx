import { useState, useEffect } from 'react'
import { Client, User, ProdutoContratado } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Button } from '@/components/ui/button'
import { formatStatus } from '@/lib/utils'
import {
  Building,
  Phone,
  Mail,
  User as UserIcon,
  Calendar,
  Briefcase,
  FileText,
  Save,
  Clock,
  Edit2,
  X,
  Check,
} from 'lucide-react'

interface ClientHeaderProps {
  client: Client
  users: User[]
  products: ProdutoContratado[]
  onUpdate: (data: Partial<Client>) => Promise<void>
}

export function ClientHeader({ client, users, products, onUpdate }: ClientHeaderProps) {
  const [cnpj, setCnpj] = useState(client.cnpj || '')
  const [motivoEncerramento, setMotivoEncerramento] = useState(client.motivo_encerramento || '')
  const [metrics, setMetrics] = useState({
    qtd_reunioes: client.qtd_reunioes?.toString() || '',
    horas_estimadas_reuniao: client.horas_estimadas_reuniao?.toString() || '',
    horas_acumuladas: client.horas_acumuladas?.toString() || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(client.nome)

  useEffect(() => {
    setCnpj(client.cnpj || '')
    setMotivoEncerramento(client.motivo_encerramento || '')
    setEditedName(client.nome)
    setMetrics({
      qtd_reunioes: client.qtd_reunioes?.toString() || '',
      horas_estimadas_reuniao: client.horas_estimadas_reuniao?.toString() || '',
      horas_acumuladas: client.horas_acumuladas?.toString() || '',
    })
  }, [
    client.nome,
    client.cnpj,
    client.motivo_encerramento,
    client.qtd_reunioes,
    client.horas_estimadas_reuniao,
    client.horas_acumuladas,
  ])

  const handleNameSave = async () => {
    if (editedName.trim() && editedName.trim() !== client.nome) {
      setIsSaving(true)
      try {
        await onUpdate({ nome: editedName.trim() })
        setIsEditingName(false)
      } finally {
        setIsSaving(false)
      }
    } else {
      setIsEditingName(false)
      setEditedName(client.nome)
    }
  }

  const handleNameCancel = () => {
    setIsEditingName(false)
    setEditedName(client.nome)
  }

  const handleMotivoSave = async () => {
    if (motivoEncerramento !== client.motivo_encerramento) {
      setIsSaving(true)
      try {
        await onUpdate({ motivo_encerramento: motivoEncerramento })
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleCnpjSave = async () => {
    if (cnpj !== client.cnpj) {
      setIsSaving(true)
      try {
        await onUpdate({ cnpj })
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleMetricsSave = async (field: keyof typeof metrics) => {
    const val = metrics[field] === '' ? 0 : Number(metrics[field])
    if (!isNaN(val) && val !== (client[field] || 0)) {
      setIsSaving(true)
      try {
        await onUpdate({ [field]: val })
      } finally {
        setIsSaving(false)
      }
    }
  }

  const implantadores = users.filter(
    (u) => u.role === 'implantador' || u.role === 'admin' || u.role === 'gerente_integracao',
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader className="flex flex-col sm:flex-row items-start justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 w-full xl:w-auto">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Building className="h-6 w-6 text-primary shrink-0" />
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-8 text-lg font-bold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave()
                      if (e.key === 'Escape') handleNameCancel()
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0"
                    onClick={handleNameSave}
                    disabled={isSaving}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                    onClick={handleNameCancel}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span className="truncate">{client.nome}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription className="text-base mt-2 flex items-center gap-3">
              <Badge variant="outline" className="font-medium">
                {formatStatus(client.status_onboarding)}
              </Badge>
              {client.codigo_cliente && (
                <span className="text-sm text-muted-foreground font-medium">
                  Código: {client.codigo_cliente}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-4 items-start xl:items-end w-full xl:w-auto mt-4 sm:mt-0">
            <div className="flex gap-2 self-end">
              <Button
                size="sm"
                onClick={() => onUpdate({ status_onboarding: 'concluido' })}
                disabled={client.status_onboarding === 'concluido'}
              >
                Concluir
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate({ status_onboarding: 'arquivado' })}
                disabled={client.status_onboarding === 'arquivado'}
              >
                Arquivar
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </Label>
                <Select
                  value={client.status_onboarding}
                  onValueChange={(val: any) => onUpdate({ status_onboarding: val })}
                >
                  <SelectTrigger className="w-full xl:w-[150px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="agendar">Agendar</SelectItem>
                    <SelectItem value="aguardando_retorno">Aguardando Retorno</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="em_implantacao">Em Implantação</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                    <SelectItem value="em_acompanhamento">Em Acompanhamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Impl. Principal
                </Label>
                <Select
                  value={client.implantador_id || 'unassigned'}
                  onValueChange={(val) =>
                    onUpdate({ implantador_id: val === 'unassigned' ? '' : val })
                  }
                >
                  <SelectTrigger className="w-full xl:w-[150px] h-9">
                    <SelectValue placeholder="Não atribuído" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não atribuído</SelectItem>
                    {implantadores.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Impl. Secundário
                </Label>
                <Select
                  value={client.implantador_secundario_id || 'unassigned'}
                  onValueChange={(val) =>
                    onUpdate({ implantador_secundario_id: val === 'unassigned' ? '' : val })
                  }
                >
                  <SelectTrigger className="w-full xl:w-[150px] h-9">
                    <SelectValue placeholder="Não atribuído" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não atribuído</SelectItem>
                    {implantadores.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  Sistema
                </Label>
                <Select
                  value={
                    Array.isArray(client.sistemas)
                      ? client.sistemas[0] || 'unassigned'
                      : client.sistemas || 'unassigned'
                  }
                  onValueChange={(val: any) =>
                    onUpdate({ sistemas: val === 'unassigned' ? [] : [val] } as any)
                  }
                >
                  <SelectTrigger className="w-full xl:w-[150px] h-9">
                    <SelectValue placeholder="Não definido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não definido</SelectItem>
                    <SelectItem value="Expedy">Expedy</SelectItem>
                    <SelectItem value="Snap">Snap</SelectItem>
                    <SelectItem value="Handsys">Handsys</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        {['concluido', 'arquivado', 'cancelado'].includes(client.status_onboarding) && (
          <CardContent className="pt-0 pb-4">
            <div className="border-t pt-4 space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Motivo de Encerramento
              </Label>
              <div className="flex items-center gap-2 max-w-xl">
                <Input
                  value={motivoEncerramento}
                  onChange={(e) => setMotivoEncerramento(e.target.value)}
                  placeholder="Digite o motivo do encerramento..."
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-2"
                  onClick={handleMotivoSave}
                  disabled={isSaving || motivoEncerramento === (client.motivo_encerramento || '')}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" />
            Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate font-medium" title={client.email}>
              {client.email || 'Não informado'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">{client.telefone || 'Não informado'}</span>
          </div>
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              CNPJ
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="Digite o CNPJ"
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-2"
                onClick={handleCnpjSave}
                disabled={isSaving || cnpj === (client.cnpj || '')}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Datas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Venda
            </p>
            <p className="text-sm font-medium">
              {client.data_venda
                ? new Date(client.data_venda).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : 'Não informada'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Prazo Onboarding
            </p>
            <p className="text-sm font-medium">
              {client.data_prazo
                ? new Date(client.data_prazo).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : 'Não definido'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Métricas da Reunião
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Qtd. Reuniões
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={metrics.qtd_reunioes}
                onChange={(e) => setMetrics((p) => ({ ...p, qtd_reunioes: e.target.value }))}
                placeholder="0"
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-2"
                onClick={() => handleMetricsSave('qtd_reunioes')}
                disabled={
                  isSaving ||
                  (metrics.qtd_reunioes === '' ? 0 : Number(metrics.qtd_reunioes)) ===
                    (client.qtd_reunioes || 0)
                }
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Horas Est. / Reunião
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="any"
                value={metrics.horas_estimadas_reuniao}
                onChange={(e) =>
                  setMetrics((p) => ({ ...p, horas_estimadas_reuniao: e.target.value }))
                }
                placeholder="0"
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-2"
                onClick={() => handleMetricsSave('horas_estimadas_reuniao')}
                disabled={
                  isSaving ||
                  (metrics.horas_estimadas_reuniao === ''
                    ? 0
                    : Number(metrics.horas_estimadas_reuniao)) ===
                    (client.horas_estimadas_reuniao || 0)
                }
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Horas Acumuladas
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="any"
                value={metrics.horas_acumuladas}
                onChange={(e) => setMetrics((p) => ({ ...p, horas_acumuladas: e.target.value }))}
                placeholder="0"
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-2"
                onClick={() => handleMetricsSave('horas_acumuladas')}
                disabled={
                  isSaving ||
                  (metrics.horas_acumuladas === '' ? 0 : Number(metrics.horas_acumuladas)) ===
                    (client.horas_acumuladas || 0)
                }
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Contrato & Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Valor do Contrato
            </span>
            <span className="text-sm font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                client.valor_contrato || 0,
              )}
            </span>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Produtos Contratados
            </p>
            {products.length > 0 ? (
              <ul className="space-y-2.5">
                {products.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded-md"
                  >
                    <span className="font-medium">{p.nome}</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {p.recorrencia}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nenhum produto registrado</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
