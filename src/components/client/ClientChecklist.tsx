import { useState } from 'react'
import { CheckCircle2, Edit2, Plus } from 'lucide-react'

import { Client, Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ClientChecklistProps {
  client: Client
  onToggleTask: (id: string) => void
  onAddTask: (desc: string) => void
  onEditTask: (id: string, desc: string) => void
}

export function ClientChecklist({
  client,
  onToggleTask,
  onAddTask,
  onEditTask,
}: ClientChecklistProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)

  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingTaskDesc, setEditingTaskDesc] = useState('')

  const completedTasksCount = client.tasks.filter((t) => t.completed).length
  const totalTasksCount = client.tasks.length
  const progressPercentage =
    totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100)

  const handleAddTask = () => {
    if (newTaskDesc.trim()) {
      onAddTask(newTaskDesc)
      setNewTaskDesc('')
      setIsAddTaskOpen(false)
    }
  }

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task)
    setEditingTaskDesc(task.description)
    setIsEditTaskOpen(true)
  }

  const handleSaveEditTask = () => {
    if (editingTask && editingTaskDesc.trim()) {
      onEditTask(editingTask.id, editingTaskDesc)
      setIsEditTaskOpen(false)
    }
  }

  return (
    <>
      <Card className="h-full border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
              Checklist de Implantação
            </CardTitle>
            <CardDescription className="mt-1">
              Progresso: {completedTasksCount} de {totalTasksCount} tarefas ({progressPercentage}%)
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddTaskOpen(true)} size="sm" className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
          </Button>
          <Button onClick={() => setIsAddTaskOpen(true)} size="icon" className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="space-y-3">
            {client.tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma tarefa cadastrada.</p>
              </div>
            ) : (
              client.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => onToggleTask(task.id)}
                    className="mt-1 shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        'text-sm font-medium leading-relaxed cursor-pointer transition-colors block',
                        task.completed ? 'line-through text-muted-foreground' : 'text-foreground',
                      )}
                    >
                      {task.description}
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleOpenEdit(task)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Descrição da Tarefa</Label>
            <Input
              placeholder="Ex: Realizar importação de dados..."
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTask} disabled={!newTaskDesc.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Descrição da Tarefa</Label>
            <Input
              value={editingTaskDesc}
              onChange={(e) => setEditingTaskDesc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEditTask()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditTask} disabled={!editingTaskDesc.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
