import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { Client, Task, Activity, User } from '@/types'
import { Button } from '@/components/ui/button'
import { ClientHeader } from '@/components/client/ClientHeader'
import { ClientChecklist } from '@/components/client/ClientChecklist'
import { ClientHistory } from '@/components/client/ClientHistory'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCliente, updateCliente } from '@/services/clientes'
import { getTarefasByCliente, createTarefa, updateTarefa } from '@/services/tarefas'
import { getAtividadesByCliente, createAtividade } from '@/services/atividades'
import { getUsers } from '@/services/users'
import { Skeleton } from '@/components/ui/skeleton'

export default function ClientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [client, setClient] = useState<Client | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [users, setUsers] = useState<User[]>([])

  const loadData = async () => {
    if (!id) return
    try {
      const clientData = await getCliente(id)
      setClient(clientData)
      const tasksData = await getTarefasByCliente(id)
      setTasks(tasksData)
      const actsData = await getAtividadesByCliente(id)
      setActivities(actsData)
      const usersData = await getUsers()
      setUsers(usersData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useRealtime('clientes', loadData)
  useRealtime('tarefas_onboarding', loadData)
  useRealtime('atividades', loadData)

  if (!client) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-pulse">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const isCompleted = !task.concluido
    const dataConclusao = isCompleted ? new Date().toISOString() : ''
    await updateTarefa(taskId, { concluido: isCompleted, data_conclusao: dataConclusao })
    await createAtividade({
      cliente_id: id,
      usuario_id: user.id,
      tipo_atividade: 'tarefa',
      descricao: `Tarefa "${task.titulo}" marcada como ${isCompleted ? 'concluída' : 'pendente'}`,
    })
  }

  const handleAddTask = async (titulo: string, descricao: string) => {
    await createTarefa({
      cliente_id: id,
      titulo,
      descricao,
      concluido: false,
    })
  }

  const handleEditTask = async (taskId: string, titulo: string, descricao: string) => {
    await updateTarefa(taskId, { titulo, descricao })
  }

  const handleAssignSpecialist = async (specialistId: string) => {
    await updateCliente(id!, { implantador_id: specialistId })
    const userAssigned = users.find((u) => u.id === specialistId)
    await createAtividade({
      cliente_id: id,
      usuario_id: user.id,
      tipo_atividade: 'system',
      descricao: `Implantador alterado para ${userAssigned?.name || 'Desconhecido'}`,
    })
  }

  const handleAddNote = async (text: string) => {
    await createAtividade({
      cliente_id: id,
      usuario_id: user.id,
      tipo_atividade: 'nota',
      descricao: text,
    })
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      <ClientHeader client={client} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ClientChecklist
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />
        </div>

        <div className="space-y-6">
          <ClientHistory
            client={client}
            activities={activities}
            users={users}
            onAssignSpecialist={handleAssignSpecialist}
            onAddNote={handleAddNote}
          />
        </div>
      </div>
    </div>
  )
}
