import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { Client, Task } from '@/types'
import { mockClients, mockSpecialists } from '@/data/mock'
import { Button } from '@/components/ui/button'
import { ClientHeader } from '@/components/client/ClientHeader'
import { ClientChecklist } from '@/components/client/ClientChecklist'
import { ClientHistory } from '@/components/client/ClientHistory'

export default function ClientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    const found = mockClients.find((c) => c.id === id)
    if (found) {
      setClient({ ...found })
    }
  }, [id])

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h2 className="text-2xl font-semibold">Cliente não encontrado</h2>
        <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
      </div>
    )
  }

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = client.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t,
    )
    const task = updatedTasks.find((t) => t.id === taskId)
    setClient({
      ...client,
      tasks: updatedTasks,
      activities: [
        {
          id: Math.random().toString(),
          date: new Date().toISOString(),
          description: `Tarefa "${task?.description}" marcada como ${task?.completed ? 'concluída' : 'pendente'}`,
          type: 'user',
        },
        ...client.activities,
      ],
    })
  }

  const handleAddTask = (desc: string) => {
    const newTask: Task = {
      id: Math.random().toString(),
      description: desc,
      completed: false,
    }
    setClient({
      ...client,
      tasks: [...client.tasks, newTask],
    })
  }

  const handleEditTask = (taskId: string, desc: string) => {
    const updatedTasks = client.tasks.map((t) =>
      t.id === taskId ? { ...t, description: desc } : t,
    )
    setClient({
      ...client,
      tasks: updatedTasks,
    })
  }

  const handleAssignSpecialist = (specialistId: string) => {
    const specialist = mockSpecialists.find((s) => s.id === specialistId)
    if (specialist) {
      setClient({
        ...client,
        implementer: specialist.name,
        implementerAvatar: specialist.avatar,
        activities: [
          {
            id: Math.random().toString(),
            date: new Date().toISOString(),
            description: `Implantador alterado para ${specialist.name}`,
            type: 'system',
          },
          ...client.activities,
        ],
      })
    }
  }

  const handleAddNote = (text: string) => {
    setClient({
      ...client,
      notes: [
        {
          id: Math.random().toString(),
          date: new Date().toISOString(),
          text,
          author: 'Usuário Atual',
        },
        ...client.notes,
      ],
    })
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      <ClientHeader client={client} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ClientChecklist
            client={client}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />
        </div>

        <div className="space-y-6">
          <ClientHistory
            client={client}
            specialists={mockSpecialists}
            onAssignSpecialist={handleAssignSpecialist}
            onAddNote={handleAddNote}
          />
        </div>
      </div>
    </div>
  )
}
