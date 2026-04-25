import { DateRange } from 'react-day-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/date-range-picker'

interface FilterBarProps {
  implementers: string[]
  implementerFilter: string
  setImplementerFilter: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  dateRange: DateRange | undefined
  setDateRange: (val: DateRange | undefined) => void
  datePreset: string
  setDatePreset: (val: string) => void
  onClearFilters: () => void
}

export function FilterBar({
  implementers,
  implementerFilter,
  setImplementerFilter,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  datePreset,
  setDatePreset,
  onClearFilters,
}: FilterBarProps) {
  const statuses = [
    { label: 'Pendente', value: 'pendente' },
    { label: 'Agendada', value: 'agendado' },
    { label: 'Em Implantação', value: 'em_andamento' },
    { label: 'Atrasado', value: 'atrasado' },
    { label: 'Concluído', value: 'concluido' },
  ]

  const hasFilters =
    implementerFilter !== 'all' ||
    statusFilter !== 'all' ||
    dateRange !== undefined ||
    datePreset !== 'all'

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center flex-wrap dark:bg-slate-950">
      <div className="w-full sm:w-[200px]">
        <Select value={implementerFilter} onValueChange={setImplementerFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Implantador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Implantadores</SelectItem>
            {implementers.map((imp) => (
              <SelectItem key={imp} value={imp}>
                {imp}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[200px]">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[200px]">
        <Select value={datePreset} onValueChange={setDatePreset}>
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o período</SelectItem>
            <SelectItem value="last7">Últimos 7 dias</SelectItem>
            <SelectItem value="last30">Últimos 30 dias</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {datePreset === 'custom' && (
        <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full sm:w-auto" />
      )}

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={onClearFilters}
          className="ml-auto text-muted-foreground hover:text-foreground w-full sm:w-auto"
        >
          Limpar Filtros
        </Button>
      )}
    </div>
  )
}
