import { Clock, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'

import { Activity } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ClientHistoryProps {
  activities: Activity[]
}

export function ClientHistory({ activities }: ClientHistoryProps) {
  const systemActs = activities.filter((a) => a.tipo_atividade !== 'nota')

  return (
    <Card className="h-full border-slate-200 dark:border-slate-800">
      <CardContent className="p-6 h-[500px] flex flex-col">
        <ScrollArea className="flex-1 border rounded-md p-6 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-2">
            {systemActs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8 -ml-6">
                Nenhuma atividade registrada no histórico.
              </p>
            ) : (
              systemActs.map((activity) => (
                <div key={activity.id} className="relative animate-fade-in-up">
                  <span className="absolute -left-[37px] flex items-center justify-center w-6 h-6 rounded-full border bg-white dark:bg-slate-950 text-slate-500 shadow-sm z-10">
                    {activity.tipo_atividade === 'system' ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <UserIcon className="h-3 w-3" />
                    )}
                  </span>
                  <div className="rounded-lg border bg-card p-3 shadow-sm">
                    <div className="font-medium text-xs text-primary mb-1 flex justify-between">
                      <span>{format(new Date(activity.created), 'dd/MM/yyyy HH:mm')}</span>
                      {activity.expand?.usuario_id && (
                        <span className="text-muted-foreground font-normal">
                          {activity.expand.usuario_id.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {activity.descricao}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
