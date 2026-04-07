import pb from '@/lib/pocketbase/client'
import type { User } from '@/types'

export const getUsers = async () => {
  return pb.collection('users').getFullList<User>({
    sort: 'name',
  })
}
