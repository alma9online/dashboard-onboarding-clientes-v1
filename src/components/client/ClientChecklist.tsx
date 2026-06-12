import { useState } from 'react'
import { CheckCircle2, Edit2, Plus } from 'lucide-react'

import { Task } from '@/types'
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
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

interface ClientChecklistProps {
  tasks: Task[]
  onToggleTask: (id: string) => void
  onAddTask: (titulo: string, descricao: string) => Promise<void>
  onEditTask: (id: string, titulo: string, descricao: string) => Promise<void>
}

export function ClientChecklist({
  tasks,
  onToggleTask,
  onAddTask,
  onEditTask,
}: ClientChecklistProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingTaskTitle, setEditingTaskTitle] = useState('')
  const [editingTaskDesc, setEditingTaskDesc] = useState('')

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const completedTasksCount = tasks.filter((t) => t.concluido).length
  const totalTasksCount = tasks.length
  const progressPercentage =
    totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100)

  const handsysTasks = tasks.filter((t) => t.sistema === 'Handsys')
  const generalTasks = tasks.filter((t) => t.sistema !== 'Handsys')

  const renderTask = (task: Task) => (
    <div
      key={task.id}
      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.concluido}
        onCheckedChange={() => onToggleTask(task.id)}
        className="mt-1 shrink-0"
      />
      <div className="flex-1 space-y-1">
        <Label
          htmlFor={`task-${task.id}`}
          className={cn(
            'text-sm font-medium leading-relaxed cursor-pointer transition-colors block',
            task.concluido ? 'line-through text-muted-foreground' : 'text-foreground',
          )}
        >
          {task.titulo}
        </Label>
        {task.descricao && <p className="text-xs text-muted-foreground">{task.descricao}</p>}
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
  )

  const handleAddTask = async () => {
    setFieldErrors({})
    try {
      await onAddTask(newTaskTitle, newTaskDesc)
      setNewTaskTitle('')
      setNewTaskDesc('')
      setIsAddTaskOpen(false)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
    }
  }

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task)
    setEditingTaskTitle(task.titulo)
    setEditingTaskDesc(task.descricao)
    setFieldErrors({})
    setIsEditTaskOpen(true)
  }

  const handleSaveEditTask = async () => {
    if (!editingTask) return
    setFieldErrors({})
    try {
      await onEditTask(editingTask.id, editingTaskTitle, editingTaskDesc)
      setIsEditTaskOpen(false)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
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

          <div className="space-y-6">
            {generalTasks.length > 0 || handsysTasks.length === 0 ? (
              <div className="space-y-3">
                {handsysTasks.length > 0 && (
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
                    Checklist Geral
                  </h3>
                )}
                {generalTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma tarefa cadastrada.</p>
                  </div>
                ) : (
                  generalTasks.map(renderTask)
                )}
              </div>
            ) : null}

            {handsysTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2 border-t pt-4">
                  Checklist Handsys
                </h3>
                {handsysTasks.map(renderTask)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ex: Realizar importação de dados..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
              />
              {fieldErrors.titulo && (
                <span className="text-red-500 text-xs">{fieldErrors.titulo}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Detalhes da tarefa..."
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTask}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editingTaskTitle}
                onChange={(e) => setEditingTaskTitle(e.target.value)}
                autoFocus
              />
              {fieldErrors.titulo && (
                <span className="text-red-500 text-xs">{fieldErrors.titulo}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={editingTaskDesc}
                onChange={(e) => setEditingTaskDesc(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEditTask()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditTask}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
