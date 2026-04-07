import { Users, Calendar as CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  total: number
  scheduled: number
  delayed: number
  completed: number
}

export function SummaryCards({ total, scheduled, delayed, completed }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total em Onboarding',
      value: total,
      icon: Users,
      color: 'border-t-indigo-500',
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Implantação Agendada',
      value: scheduled,
      icon: CalendarIcon,
      color: 'border-t-amber-500',
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Clientes Atrasados',
      value: delayed,
      icon: AlertCircle,
      color: 'border-t-red-500',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Clientes Concluídos',
      value: completed,
      icon: CheckCircle2,
      color: 'border-t-emerald-500',
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card
          key={card.title}
          className={cn(
            'animate-fade-in-up rounded-xl border-t-2 shadow-sm dark:bg-slate-950',
            card.color,
          )}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  card.bgColor,
                  card.iconColor,
                  'dark:bg-opacity-10',
                )}
              >
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
