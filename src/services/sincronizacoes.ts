import pb from '@/lib/pocketbase/client'
import { SyncHistory } from '@/types'

export const getSyncHistory = async () => {
  return pb.collection('sincronizacoes').getList<SyncHistory>(1, 10, {
    sort: '-created',
    expand: 'executado_por',
  })
}

export const syncRdStation = async (): Promise<{
  status: string
  clientes_novos: number
  clientes_atualizados: number
}> => {
  return pb.send('/backend/v1/sync-rd-station', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pb.authStore.token}`,
    },
  })
}
