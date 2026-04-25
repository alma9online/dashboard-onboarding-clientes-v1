import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Client, Task } from '@/types'

interface DashboardChartsProps {
  clients: Client[]
  tasks: Task[]
}

export function DashboardCharts({ clients, tasks }: DashboardChartsProps) {
  const { progressData, implementerData, statusData } = useMemo(() => {
    const pData = clients
      .map((c) => {
        const clientTasks = tasks.filter((t) => t.cliente_id === c.id)
        const completed = clientTasks.filter((t) => t.concluido).length
        const progress =
          clientTasks.length > 0 ? Math.round((completed / clientTasks.length) * 100) : 0
        return { name: c.nome, progress }
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 10)

    const impCount = clients.reduce(
      (acc, c) => {
        const imp = c.expand?.implantador_id?.name || 'Não atribuído'
        acc[imp] = (acc[imp] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    const iData = Object.entries(impCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const statusCount = clients.reduce(
      (acc, c) => {
        acc[c.status_onboarding] = (acc[c.status_onboarding] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    const sData = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      fill: `var(--color-${status})`,
    }))

    return { progressData: pData, implementerData: iData, statusData: sData }
  }, [clients, tasks])

  const statusConfig = {
    count: { label: 'Clientes' },
    pendente: { label: 'Pendente', color: 'hsl(215 16% 47%)' },
    agendado: { label: 'Agendada', color: 'hsl(38 92% 50%)' },
    em_andamento: { label: 'Em implantação', color: 'hsl(221 83% 53%)' },
    atrasado: { label: 'Atrasado', color: 'hsl(348 83% 47%)' },
    concluido: { label: 'Concluído', color: 'hsl(142 71% 45%)' },
  }

  const progressConfig = {
    progress: { label: 'Progresso (%)', color: 'hsl(var(--primary))' },
  }

  const implementerConfig = {
    count: { label: 'Clientes', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Progresso de Implantação (Top 10)</CardTitle>
          <CardDescription>Percentual de tarefas concluídas por cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={progressConfig} className="h-[300px] w-full">
            <BarChart data={progressData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                width={120}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="progress"
                fill="var(--color-progress)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status dos Clientes</CardTitle>
          <CardDescription>Distribuição geral por status</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={statusConfig} className="h-[300px] w-full">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={statusConfig[entry.status as keyof typeof statusConfig]?.color}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-3">
        <CardHeader>
          <CardTitle>Clientes por Implantador</CardTitle>
          <CardDescription>Volume de clientes atribuídos a cada membro da equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={implementerConfig} className="h-[300px] w-full">
            <BarChart data={implementerData} margin={{ top: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
