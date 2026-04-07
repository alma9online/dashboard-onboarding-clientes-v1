import pb from '@/lib/pocketbase/client'
import { Client, Task, Activity, User } from '@/types'

export const getClientes = async (filter: string = '') => {
  return pb
    .collection('clientes')
    .getFullList<Client>({ filter, expand: 'implantador_id', sort: '-created' })
}

export const getCliente = async (id: string) => {
  return pb.collection('clientes').getOne<Client>(id, { expand: 'implantador_id' })
}

export const updateCliente = async (id: string, data: Partial<Client>) => {
  return pb.collection('clientes').update<Client>(id, data)
}

export const getTarefasByCliente = async (clienteId: string) => {
  return pb
    .collection('tarefas_onboarding')
    .getFullList<Task>({ filter: `cliente_id = "${clienteId}"`, sort: 'created' })
}

export const createTarefa = async (data: Partial<Task>) => {
  return pb.collection('tarefas_onboarding').create<Task>(data)
}

export const updateTarefa = async (id: string, data: Partial<Task>) => {
  return pb.collection('tarefas_onboarding').update<Task>(id, data)
}

export const getAtividadesByCliente = async (clienteId: string) => {
  return pb
    .collection('atividades')
    .getFullList<Activity>({
      filter: `cliente_id = "${clienteId}"`,
      sort: '-created',
      expand: 'usuario_id',
    })
}

export const createAtividade = async (data: Partial<Activity>) => {
  return pb.collection('atividades').create<Activity>(data)
}

export const getUsers = async () => {
  return pb.collection('users').getFullList<User>({ sort: 'name' })
}
