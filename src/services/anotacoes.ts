import pb from '@/lib/pocketbase/client'
import type { ClientNote } from '@/types'

export const getAnotacoesByCliente = async (clienteId: string) => {
  return pb.collection('anotacoes_clientes').getFullList<ClientNote>({
    filter: `cliente_id = "${clienteId}"`,
    expand: 'usuario_id',
    sort: '-created',
  })
}

export const createAnotacao = async (data: Partial<ClientNote>) => {
  return pb.collection('anotacoes_clientes').create<ClientNote>(data)
}
