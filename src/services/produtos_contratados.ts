import pb from '@/lib/pocketbase/client'
import { ProdutoContratado } from '@/types'

export const getProdutosByCliente = (clienteId: string) => {
  return pb.collection('produtos_contratados').getFullList<ProdutoContratado>({
    filter: `cliente_id = "${clienteId}"`,
    sort: 'created',
  })
}
