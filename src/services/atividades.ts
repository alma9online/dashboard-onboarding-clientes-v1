import pb from '@/lib/pocketbase/client'
import type { Activity } from '@/types'

export const getAtividadesByCliente = async (clienteId: string) => {
  return pb.collection('atividades').getFullList<Activity>({
    filter: `cliente_id = "${clienteId}"`,
    expand: 'usuario_id',
    sort: '-created',
  })
}

export const createAtividade = async (data: Partial<Activity>) => {
  return pb.collection('atividades').create<Activity>(data)
}
