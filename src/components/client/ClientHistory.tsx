import { useState } from 'react'
import { Clock, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'

import { Client, Activity, User } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import pb from '@/lib/pocketbase/client'

interface ClientHistoryProps {
  client: Client
  activities: Activity[]
  users: User[]
  onAssignSpecialist: (specialistId: string) => void
  onAddNote: (text: string) => void
}

export function ClientHistory({
  client,
  activities,
  users,
  onAssignSpecialist,
  onAddNote,
}: ClientHistoryProps) {
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('')
  const [newNote, setNewNote] = useState('')

  const notes = activities.filter((a) => a.tipo_atividade === 'nota')
  const systemActs = activities.filter((a) => a.tipo_atividade !== 'nota')

  const handleAssign = () => {
    if (selectedSpecialist) {
      onAssignSpecialist(selectedSpecialist)
      setIsAssignOpen(false)
    }
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote)
      setNewNote('')
    }
  }

  const currentImpl = client.expand?.implantador_id
  const currentImplAvatar = currentImpl?.avatar
    ? pb.files.getUrl(currentImpl, currentImpl.avatar)
    : ''
  const currentImplName = currentImpl?.name || 'Não atribuído'

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            Implantador Responsável
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={currentImplAvatar} />
                <AvatarFallback>{currentImplName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{currentImplName}</p>
                <p className="text-xs text-muted-foreground mt-1">Especialista</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsAssignOpen(true)}>
              Atribuir
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col h-[500px]">
        <CardHeader className="pb-2 shrink-0">
          <CardTitle className="text-base">Histórico e Notas</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
          <Tabs defaultValue="notes" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
              <TabsTrigger value="notes">Notas</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
            </TabsList>

            <TabsContent
              value="notes"
              className="flex-1 flex flex-col min-h-0 m-0 space-y-4 data-[state=inactive]:hidden"
            >
              <div className="flex space-x-2 shrink-0">
                <Input
                  placeholder="Adicione uma nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  Salvar
                </Button>
              </div>
              <ScrollArea className="flex-1 border rounded-md p-4 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="space-y-4 pr-3">
                  {notes.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Nenhuma nota adicionada.
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="rounded-lg border bg-card p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-xs">
                            {note.expand?.usuario_id?.name || 'Sistema'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(note.created), 'dd/MM HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {note.descricao}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="activities"
              className="flex-1 min-h-0 m-0 data-[state=inactive]:hidden"
            >
              <ScrollArea className="h-full border rounded-md p-4 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-2">
                  {systemActs.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4 -ml-6">
                      Nenhuma atividade registrada.
                    </p>
                  ) : (
                    systemActs.map((activity) => (
                      <div key={activity.id} className="relative">
                        <span className="absolute -left-[37px] flex items-center justify-center w-6 h-6 rounded-full border bg-white dark:bg-slate-950 text-slate-500 shadow-sm">
                          {activity.tipo_atividade === 'system' ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <UserIcon className="h-3 w-3" />
                          )}
                        </span>
                        <div className="rounded-lg border bg-card p-3 shadow-sm">
                          <div className="font-medium text-[11px] text-primary mb-1">
                            {format(new Date(activity.created), 'dd/MM/yyyy HH:mm')}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Implantador</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedSpecialist} onValueChange={setSelectedSpecialist}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um implantador" />
              </SelectTrigger>
              <SelectContent>
                {users.map((s) => {
                  const sAvatar = s.avatar ? pb.files.getUrl(s, s.avatar) : ''
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={sAvatar} />
                          <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {s.name}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssign} disabled={!selectedSpecialist}>
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
