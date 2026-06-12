import pb from '@/lib/pocketbase/client'
import type { Client } from '@/types'

export const getClientes = async (filter: string = '') => {
  return pb.collection('clientes').getFullList<Client>({
    filter,
    expand: 'implantador_id,implantador_secundario_id',
    sort: '-created',
  })
}

export const getCliente = async (id: string) => {
  return pb.collection('clientes').getOne<Client>(id, {
    expand: 'implantador_id,implantador_secundario_id',
  })
}

export const updateCliente = async (id: string, data: Partial<Client>) => {
  return pb.collection('clientes').update<Client>(id, data)
}

export const createCliente = async (data: Partial<Client>) => {
  return pb.collection('clientes').create<Client>(data)
}
