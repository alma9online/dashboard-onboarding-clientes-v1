import { useEffect, useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { format, subDays } from 'date-fns'

import { Download, RefreshCw } from 'lucide-react'
import { Client, Task } from '@/types'
import { useSearch } from '@/contexts/SearchContext'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { FilterBar } from '@/components/dashboard/filter-bar'
import { ClientsTable } from '@/components/dashboard/clients-table'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { getClientes } from '@/services/clientes'
import { getTarefas } from '@/services/tarefas'
import { useRealtime } from '@/hooks/use-realtime'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { cn, formatStatus } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

const formatPbDate = (d: Date, endOfDay: boolean = false) => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const t = endOfDay ? '23:59:59' : '00:00:00'
  return `${y}-${m}-${day} ${t}.000Z`
}

export default function Index() {
  const { search } = useSearch()
  const { toast } = useToast()

  const [clients, setClients] = useState<Client[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [metrics, setMetrics] = useState({ total: 0, scheduled: 0, delayed: 0, completed: 0 })
  const [implementers, setImplementers] = useState<string[]>([])

  const [implementerFilter, setImplementerFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [datePreset, setDatePreset] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client; direction: 'asc' | 'desc' }>({
    key: 'data_prazo',
    direction: 'asc',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSyncRD = async () => {
    setIsSyncing(true)
    try {
      const res = await pb.send('/backend/v1/sync-rd-station', {
        method: 'POST',
        headers: {
          Authorization: pb.authStore.token,
        },
      })
      toast({
        title: 'Sincronização Concluída',
        description: `${res.synced_count} novos clientes foram importados do RD Station.`,
      })
      loadData()
      loadSummary()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro na Sincronização',
        description:
          err.response?.message ||
          err.message ||
          'Falha ao sincronizar com o RD Station. Verifique se a API Key está configurada.',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const filterStr = []
      if (search) {
        filterStr.push(`nome ~ "${search.replace(/"/g, '\\"')}"`)
      }
      if (implementerFilter !== 'all') {
        if (implementerFilter === 'Não atribuído') {
          filterStr.push(`implantador_id = ""`)
        } else {
          filterStr.push(`implantador_id.name = "${implementerFilter.replace(/"/g, '\\"')}"`)
        }
      }
      if (statusFilter !== 'all') {
        filterStr.push(`status_onboarding = "${statusFilter}"`)
      }
      if (dateRange?.from) {
        const fromIso = formatPbDate(dateRange.from, false)
        if (dateRange.to) {
          const toIso = formatPbDate(dateRange.to, true)
          filterStr.push(`created >= "${fromIso}" && created <= "${toIso}"`)
        } else {
          const toIso = formatPbDate(dateRange.from, true)
          filterStr.push(`created >= "${fromIso}" && created <= "${toIso}"`)
        }
      }

      const records = await getClientes(filterStr.join(' && '))
      setClients(records)

      const allTasks = await getTarefas()
      setTasks(allTasks)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const allClients = await getClientes('')
      setMetrics({
        total: allClients.length,
        scheduled: allClients.filter((c) => c.status_onboarding === 'agendado').length,
        delayed: allClients.filter((c) => c.status_onboarding === 'atrasado').length,
        completed: allClients.filter((c) => c.status_onboarding === 'concluido').length,
      })
      const imps = Array.from(
        new Set(allClients.map((c) => c.expand?.implantador_id?.name || 'Não atribuído')),
      ).sort()
      setImplementers(imps)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [search, implementerFilter, statusFilter, dateRange])

  useEffect(() => {
    loadSummary()
  }, [])

  useRealtime('clientes', () => {
    loadData()
    loadSummary()
  })
  useRealtime('tarefas_onboarding', () => {
    loadData()
  })

  const sortedClients = useMemo(() => {
    const sortableClients = [...clients]
    return sortableClients.sort((a, b) => {
      if (sortConfig.key === 'data_prazo') {
        const timeA = a.data_prazo ? new Date(a.data_prazo).getTime() : Infinity
        const timeB = b.data_prazo ? new Date(b.data_prazo).getTime() : Infinity
        return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA
      }
      if (sortConfig.key === 'nome') {
        return sortConfig.direction === 'asc'
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      }
      return 0
    })
  }, [clients, sortConfig])

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedClients.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedClients, currentPage])

  const totalPages = Math.ceil(sortedClients.length / ITEMS_PER_PAGE) || 1

  const handleSort = (key: any) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
    setCurrentPage(1)
  }

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset)
    if (preset === 'last7') {
      setDateRange({ from: subDays(new Date(), 7), to: new Date() })
    } else if (preset === 'last30') {
      setDateRange({ from: subDays(new Date(), 30), to: new Date() })
    } else if (preset === 'all') {
      setDateRange(undefined)
    }
    setCurrentPage(1)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    setDatePreset('custom')
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setImplementerFilter('all')
    setStatusFilter('all')
    setDatePreset('all')
    setDateRange(undefined)
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    const headers = [
      'Client Name',
      'Email',
      'Sale Date',
      'Contract Value',
      'Onboarding Status',
      'Progress Percentage',
      'Assigned Implementer',
    ]

    const rows = clients.map((c) => {
      const clientTasks = tasks.filter((t) => t.cliente_id === c.id)
      const completed = clientTasks.filter((t) => t.concluido).length
      const progress =
        clientTasks.length > 0 ? Math.round((completed / clientTasks.length) * 100) : 0

      return [
        `"${c.nome.replace(/"/g, '""')}"`,
        `"${c.email || ''}"`,
        `"${c.data_venda ? format(new Date(c.data_venda), 'dd/MM/yyyy') : ''}"`,
        c.valor_contrato || 0,
        `"${formatStatus(c.status_onboarding)}"`,
        `${progress}%`,
        `"${c.expand?.implantador_id?.name || 'Não atribuído'}"`,
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_onboarding_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Visão Geral
          </h2>
          <p className="text-muted-foreground">
            Acompanhe o status e os prazos das implantações ativas.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExportCSV} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handleSyncRD} disabled={isSyncing} className="w-full sm:w-auto">
            <RefreshCw className={cn('mr-2 h-4 w-4', isSyncing && 'animate-spin')} />
            Sincronizar RD
          </Button>
        </div>
      </div>

      <SummaryCards {...metrics} />

      {!isLoading && clients.length > 0 && <DashboardCharts clients={clients} tasks={tasks} />}

      <div className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Pipeline de Clientes
        </h3>
        <FilterBar
          implementers={implementers}
          implementerFilter={implementerFilter}
          setImplementerFilter={(v) => {
            setImplementerFilter(v)
            setCurrentPage(1)
          }}
          statusFilter={statusFilter}
          setStatusFilter={(v) => {
            setStatusFilter(v)
            setCurrentPage(1)
          }}
          dateRange={dateRange}
          setDateRange={handleDateRangeChange}
          datePreset={datePreset}
          setDatePreset={handlePresetChange}
          onClearFilters={handleClearFilters}
        />
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ClientsTable
            clients={paginatedClients}
            sortConfig={sortConfig}
            onSort={handleSort}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}
