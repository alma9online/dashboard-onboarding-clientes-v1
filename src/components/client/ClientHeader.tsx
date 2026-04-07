import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building, Calendar, Clock, DollarSign, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Client } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ClientHeaderProps {
  client: Client
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const navigate = useNavigate()

  return (
    <>
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-full shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{client.nome}</h1>
          <div className="flex items-center mt-1 space-x-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4 shrink-0" />
            <span className="truncate">Detalhes do Onboarding</span>
          </div>
        </div>
        <div className="shrink-0">
          <Badge
            variant="outline"
            className={cn('px-3 py-1 font-medium text-sm', statusStyles[client.status_onboarding])}
          >
            {formatStatus(client.status_onboarding)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Email de Contato</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate" title={client.email}>
              {client.email || '-'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Data da Venda</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {client.data_venda
                ? format(new Date(client.data_venda), "dd 'de' MMM, yyyy", { locale: ptBR })
                : '-'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Prazo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {client.data_prazo
                ? format(new Date(client.data_prazo), 'dd/MM/yyyy', { locale: ptBR })
                : '-'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Valor do Contrato</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {client.valor_contrato ? formatCurrency(client.valor_contrato) : formatCurrency(0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
