import pb from '@/lib/pocketbase/client'
import type { Task } from '@/types'

export const getTarefas = async (filter: string = '') => {
  return pb.collection('tarefas_onboarding').getFullList<Task>({
    filter,
    sort: '-created',
  })
}

export const getTarefasByCliente = async (clienteId: string) => {
  return pb.collection('tarefas_onboarding').getFullList<Task>({
    filter: `cliente_id = "${clienteId}"`,
    sort: '-created',
  })
}

export const getTarefa = async (id: string) => {
  return pb.collection('tarefas_onboarding').getOne<Task>(id)
}

export const createTarefa = async (data: Partial<Task>) => {
  return pb.collection('tarefas_onboarding').create<Task>(data)
}

export const updateTarefa = async (id: string, data: Partial<Task>) => {
  return pb.collection('tarefas_onboarding').update<Task>(id, data)
}

export const deleteTarefa = async (id: string) => {
  return pb.collection('tarefas_onboarding').delete(id)
}
