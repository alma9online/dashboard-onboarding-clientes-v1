import { useState } from 'react'
import { format } from 'date-fns'

import { ClientNote } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ClientNotesProps {
  notes: ClientNote[]
  onAddNote: (text: string) => void
}

export function ClientNotes({ notes, onAddNote }: ClientNotesProps) {
  const [newNote, setNewNote] = useState('')

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote)
      setNewNote('')
    }
  }

  return (
    <Card className="h-full border-slate-200 dark:border-slate-800">
      <CardContent className="p-6 flex flex-col h-[500px]">
        <div className="flex space-x-2 shrink-0 mb-4">
          <Input
            placeholder="Escreva uma anotação sobre o cliente..."
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
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhuma anotação cadastrada para este cliente.
              </p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border bg-card p-4 shadow-sm animate-fade-in"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {note.expand?.usuario_id?.name || 'Usuário Desconhecido'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.created), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {note.texto}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
