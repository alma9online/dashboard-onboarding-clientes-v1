import { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'

import { Client } from '@/types'
import { mockClients } from '@/data/mock'
import { useSearch } from '@/contexts/SearchContext'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { FilterBar } from '@/components/dashboard/filter-bar'
import { ClientsTable } from '@/components/dashboard/clients-table'

const ITEMS_PER_PAGE = 10

export default function Index() {
  const { search } = useSearch()

  const [clients] = useState<Client[]>(mockClients)
  const [implementerFilter, setImplementerFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client; direction: 'asc' | 'desc' }>({
    key: 'deadline',
    direction: 'asc',
  })
  const [currentPage, setCurrentPage] = useState(1)

  const implementers = useMemo(() => {
    return Array.from(new Set(clients.map((c) => c.implementer))).sort()
  }, [clients])

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchSearch = client.companyName.toLowerCase().includes(search.toLowerCase())
      const matchImplementer =
        implementerFilter === 'all' || client.implementer === implementerFilter
      const matchStatus = statusFilter === 'all' || client.status === statusFilter

      let matchDate = true
      if (dateRange?.from) {
        const deadlineDate = new Date(client.deadline)
        if (dateRange.to) {
          matchDate = deadlineDate >= dateRange.from && deadlineDate <= dateRange.to
        } else {
          matchDate = deadlineDate.toDateString() === dateRange.from.toDateString()
        }
      }

      return matchSearch && matchImplementer && matchStatus && matchDate
    })
  }, [clients, search, implementerFilter, statusFilter, dateRange])

  const sortedClients = useMemo(() => {
    const sortableClients = [...filteredClients]
    return sortableClients.sort((a, b) => {
      if (sortConfig.key === 'deadline') {
        const timeA = new Date(a.deadline).getTime()
        const timeB = new Date(b.deadline).getTime()
        return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA
      }
      if (sortConfig.key === 'companyName') {
        return sortConfig.direction === 'asc'
          ? a.companyName.localeCompare(b.companyName)
          : b.companyName.localeCompare(a.companyName)
      }
      return 0
    })
  }, [filteredClients, sortConfig])

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedClients.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedClients, currentPage])

  const totalPages = Math.ceil(sortedClients.length / ITEMS_PER_PAGE)

  const summaryMetrics = useMemo(() => {
    return {
      total: clients.length,
      scheduled: clients.filter((c) => c.status === 'Agendada').length,
      delayed: clients.filter((c) => c.status === 'Atrasado').length,
      completed: clients.filter((c) => c.status === 'Concluído').length,
    }
  }, [clients])

  const handleSort = (key: keyof Client) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setImplementerFilter('all')
    setStatusFilter('all')
    setDateRange(undefined)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Visão Geral
        </h2>
        <p className="text-muted-foreground">
          Acompanhe o status e os prazos das implantações ativas.
        </p>
      </div>

      <SummaryCards {...summaryMetrics} />

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
          setDateRange={(v) => {
            setDateRange(v)
            setCurrentPage(1)
          }}
          onClearFilters={handleClearFilters}
        />
        <ClientsTable
          clients={paginatedClients}
          sortConfig={sortConfig}
          onSort={handleSort}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
